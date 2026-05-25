const OPENINGS = [
  "My dearest,",
  "To the one I love,",
  "From across the miles,",
  "My love,",
  "To you, my everything,",
  "Hey you,",
  "My darling,",
  "To my favorite person,",
  "From here to where you are,",
  "My heart writes to you,",
];

const BODIES: [string, string][] = [
  ["Even though the distance feels endless,", "my heart beats only for you."],
  ["Every mile between us", "is a reminder of how much I love you."],
  ["I miss the way you laugh,", "the way your eyes light up when you see me."],
  ["Some days the distance is hard,", "but loving you makes it all worth it."],
  ["I carry you with me", "everywhere I go, in every thought."],
  ["The space between us", "only makes my heart grow fonder."],
  ["I close my eyes and imagine", "the day I finally get to hold you."],
  ["You are the best part of my day,", "even from so far away."],
  ["I never knew I could miss someone", "this much, until I met you."],
  ["The countdown keeps me going,", "each day bringing me closer to you."],
  ["When I think of you,", "the miles don't feel so far anymore."],
  ["You make the distance worth every second,", "because I know you're waiting too."],
  ["Every morning I wake up grateful", "that someone like you exists."],
  ["I fall in love with you a little more", "every single day, even from here."],
  ["The stars look the same from here,", "and I hope you're looking at them too."],
  ["I whisper goodnight to the wind,", "hoping it carries my voice to you."],
  ["You are my favorite hello", "and my hardest goodbye."],
  ["The thought of your smile", "gets me through the toughest days."],
  ["This journey has taught me", "that love knows no boundaries."],
  ["We are building something beautiful,", "one day at a time, one mile at a time."],
  ["I can't wait for the day", "when distance is just a word."],
  ["You are worth every mile,", "every delay, every sacrifice."],
  ["My heart is already with you,", "it just needs the rest of me to catch up."],
  ["I love you more than", "words could ever express."],
];

const CLOSINGS = [
  "Yours always,",
  "Counting the days,",
  "Can't wait to see you,",
  "Forever yours,",
  "With all my love,",
  "See you soon,",
  "Until we're together,",
  "All my love, across the miles,",
  "Yours, from across the distance,",
  "Thinking of you,",
];

const SYNONYM_MAP: Record<string, string[]> = {
  love: ["adore", "cherish", "treasure"],
  miss: ["long for", "yearn for", "think of"],
  distance: ["miles", "space", "separation"],
  heart: ["soul", "spirit", "being"],
  day: ["moment", "hour", "minute"],
  beautiful: ["wonderful", "amazing", "incredible"],
  happy: ["grateful", "blessed", "fortunate"],
  hold: ["embrace", "wrap my arms around", "hug"],
  smile: ["grin", "laughter", "joy"],
  together: ["united", "side by side", "in each other's arms"],
};

const STORAGE_KEY = "countdown_love_letter";

interface StoredLetter {
  openingIdx: number;
  bodyIdx: number;
  closingIdx: number;
  letter: string;
  generation: number;
  lastDate: string;
  fitness: number;
  heartCount: number;
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadStored(): StoredLetter | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveStored(data: StoredLetter) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildLetter(openingIdx: number, bodyIdx: number, closingIdx: number): string {
  const opening = OPENINGS[openingIdx];
  const [bodyA, bodyB] = BODIES[bodyIdx];
  const closing = CLOSINGS[closingIdx];
  return `${opening}\n\n${bodyA} ${bodyB}\n\n${closing}`;
}

function mutateWord(text: string): string {
  const words = text.split(" ");
  for (let i = 0; i < words.length; i++) {
    const lower = words[i].toLowerCase().replace(/[^a-z]/g, "");
    const syns = SYNONYM_MAP[lower];
    if (syns && Math.random() < 0.3) {
      const replacement = pickRandom(syns);
      const hasCap = words[i][0] === words[i][0]?.toUpperCase();
      words[i] = hasCap
        ? replacement.charAt(0).toUpperCase() + replacement.slice(1)
        : replacement;
    }
  }
  return words.join(" ");
}

function evolve(stored: StoredLetter | null): StoredLetter {
  const prevGen = stored?.generation || 0;
  const prevFitness = stored?.fitness || 0.5;

  let openingIdx: number;
  let bodyIdx: number;
  let closingIdx: number;

  if (stored && Math.random() < 0.6) {
    openingIdx = stored.openingIdx;
  } else {
    openingIdx = Math.floor(Math.random() * OPENINGS.length);
  }

  if (stored && Math.random() < 0.5) {
    bodyIdx = stored.bodyIdx;
  } else {
    bodyIdx = Math.floor(Math.random() * BODIES.length);
  }

  if (stored && Math.random() < 0.6) {
    closingIdx = stored.closingIdx;
  } else {
    closingIdx = Math.floor(Math.random() * CLOSINGS.length);
  }

  let rawLetter = buildLetter(openingIdx, bodyIdx, closingIdx);

  if (Math.random() < 0.2) {
    rawLetter = mutateWord(rawLetter);
  }

  const newFitness = prevFitness * 0.7 + 0.3;

  return {
    openingIdx,
    bodyIdx,
    closingIdx,
    letter: rawLetter,
    generation: prevGen + 1,
    lastDate: getToday(),
    fitness: newFitness,
    heartCount: stored?.heartCount || 0,
  };
}

export function getDailyLetter(): { letter: string; generation: number; heartCount: number } {
  const stored = loadStored();
  const today = getToday();

  if (stored && stored.lastDate === today) {
    return {
      letter: stored.letter,
      generation: stored.generation,
      heartCount: stored.heartCount,
    };
  }

  const newLetter = evolve(stored);
  saveStored(newLetter);
  return {
    letter: newLetter.letter,
    generation: newLetter.generation,
    heartCount: newLetter.heartCount,
  };
}

export function recordHeart(): { generation: number; heartCount: number } {
  const stored = loadStored();
  if (!stored) return { generation: 0, heartCount: 0 };
  stored.heartCount = (stored.heartCount || 0) + 1;
  stored.fitness = Math.min(stored.fitness + 0.15, 1.0);
  saveStored(stored);
  return { generation: stored.generation, heartCount: stored.heartCount };
}
