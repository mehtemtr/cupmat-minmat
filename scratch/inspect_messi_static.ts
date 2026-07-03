import { getAllPlayers } from "../data/teams";

const all = getAllPlayers();
const p10 = all.find(p => p.id === "arg-p10");
console.log("arg-p10 details:", p10);

const messi = all.find(p => p.name.includes("Messi"));
console.log("Messi details:", messi);
