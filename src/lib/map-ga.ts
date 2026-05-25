export interface TSPPoint {
  id: string;
  x: number;
  y: number;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function totalDistance(order: number[], points: TSPPoint[]): number {
  let d = 0;
  for (let i = 0; i < order.length - 1; i++) {
    const a = points[order[i]];
    const b = points[order[i + 1]];
    d += Math.hypot(b.x - a.x, b.y - a.y);
  }
  return d;
}

function crossoverOX1(a: number[], b: number[]): number[] {
  const n = a.length;
  const start = Math.floor(Math.random() * n);
  const end = start + Math.floor(Math.random() * (n - start));
  const child = new Array(n).fill(-1);
  for (let i = start; i <= end; i++) child[i] = a[i];
  let j = 0;
  for (let i = 0; i < n; i++) {
    if (child[i] !== -1) continue;
    while (j < n && b[j] === -1) j++;
    const val = b[j];
    j++;
    if (!child.includes(val)) child[i] = val;
    else i--;
  }
  for (let i = 0; i < n; i++) {
    if (child[i] === -1) {
      for (const v of b) {
        if (!child.includes(v)) { child[i] = v; break; }
      }
    }
  }
  return child;
}

function mutateSwap(order: number[]): number[] {
  const child = [...order];
  const i = Math.floor(Math.random() * child.length);
  let j = Math.floor(Math.random() * child.length);
  while (j === i) j = Math.floor(Math.random() * child.length);
  [child[i], child[j]] = [child[j], child[i]];
  return child;
}

export interface TSPResult {
  bestOrder: number[];
  bestDistance: number;
  fitnessHistory: number[];
  allOrders: number[][];
}

export function runTSP(
  points: TSPPoint[],
  generations: number = 100,
  popSize: number = 200
): TSPResult {
  const n = points.length;
  if (n < 3) {
    const bestOrder = points.map((_, i) => i);
    return {
      bestOrder,
      bestDistance: totalDistance(bestOrder, points),
      fitnessHistory: [],
      allOrders: [bestOrder],
    };
  }

  const base = points.map((_, i) => i);
  let pop: number[][] = Array.from({ length: popSize }, () => shuffle(base));
  let bestOrder = pop[0];
  let bestDistance = totalDistance(bestOrder, points);
  const fitnessHistory: number[] = [];
  const allOrders: number[][] = [];

  for (let gen = 0; gen < generations; gen++) {
    const scored = pop
      .map((order) => ({ order, dist: totalDistance(order, points) }))
      .sort((a, b) => a.dist - b.dist);

    if (scored[0].dist < bestDistance) {
      bestDistance = scored[0].dist;
      bestOrder = scored[0].order;
    }

    fitnessHistory.push(bestDistance);
    allOrders.push(scored[0].order);

    const next: number[][] = [];
    for (let i = 0; i < 3; i++) next.push(scored[i].order);

    while (next.length < popSize) {
      const tournament = (): number[] => {
        const a = scored[Math.floor(Math.random() * popSize)].order;
        const b = scored[Math.floor(Math.random() * popSize)].order;
        return totalDistance(a, points) < totalDistance(b, points) ? a : b;
      };
      const parentA = tournament();
      const parentB = tournament();
      let child = crossoverOX1(parentA, parentB);
      if (Math.random() < 0.1) child = mutateSwap(child);
      next.push(child);
    }

    pop = next;
  }

  return { bestOrder, bestDistance, fitnessHistory, allOrders };
}
