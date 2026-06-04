import * as fs from "fs";
import * as path from "path";

function getPlayerPriority(player: any): number {
  const name = (player.name || "").toLowerCase();
  const club = (player.club || "").toLowerCase();
  
  const superstars = [
    "arda güler", "arda guler", "kenan yıldız", "kenan yildiz", "hakan çalhanoğlu", "hakan calhanoglu",
    "semih kılıçsoy", "semih kilicsoy", "mustafa hekimoğlu", "mustafa hekimoglu", "cenk tosun",
    "ernest muçi", "ernest muci", "milot rashica", "gedson fernandes", "rafa silva"
  ];
  if (superstars.some(star => name.includes(star))) {
    return 1000;
  }
  
  if (club.includes("real madrid") || club.includes("juventus") || club.includes("bayern munich") || club.includes("barcelona") || club.includes("manchester city") || club.includes("liverpool") || club.includes("inter milan") || club.includes("ac milan") || club.includes("paris saint-germain") || club.includes("arsenal") || club.includes("chelsea") || club.includes("tottenham") || club.includes("benfica") || club.includes("sporting") || club.includes("porto") || club.includes("ajax") || club.includes("feyenoord") || club.includes("roma") || club.includes("lazio") || club.includes("atalanta") || club.includes("brighton") || club.includes("west ham") || club.includes("bayer leverkusen") || club.includes("dortmund") || club.includes("stuttgart")) {
    return 500;
  }
  
  if (club.includes("beşiktaş") || club.includes("besiktas") || club.includes("bjk")) {
    return 400;
  }
  if (club.includes("fenerbahçe") || club.includes("fenerbahce") || club.includes("galatasaray") || club.includes("trabzonspor")) {
    return 300;
  }
  
  if (club === "serbest" || club === "") {
    return 0;
  }
  
  return 100;
}

async function main() {
  const filePath = path.join(__dirname, "real-squads.json");
  const wikiData = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const wikiPlayers = wikiData["tur"] || [];
  
  console.log(`Turkey squad in real-squads.json has ${wikiPlayers.length} players.`);
  
  const gks = wikiPlayers.filter((p: any) => p.position.toUpperCase().includes("GK"));
  const dfs = wikiPlayers.filter((p: any) => p.position.toUpperCase().includes("DF"));
  const mids = wikiPlayers.filter((p: any) => p.position.toUpperCase().includes("MF"));
  const fwds = wikiPlayers.filter((p: any) => p.position.toUpperCase().includes("FW"));

  const sortByPriority = (arr: any[]) => {
    return [...arr].sort((a, b) => getPlayerPriority(b) - getPlayerPriority(a));
  };

  const sortedGks = sortByPriority(gks);
  const sortedDfs = sortByPriority(dfs);
  const sortedMids = sortByPriority(mids);
  const sortedFwds = sortByPriority(fwds);

  const selectedGks = sortedGks.slice(0, 3);
  const minDfs = Math.min(sortedDfs.length, 7);
  const minMids = Math.min(sortedMids.length, 7);
  const minFwds = Math.min(sortedFwds.length, 5);

  const selectedDfs = sortedDfs.slice(0, minDfs);
  const selectedMids = sortedMids.slice(0, minMids);
  const selectedFwds = sortedFwds.slice(0, minFwds);

  const remainingDfs = sortedDfs.slice(minDfs);
  const remainingMids = sortedMids.slice(minMids);
  const remainingFwds = sortedFwds.slice(minFwds);
  const pool = sortByPriority([...remainingDfs, ...remainingMids, ...remainingFwds]);

  const currentOutfieldCount = selectedDfs.length + selectedMids.length + selectedFwds.length;
  const slotsNeeded = 23 - currentOutfieldCount;
  const extraOutfielders = pool.slice(0, slotsNeeded);

  extraOutfielders.forEach((p: any) => {
    const pos = p.position.toUpperCase();
    if (pos.includes("DF")) selectedDfs.push(p);
    else if (pos.includes("MF")) selectedMids.push(p);
    else if (pos.includes("FW")) selectedFwds.push(p);
  });

  const selectedPlayers = [...selectedGks, ...selectedDfs, ...selectedMids, ...selectedFwds];

  console.log(`Selected ${selectedPlayers.length} players:`);
  selectedPlayers.forEach((p, i) => console.log(`${i+1}: ${p.name} (${p.position}) - Club: ${p.club}, Priority: ${getPlayerPriority(p)}`));
}

main().catch(console.error);
