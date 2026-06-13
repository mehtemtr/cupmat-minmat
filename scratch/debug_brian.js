const { generateSimulation } = require('../lib/simulation');
const { getGeneralPosition } = require('../lib/fantasy/points');

const match = { id: 'A-1', homeTeamId: 'mex', awayTeamId: 'rsa' };
const homePlayers = [
  { id: 'c413d988-a682-4b04-8552-95e7cb6c7a14', player_name: 'Brian Gutiérrez', player_position: 'Orta Saha' }
];
const awayPlayers = [];

const events = generateSimulation(match, homePlayers, awayPlayers);
const cardEvent = events.find(e => e.minute === 75);
console.log("Card Event:", cardEvent);

const bookedName = cardEvent.textTr.split("Sarı Kart: ")[1]?.split(" rakibine")[0]?.trim() || "";
console.log("Booked Name:", bookedName);

const booked = homePlayers.find(p => p.player_name.includes(bookedName));
console.log("Booked Player:", booked);
