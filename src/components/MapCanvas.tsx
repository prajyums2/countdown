"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, ZoomIn, ZoomOut, Maximize2, MapPin } from "lucide-react";
import type { Station } from "@/lib/types";
import { runTSP, type TSPPoint } from "@/lib/map-ga";
import {
  Spark,
  createInitialPopulation,
  evaluateAndReproduce,
  createObstaclesFromStations,
  type Obstacle,
  type Point,
} from "@/lib/genetic-path";

interface MapStation extends Station {
  x: number;
  y: number;
  isPast: boolean;
}

const TSP_GENS = 100;
const TSP_POP = 200;
const SPARK_POP = 150;
const SPARK_LIFESPAN = 180;
const SPARK_MUTATION = 0.02;
const SPARK_FORCE = 0.35;
const TARGET_RADIUS = 30;
const PIN_RADIUS = 40;
const MIN_SCALE = 0.4;
const MAX_SCALE = 3.0;

export default function MapCanvas({ stations }: { stations: Station[] }) {
  const sorted = useMemo(
    () => [...stations].sort((a, b) => a.orderIndex - b.orderIndex),
    [stations]
  );

  const V_WIDTH = Math.max(1200, sorted.length * 250);
  const V_HEIGHT = 600;

  const [mapStations, setMapStations] = useState<MapStation[]>([]);
  const [scale, setScale] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [gaPhase, setGaPhase] = useState<"idle" | "tsp" | "spark" | "done">("idle");
  const [tspGen, setTspGen] = useState(0);
  const [tspFitness, setTspFitness] = useState(0);
  const [sparkGen, setSparkGen] = useState(0);
  const [sparkRate, setSparkRate] = useState(0);
  const [optimalOrder, setOptimalOrder] = useState<number[] | null>(null);
  const [draggedPinIdx, setDraggedPinIdx] = useState<number | null>(null);
  const [activePinIdx, setActivePinIdx] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapStationsRef = useRef<MapStation[]>([]);
  const scaleRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const gaPhaseRef = useRef<"idle" | "tsp" | "spark" | "done">("idle");
  const tspGenRef = useRef(0);
  const tspOrdersRef = useRef<number[][]>([]);
  const tspDoneRef = useRef(false);
  const optimalOrderRef = useRef<number[] | null>(null);
  const sparkPopRef = useRef<Spark[]>([]);
  const sparkAgeRef = useRef(0);
  const sparkGenRef = useRef(1);
  const dragRef = useRef<{
    active: boolean;
    pinIdx: number | null;
    startScreenX: number;
    startScreenY: number;
    startPanX: number;
    startPanY: number;
    startPinX: number;
    startPinY: number;
    moved: boolean;
  }>({
    active: false,
    pinIdx: null,
    startScreenX: 0,
    startScreenY: 0,
    startPanX: 0,
    startPanY: 0,
    startPinX: 0,
    startPinY: 0,
    moved: false,
  });
  const frameRef = useRef(0);
  const pinchRef = useRef<{
    active: boolean;
    startDist: number;
    startScale: number;
  }>({ active: false, startDist: 0, startScale: 1 });
  const pathDoneRef = useRef(false);

  const obstacles = useMemo(() => {
    if (mapStations.length < 2) return [];
    return createObstaclesFromStations(mapStations);
  }, [mapStations]);

  // ─── Initialize station positions ───
  useEffect(() => {
    const now = new Date();
    const initial = sorted.map((s, i) => {
      const x = 150 + i * ((V_WIDTH - 300) / Math.max(1, sorted.length - 1));
      const y = V_HEIGHT / 2 + Math.sin(i * 1.5) * 150;
      return {
        ...s,
        x,
        y,
        isPast: new Date(s.dateTime).getTime() <= now.getTime(),
      };
    });
    mapStationsRef.current = initial;
    setMapStations(initial);
    const cx = V_WIDTH / 2 - (containerRef.current?.clientWidth || 800) / 2 / 1;
    setPanX(cx);
    panRef.current.x = cx;
  }, [sorted, V_WIDTH, V_HEIGHT]);

  // ─── Screen ↔ World coordinate conversion ───
  const screenToWorld = useCallback(
    (sx: number, sy: number) => ({
      x: (sx - panRef.current.x) / scaleRef.current,
      y: (sy - panRef.current.y) / scaleRef.current,
    }),
    []
  );

  // ─── Find pin under cursor ───
  const hitTestPin = useCallback(
    (wx: number, wy: number): number | null => {
      const stations = mapStationsRef.current;
      for (let i = stations.length - 1; i >= 0; i--) {
        const s = stations[i];
        const dist = Math.hypot(wx - s.x, wy - s.y);
        if (dist < PIN_RADIUS / scaleRef.current) return i;
      }
      return null;
    },
    []
  );

  // ─── Pointer events ───
  const getPointerPos = (e: React.PointerEvent<HTMLCanvasElement>) => ({
    x: e.clientX - (containerRef.current?.getBoundingClientRect().left || 0),
    y: e.clientY - (containerRef.current?.getBoundingClientRect().top || 0),
  });

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const pos = getPointerPos(e);
      const world = screenToWorld(pos.x, pos.y);
      const hitIdx = hitTestPin(world.x, world.y);

      dragRef.current = {
        active: true,
        pinIdx: hitIdx,
        startScreenX: pos.x,
        startScreenY: pos.y,
        startPanX: panRef.current.x,
        startPanY: panRef.current.y,
        startPinX: hitIdx !== null ? mapStationsRef.current[hitIdx].x : 0,
        startPinY: hitIdx !== null ? mapStationsRef.current[hitIdx].y : 0,
        moved: false,
      };

      if (hitIdx !== null) {
        setDraggedPinIdx(hitIdx);
      }
    },
    [screenToWorld, hitTestPin]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!dragRef.current.active) return;
      const pos = getPointerPos(e);
      const dx = pos.x - dragRef.current.startScreenX;
      const dy = pos.y - dragRef.current.startScreenY;
      const threshold = 5;

      if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
        dragRef.current.moved = true;
      }

      if (!dragRef.current.moved) return;

      if (dragRef.current.pinIdx !== null) {
        const wdx = dx / scaleRef.current;
        const wdy = dy / scaleRef.current;
        const stations = [...mapStationsRef.current];
        const idx = dragRef.current.pinIdx;
        stations[idx] = {
          ...stations[idx],
          x: dragRef.current.startPinX + wdx,
          y: dragRef.current.startPinY + wdy,
        };
        mapStationsRef.current = stations;
        setMapStations(stations);
        setOptimalOrder(null);
        optimalOrderRef.current = null;
        pathDoneRef.current = false;
        gaPhaseRef.current = "idle";
        setGaPhase("idle");
      } else {
        panRef.current.x = dragRef.current.startPanX + dx;
        panRef.current.y = dragRef.current.startPanY + dy;
        setPanX(panRef.current.x);
        setPanY(panRef.current.y);
      }
    },
    []
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!dragRef.current.moved && dragRef.current.pinIdx !== null) {
        setActivePinIdx(dragRef.current.pinIdx);
      }
      setDraggedPinIdx(null);
      dragRef.current.active = false;
    },
    []
  );

  // ─── Wheel zoom ───
  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(
      MIN_SCALE,
      Math.min(MAX_SCALE, scaleRef.current * factor)
    );
    const worldX = (mx - panRef.current.x) / scaleRef.current;
    const worldY = (my - panRef.current.y) / scaleRef.current;
    panRef.current.x = mx - worldX * newScale;
    panRef.current.y = my - worldY * newScale;
    scaleRef.current = newScale;
    setScale(newScale);
    setPanX(panRef.current.x);
    setPanY(panRef.current.y);
  }, []);

  // ─── Zoom controls ───
  const zoomIn = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const newScale = Math.min(MAX_SCALE, scaleRef.current * 1.3);
    const worldX = (cx - panRef.current.x) / scaleRef.current;
    const worldY = (cy - panRef.current.y) / scaleRef.current;
    panRef.current.x = cx - worldX * newScale;
    panRef.current.y = cy - worldY * newScale;
    scaleRef.current = newScale;
    setScale(newScale);
    setPanX(panRef.current.x);
    setPanY(panRef.current.y);
  }, []);

  const zoomOut = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const newScale = Math.max(MIN_SCALE, scaleRef.current / 1.3);
    const worldX = (cx - panRef.current.x) / scaleRef.current;
    const worldY = (cy - panRef.current.y) / scaleRef.current;
    panRef.current.x = cx - worldX * newScale;
    panRef.current.y = cy - worldY * newScale;
    scaleRef.current = newScale;
    setScale(newScale);
    setPanX(panRef.current.x);
    setPanY(panRef.current.y);
  }, []);

  const zoomFit = useCallback(() => {
    const stations = mapStationsRef.current;
    if (!stations.length || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const padding = 80;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const s of stations) {
      if (s.x < minX) minX = s.x;
      if (s.x > maxX) maxX = s.x;
      if (s.y < minY) minY = s.y;
      if (s.y > maxY) maxY = s.y;
    }
    const sw = maxX - minX + padding * 2;
    const sh = maxY - minY + padding * 2;
    const newScale = Math.min(
      MAX_SCALE,
      Math.max(MIN_SCALE, Math.min(rect.width / sw, rect.height / sh))
    );
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    panRef.current.x = rect.width / 2 - cx * newScale;
    panRef.current.y = rect.height / 2 - cy * newScale;
    scaleRef.current = newScale;
    setScale(newScale);
    setPanX(panRef.current.x);
    setPanY(panRef.current.y);
  }, []);

  // ─── Touch pinch zoom ───
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      pinchRef.current = { active: true, startDist: dist, startScale: scaleRef.current };
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 2 && pinchRef.current.active) {
      e.preventDefault();
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const factor = dist / pinchRef.current.startDist;
      const newScale = Math.max(
        MIN_SCALE,
        Math.min(MAX_SCALE, pinchRef.current.startScale * factor)
      );
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mx = (t1.clientX + t2.clientX) / 2 - rect.left;
      const my = (t1.clientY + t2.clientY) / 2 - rect.top;
      const worldX = (mx - panRef.current.x) / scaleRef.current;
      const worldY = (my - panRef.current.y) / scaleRef.current;
      panRef.current.x = mx - worldX * newScale;
      panRef.current.y = my - worldY * newScale;
      scaleRef.current = newScale;
      setScale(newScale);
      setPanX(panRef.current.x);
      setPanY(panRef.current.y);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    pinchRef.current.active = false;
  }, []);

  // ─── Run GA Pathfinding ───
  const findOptimalRoute = useCallback(() => {
    const stations = mapStationsRef.current;
    if (stations.length < 2) return;
    pathDoneRef.current = false;
    gaPhaseRef.current = "tsp";
    setGaPhase("tsp");
    setTspGen(0);
    setTspFitness(0);

    const tspPoints: TSPPoint[] = stations.map((s, i) => ({
      id: s.id,
      x: s.x,
      y: s.y,
      index: i,
    }));

    const tspResult = runTSP(tspPoints, TSP_GENS, TSP_POP);

    let genIdx = 0;
    const animateTSP = () => {
      if (genIdx >= tspResult.allOrders.length) {
        optimalOrderRef.current = tspResult.bestOrder;
        setOptimalOrder(tspResult.bestOrder);
        gaPhaseRef.current = "spark";
        setGaPhase("spark");

        const order = tspResult.bestOrder;
        const waypoints = order.map((i) => ({
          x: stations[i].x,
          y: stations[i].y,
        }));

        sparkPopRef.current = createInitialPopulation(
          waypoints[0].x,
          waypoints[0].y,
          SPARK_POP,
          SPARK_LIFESPAN,
          SPARK_FORCE
        );
        sparkAgeRef.current = 0;
        sparkGenRef.current = 1;
        return;
      }

      tspGenRef.current = genIdx;
      setTspGen(genIdx);
      setTspFitness(Math.round(1 / (tspResult.fitnessHistory[genIdx] || 1) * 100));
      genIdx += 2;
      setTimeout(animateTSP, 40);
    };

    animateTSP();
  }, []);

  // ─── Spark GA loop (runs via rAF during spark phase) ───
  useEffect(() => {
    if (gaPhaseRef.current !== "spark") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const stations = mapStationsRef.current;
    const order = optimalOrderRef.current;
    if (!order) return;

    const waypoints = order.map((i) => ({
      x: stations[i].x,
      y: stations[i].y,
    }));
    const obs = createObstaclesFromStations(stations);

    const loop = () => {
      ctx.fillStyle = "rgba(255, 249, 246, 0.2)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.setTransform(scaleRef.current, 0, 0, scaleRef.current, panRef.current.x, panRef.current.y);

      let reached = 0;
      const pop = sparkPopRef.current;
      for (const spark of pop) {
        spark.update(sparkAgeRef.current, waypoints, TARGET_RADIUS, obs, {
          w: V_WIDTH,
          h: V_HEIGHT,
        });
        if (spark.completed) reached++;

        ctx.fillStyle = spark.crashed
          ? "rgba(203, 213, 225, 0.15)"
          : spark.completed
            ? "rgba(244, 114, 182, 0.8)"
            : "rgba(251, 113, 133, 0.4)";
        ctx.beginPath();
        ctx.arc(spark.pos.x, spark.pos.y, spark.completed ? 3 : 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      sparkAgeRef.current++;
      if (sparkAgeRef.current >= SPARK_LIFESPAN) {
        const rate = Math.round((reached / SPARK_POP) * 100);
        setSparkRate(rate);
        setSparkGen(sparkGenRef.current);

        if (rate >= 75 || sparkGenRef.current >= 10) {
          gaPhaseRef.current = "done";
          setGaPhase("done");
          pathDoneRef.current = true;
          ctx.restore();
          return;
        }

        const newPop = evaluateAndReproduce(
          pop,
          waypoints,
          SPARK_LIFESPAN,
          SPARK_MUTATION,
          SPARK_FORCE
        );
        sparkPopRef.current = newPop;
        sparkGenRef.current++;
        sparkAgeRef.current = 0;
      }

      ctx.restore();
      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [gaPhase, V_WIDTH, V_HEIGHT]);

  // ─── Idle rendering loop ───
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.setTransform(scaleRef.current, 0, 0, scaleRef.current, panRef.current.x, panRef.current.y);

      const stations = mapStationsRef.current;
      const order = optimalOrderRef.current;
      const isTsp = gaPhaseRef.current === "tsp";
      const isSpark = gaPhaseRef.current === "spark";
      const isDone = gaPhaseRef.current === "done";

      // Grid
      ctx.strokeStyle = "rgba(251, 207, 232, 0.12)";
      ctx.lineWidth = 1;
      for (let x = 0; x < V_WIDTH; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, V_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y < V_HEIGHT; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(V_WIDTH, y);
        ctx.stroke();
      }

      // Obstacles
      if (!isSpark && !isDone) {
        for (const obs of obstacles) {
          ctx.fillStyle = obs.color || "rgba(251, 207, 232, 0.3)";
          ctx.beginPath();
          const r = 6;
          const ox = obs.x, oy = obs.y, ow = obs.w, oh = obs.h;
          ctx.moveTo(ox + r, oy);
          ctx.lineTo(ox + ow - r, oy);
          ctx.quadraticCurveTo(ox + ow, oy, ox + ow, oy + r);
          ctx.lineTo(ox + ow, oy + oh - r);
          ctx.quadraticCurveTo(ox + ow, oy + oh, ox + ow - r, oy + oh);
          ctx.lineTo(ox + r, oy + oh);
          ctx.quadraticCurveTo(ox, oy + oh, ox, oy + oh - r);
          ctx.lineTo(ox, oy + r);
          ctx.quadraticCurveTo(ox, oy, ox + r, oy);
          ctx.closePath();
          ctx.fill();
          if (obs.label) {
            ctx.fillStyle = "#9CA3AF";
            ctx.font = "9px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(obs.label, ox + ow / 2, oy + oh / 2 + 3);
          }
        }
      }

      // TSP converging lines
      if (isTsp && tspGenRef.current > 0) {
        const allOrders = tspOrdersRef.current;
        const maxGen = Math.min(tspGenRef.current, allOrders.length - 1);
        for (let g = Math.max(0, maxGen - 5); g <= maxGen; g++) {
          const order = allOrders[g];
          if (!order) continue;
          const recency = 1 - (maxGen - g) / 6;
          const dist = totalDist(order, stations);
          const maxD = maxDist(stations);
          const fitness = 1 - dist / maxD;
          ctx.strokeStyle = `rgba(244, 114, 182, ${(0.05 + fitness * 0.25) * recency})`;
          ctx.lineWidth = 1 + fitness * 2;
          ctx.beginPath();
          ctx.moveTo(stations[order[0]].x, stations[order[0]].y);
          for (let i = 1; i < order.length; i++) {
            ctx.lineTo(stations[order[i]].x, stations[order[i]].y);
          }
          ctx.stroke();
        }
      }

      // Default path (idle) or final path (done)
      if ((!isTsp && !isSpark) || isDone) {
        const drawOrder = order || stations.map((_, i) => i);
        if (drawOrder.length > 1) {
          if (!isTsp && !isSpark) {
            ctx.strokeStyle = "rgba(251, 207, 232, 0.6)";
            ctx.lineWidth = 3;
            ctx.setLineDash([8, 8]);
            ctx.beginPath();
            ctx.moveTo(stations[drawOrder[0]].x, stations[drawOrder[0]].y);
            for (let i = 1; i < drawOrder.length; i++) {
              const prev = stations[drawOrder[i - 1]];
              const curr = stations[drawOrder[i]];
              const cpX = (prev.x + curr.x) / 2;
              ctx.bezierCurveTo(cpX, prev.y, cpX, curr.y, curr.x, curr.y);
            }
            ctx.stroke();
            ctx.setLineDash([]);
          }

          if (isDone) {
            ctx.strokeStyle = "rgba(244, 114, 182, 0.8)";
            ctx.lineWidth = 4;
            ctx.shadowColor = "rgba(244, 114, 182, 0.4)";
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(stations[drawOrder[0]].x, stations[drawOrder[0]].y);
            for (let i = 1; i < drawOrder.length; i++) {
              const prev = stations[drawOrder[i - 1]];
              const curr = stations[drawOrder[i]];
              const cpX = (prev.x + curr.x) / 2;
              ctx.bezierCurveTo(cpX, prev.y, cpX, curr.y, curr.x, curr.y);
            }
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
        }
      }

      // Station pins
      for (let i = 0; i < stations.length; i++) {
        const s = stations[i];
        const isDragged = draggedPinIdx === i;
        const isActive = activePinIdx === i;

        if (isDragged) {
          ctx.shadowColor = "rgba(244, 114, 182, 0.3)";
          ctx.shadowBlur = 20;
        }

        const px = s.x;
        const py = s.y;
        const isOrdered = order !== null && order.includes(i);
        const orderIdx = order ? order.indexOf(i) : i;

        ctx.beginPath();
        ctx.arc(px, py, isActive ? 30 : 26, 0, Math.PI * 2);
        ctx.fillStyle = isActive
          ? "#F472B6"
          : s.isPast
            ? "rgba(255,255,255,0.6)"
            : "#FFFFFF";
        ctx.fill();
        ctx.strokeStyle = isDragged
          ? "#F472B6"
          : isActive
            ? "#FFFFFF"
            : "rgba(251, 207, 232, 0.8)";
        ctx.lineWidth = isDragged ? 3 : 2;
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.font = "20px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(s.emoji, px, py);

        if (optimalOrderRef.current && !isTsp && !isSpark) {
          ctx.fillStyle = "rgba(244, 114, 182, 0.8)";
          ctx.font = "bold 10px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(`#${orderIdx + 1}`, px, py + 34);
        }

        if (isDragged || isActive) {
          ctx.fillStyle = "#6B7280";
          ctx.font = "11px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(s.name, px, py + 48);
        }
      }

      ctx.restore();

      if (gaPhaseRef.current === "tsp" || gaPhaseRef.current === "spark") {
        frameRef.current = requestAnimationFrame(render);
      }
    };

    if (gaPhaseRef.current === "idle" || gaPhaseRef.current === "done") {
      render();
    } else {
      frameRef.current = requestAnimationFrame(render);
    }

    return () => cancelAnimationFrame(frameRef.current);
  }, [
    obstacles,
    V_WIDTH,
    V_HEIGHT,
    mapStations,
    draggedPinIdx,
    activePinIdx,
    optimalOrder,
    gaPhase,
  ]);

  // ─── TSP orders ref sync ───
  useEffect(() => {
    if (gaPhase === "tsp") {
      const stations = mapStationsRef.current;
      const tspPoints: TSPPoint[] = stations.map((s, i) => ({
        id: s.id,
        x: s.x,
        y: s.y,
        index: i,
      }));
      const result = runTSP(tspPoints, TSP_GENS, TSP_POP);
      tspOrdersRef.current = result.allOrders;
    }
  }, [gaPhase]);

  // ─── Resize canvas ───
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // ─── Detail modal ───
  const detailStation =
    activePinIdx !== null ? mapStations[activePinIdx] : null;

  return (
    <div className="relative w-full h-full" ref={containerRef}>
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      {/* Zoom controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5">
        <button
          onClick={zoomIn}
          className="w-11 h-11 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md border border-rose-100 shadow-sm text-rose-400 hover:bg-white hover:text-rose-500 transition-all active:scale-95"
          aria-label="Zoom in"
        >
          <ZoomIn size={18} />
        </button>
        <button
          onClick={zoomOut}
          className="w-11 h-11 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md border border-rose-100 shadow-sm text-rose-400 hover:bg-white hover:text-rose-500 transition-all active:scale-95"
          aria-label="Zoom out"
        >
          <ZoomOut size={18} />
        </button>
        <button
          onClick={zoomFit}
          className="w-11 h-11 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md border border-rose-100 shadow-sm text-rose-400 hover:bg-white hover:text-rose-500 transition-all active:scale-95"
          aria-label="Fit map"
        >
          <Maximize2 size={16} />
        </button>
      </div>

      {/* GA phase indicators */}
      <AnimatePresence>
        {gaPhase === "tsp" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-10"
          >
            <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-rose-100/50 flex items-center gap-3 text-xs font-caveat">
              <span className="text-rose-400 font-bold">Gen {tspGen}</span>
              <div className="w-px h-4 bg-rose-100" />
              <span className="text-slate-400">Optimizing order...</span>
              <div className="w-20 h-1.5 bg-rose-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-rose-300 to-rose-500 rounded-full"
                  animate={{ width: `${(tspGen / TSP_GENS) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {gaPhase === "spark" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-10"
          >
            <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-rose-100/50 flex items-center gap-3 text-xs font-caveat">
              <span className="text-rose-400 font-bold">Pathfinding</span>
              <div className="w-px h-4 bg-rose-100" />
              <span className="text-slate-400">
                Gen {sparkGen} · {sparkRate}%
              </span>
              <div className="w-16 h-1.5 bg-rose-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-rose-300 to-rose-500 rounded-full"
                  animate={{ width: `${sparkRate}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {gaPhase === "done" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-4 right-20 z-10 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-rose-50 text-[0.55rem] text-rose-400 font-caveat font-bold"
          >
            🚂 Optimal Route Found!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Find Optimal Route button */}
      <AnimatePresence>
        {gaPhase === "idle" && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={findOptimalRoute}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 px-5 py-2.5 rounded-full bg-rose-400/90 hover:bg-rose-500 text-white text-xs font-caveat font-bold shadow-lg border border-white/30 transition-all active:scale-95 backdrop-blur-sm flex items-center gap-2"
          >
            <MapPin size={14} /> Find Optimal Route
          </motion.button>
        )}
      </AnimatePresence>

      {/* Pin detail modal */}
      <AnimatePresence>
        {detailStation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-80 z-20 bg-white/90 backdrop-blur-xl border border-white p-5 rounded-[1.5rem] shadow-2xl"
          >
            <button
              onClick={() => setActivePinIdx(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors"
            >
              <X size={14} />
            </button>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-xl border border-white shadow-inner">
                {detailStation.emoji}
              </div>
              <div>
                <h3 className="font-nunito font-bold text-sm text-slate-700">
                  {detailStation.name}
                </h3>
                <p className="text-[9px] uppercase tracking-widest text-rose-400 font-bold">
                  {new Date(detailStation.dateTime).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
            <p className="text-xs font-caveat text-slate-600 leading-relaxed bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50">
              {detailStation.description || "Unwritten memories waiting to happen..."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function totalDist(order: number[], pts: Point[]): number {
  let d = 0;
  for (let i = 0; i < order.length - 1; i++) {
    d += Math.hypot(pts[order[i + 1]].x - pts[order[i]].x, pts[order[i + 1]].y - pts[order[i]].y);
  }
  return d;
}

function maxDist(pts: Point[]): number {
  let max = 0;
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const d = Math.hypot(pts[j].x - pts[i].x, pts[j].y - pts[i].y);
      if (d > max) max = d;
    }
  }
  return max || 1;
}
