import fs from "fs";
import path from "path";

export interface MinMatScore {
  name: string;
  score: number;
  level: number;
  mode: string;
  date: string;
}

const FILE_PATH = path.join(process.cwd(), "data", "minmat-leaderboard.json");

const globalStore = globalThis as unknown as {
  minmatLeaderboard?: MinMatScore[];
};

function getStore(): MinMatScore[] {
  if (globalStore.minmatLeaderboard) {
    return globalStore.minmatLeaderboard;
  }

  // Try to load from local file first
  try {
    if (fs.existsSync(FILE_PATH)) {
      const data = fs.readFileSync(FILE_PATH, "utf-8");
      globalStore.minmatLeaderboard = JSON.parse(data) as MinMatScore[];
      return globalStore.minmatLeaderboard!;
    }
  } catch (error) {
    console.error("Failed to load minmat leaderboard from file", error);
  }

  // Initial seed data
  globalStore.minmatLeaderboard = [
    { name: "Alperen", score: 150, level: 5, mode: "mix", date: new Date().toLocaleDateString("tr-TR") },
    { name: "Harun", score: 120, level: 4, mode: "mul", date: new Date().toLocaleDateString("tr-TR") },
    { name: "Mehtap", score: 90, level: 3, mode: "add", date: new Date().toLocaleDateString("tr-TR") }
  ];
  saveToFile(globalStore.minmatLeaderboard);
  return globalStore.minmatLeaderboard;
}

function saveToFile(scores: MinMatScore[]) {
  try {
    const dir = path.dirname(FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(FILE_PATH, JSON.stringify(scores, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save minmat leaderboard to file", error);
  }
}

export function getMinMatLeaderboard(): MinMatScore[] {
  return [...getStore()].sort((a, b) => b.score - a.score);
}

export function addMinMatScore(entry: MinMatScore): void {
  const store = getStore();
  store.push(entry);
  // Sort and keep top 50 scores globally
  store.sort((a, b) => b.score - a.score);
  const trimmed = store.slice(0, 50);
  globalStore.minmatLeaderboard = trimmed;
  saveToFile(trimmed);
}
