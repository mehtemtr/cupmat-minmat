const { getAllPlayers } = require('../data/teams');

async function run() {
  const allPlayers = getAllPlayers();
  const hwang = allPlayers.find(p => p.name === "Hwang In-beom");
  console.log("Hwang In-beom:", hwang);
  const oh = allPlayers.find(p => p.name === "Oh Hyeon-gyu");
  console.log("Oh Hyeon-gyu:", oh);
}

run();
