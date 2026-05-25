export interface Point {
  x: number;
  y: number;
}

export interface Obstacle {
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
  color?: string;
}

export interface GAConfig {
  populationSize?: number;
  lifespan?: number;
  mutationRate?: number;
  maxForce?: number;
  targetRadius?: number;
}

const randomForce = (maxForce: number): Point => ({
  x: (Math.random() - 0.5) * maxForce * 2,
  y: (Math.random() - 0.5) * maxForce * 2,
});

export class Spark {
  pos: Point;
  vel: Point;
  acc: Point;
  dna: Point[];
  fitness: number = 0;
  crashed: boolean = false;
  completed: boolean = false;
  checkpointIndex: number = 0;

  constructor(startX: number, startY: number, maxForce: number, dna?: Point[]) {
    this.pos = { x: startX, y: startY };
    this.vel = { x: 0, y: 0 };
    this.acc = { x: 0, y: 0 };
    this.dna = dna || [];
  }

  update(
    age: number,
    waypoints: Point[],
    targetRadius: number,
    obstacles: Obstacle[],
    bounds: { w: number; h: number }
  ) {
    const target = waypoints[this.checkpointIndex];
    if (target) {
      const dist = Math.hypot(target.x - this.pos.x, target.y - this.pos.y);
      if (dist < targetRadius) {
        this.checkpointIndex++;
        if (this.checkpointIndex >= waypoints.length) {
          this.completed = true;
          this.pos.x = waypoints[waypoints.length - 1].x;
          this.pos.y = waypoints[waypoints.length - 1].y;
        }
      }
    }

    for (const obs of obstacles) {
      if (
        this.pos.x > obs.x &&
        this.pos.x < obs.x + obs.w &&
        this.pos.y > obs.y &&
        this.pos.y < obs.y + obs.h
      ) {
        this.crashed = true;
      }
    }

    if (
      this.pos.x < 0 ||
      this.pos.x > bounds.w ||
      this.pos.y < 0 ||
      this.pos.y > bounds.h
    ) {
      this.crashed = true;
    }

    if (!this.crashed && !this.completed && age < this.dna.length) {
      const force = this.dna[age];
      this.acc.x += force.x;
      this.acc.y += force.y;
      this.vel.x += this.acc.x;
      this.vel.y += this.acc.y;
      const speed = Math.hypot(this.vel.x, this.vel.y);
      if (speed > 4) {
        this.vel.x = (this.vel.x / speed) * 4;
        this.vel.y = (this.vel.y / speed) * 4;
      }
      this.pos.x += this.vel.x;
      this.pos.y += this.vel.y;
      this.acc = { x: 0, y: 0 };
    }
  }

  calcFitness(waypoints: Point[]) {
    const lastTarget = waypoints[waypoints.length - 1];
    const dist = Math.hypot(lastTarget.x - this.pos.x, lastTarget.y - this.pos.y);
    this.fitness = 1 / (dist + 1);
    if (this.completed) this.fitness *= 10;
    if (this.crashed) this.fitness /= 10;
    this.fitness *= 1 + this.checkpointIndex / waypoints.length;
  }
}

export function createInitialPopulation(
  startX: number,
  startY: number,
  size: number,
  lifespan: number,
  maxForce: number
): Spark[] {
  return Array.from(
    { length: size },
    () =>
      new Spark(
        startX,
        startY,
        maxForce,
        Array.from({ length: lifespan }, () => randomForce(maxForce))
      )
  );
}

export function evaluateAndReproduce(
  pop: Spark[],
  waypoints: Point[],
  lifespan: number,
  mutationRate: number,
  maxForce: number
): Spark[] {
  const startX = waypoints[0].x;
  const startY = waypoints[0].y;
  pop.forEach((s) => s.calcFitness(waypoints));
  let maxFit = 0;
  pop.forEach((s) => {
    if (s.fitness > maxFit) maxFit = s.fitness;
  });
  pop.forEach((s) => (s.fitness /= maxFit));
  const pool: Spark[] = [];
  pop.forEach((s) => {
    const n = Math.floor(s.fitness * 100);
    for (let i = 0; i < n; i++) pool.push(s);
  });
  const newPop: Spark[] = [];
  for (let i = 0; i < pop.length; i++) {
    if (pool.length === 0) {
      newPop.push(
        new Spark(
          startX,
          startY,
          maxForce,
          Array.from({ length: lifespan }, () => randomForce(maxForce))
        )
      );
      continue;
    }
    const parentA = pool[Math.floor(Math.random() * pool.length)].dna;
    const parentB = pool[Math.floor(Math.random() * pool.length)].dna;
    const mid = Math.floor(Math.random() * lifespan);
    const childDna: Point[] = [];
    for (let j = 0; j < lifespan; j++) {
      let gene = j < mid ? parentA[j] : parentB[j];
      if (Math.random() < mutationRate) gene = randomForce(maxForce);
      childDna.push({ ...gene });
    }
    newPop.push(new Spark(startX, startY, maxForce, childDna));
  }
  return newPop;
}

export function getBestPath(pop: Spark[], waypoints: Point[]): Point[] {
  const scored = pop
    .map((s) => {
      s.calcFitness(waypoints);
      return s;
    })
    .sort((a, b) => b.fitness - a.fitness);
  if (scored.length === 0) return waypoints;
  const best = scored[0];
  return [{ x: best.pos.x, y: best.pos.y }];
}

export function drawObstacles(
  ctx: CanvasRenderingContext2D,
  obstacles: Obstacle[]
) {
  for (const obs of obstacles) {
    ctx.fillStyle = obs.color || "rgba(251, 207, 232, 0.5)";
    ctx.beginPath();
    const r = 6;
    const x = obs.x;
    const y = obs.y;
    const w = obs.w;
    const h = obs.h;
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    if (obs.label) {
      ctx.fillStyle = "#8B7E8B";
      ctx.font = "9px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(obs.label, obs.x + obs.w / 2, obs.y + obs.h / 2 + 3);
    }
  }
}

export function drawSparks(
  ctx: CanvasRenderingContext2D,
  sparks: Spark[],
  waypoints: Point[]
) {
  for (const spark of sparks) {
    ctx.fillStyle = spark.crashed
      ? "#CBD5E1"
      : spark.completed
        ? "#F472B6"
        : "#FB7185";
    ctx.globalAlpha = spark.crashed ? 0.15 : 0.7;
    ctx.beginPath();
    ctx.arc(spark.pos.x, spark.pos.y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function drawBestPath(
  ctx: CanvasRenderingContext2D,
  bestPath: Point[]
) {
  if (bestPath.length < 2) return;
  ctx.strokeStyle = "#F472B6";
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(bestPath[0].x, bestPath[0].y);
  for (let i = 1; i < bestPath.length; i++) {
    ctx.lineTo(bestPath[i].x, bestPath[i].y);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
}

export function createObstaclesFromStations(
  nodes: (Point & { id: string; dateTime: string; eventType?: string; orderIndex?: number })[],
  totalDistance?: number
): Obstacle[] {
  const obs: Obstacle[] = [];
  const eventColors: Record<string, string> = {
    birthday: "rgba(244, 114, 182, 0.5)",
    "date-night": "rgba(251, 191, 36, 0.4)",
    hug: "rgba(192, 132, 252, 0.4)",
    cozy: "rgba(167, 139, 250, 0.4)",
    surprise: "rgba(52, 211, 153, 0.4)",
    departure: "rgba(251, 146, 60, 0.5)",
    normal: "rgba(229, 231, 235, 0.3)",
  };
  const eventLabels: Record<string, string> = {
    birthday: "🎂",
    "date-night": "🕯️",
    hug: "🤗",
    cozy: "🧸",
    surprise: "✨",
    departure: "🚂",
  };

  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i];
    const b = nodes[i + 1];

    const dateA = new Date(a.dateTime).getTime();
    const dateB = new Date(b.dateTime).getTime();
    const gapHours = (dateB - dateA) / (1000 * 60 * 60);

    if (gapHours > 0) {
      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2;
      const w = Math.min(Math.max(Math.round(gapHours / 12) * 15, 20), 150);
      obs.push({
        x: midX - w / 2,
        y: midY - 8,
        w,
        h: 16,
        label: `⌛ ${Math.round(gapHours)}h`,
        color: gapHours > 48 ? "rgba(251, 113, 133, 0.35)" : "rgba(251, 207, 232, 0.45)",
      });
    }

    const evt = b.eventType || "normal";
    const eColor = eventColors[evt];
    const eLabel = eventLabels[evt];
    if (eLabel && eColor) {
      obs.push({
        x: b.x - 20,
        y: b.y - 48,
        w: 40,
        h: 18,
        label: eLabel,
        color: eColor,
      });
    }
  }

  const total = nodes.length;
  [0.25, 0.5, 0.75].forEach((pct) => {
    const idx = Math.floor(pct * (total - 1));
    if (idx > 0 && idx < nodes.length) {
      const node = nodes[idx];
      obs.push({
        x: node.x - 35,
        y: node.y - 20,
        w: 70,
        h: 6,
        label: `${Math.round(pct * 100)}%`,
        color: "rgba(249, 168, 212, 0.5)",
      });
    }
  });

  return obs;
}

export function drawWaypoints(
  ctx: CanvasRenderingContext2D,
  waypoints: Point[]
) {
  for (let i = 0; i < waypoints.length; i++) {
    const wp = waypoints[i];
    const isStart = i === 0;
    const isEnd = i === waypoints.length - 1;
    ctx.fillStyle = isStart ? "#34D399" : isEnd ? "#F472B6" : "#FBCFE8";
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(wp.x, wp.y, isStart || isEnd ? 8 : 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}
