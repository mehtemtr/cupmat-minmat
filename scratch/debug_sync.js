const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://ewdfexbuhgtsnsxveobc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3ZGZleGJ1aGd0c25zeHZlb2JjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTYyMTc1NiwiZXhwIjoyMDk1MTk3NzU2fQ.FHFbcvoQrigEaBgPN6yHfUA6NT8oCkrQoHun0yFR_NE';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const { generateSimulation } = require('../lib/simulation');

async function run() {
  const { data: dbRosters } = await supabaseAdmin.from("team_rosters").select("*");
  const match = { id: "A-1", homeTeamId: "mex", awayTeamId: "rsa", date: "2026-06-11" };
  
  const homePlayers = dbRosters.filter(r => r.team_id === match.homeTeamId);
  const awayPlayers = dbRosters.filter(r => r.team_id === match.awayTeamId);

  console.log("Brian in homePlayers list:", homePlayers.find(p => p.player_name.includes("Gutiérrez")));

  const events = generateSimulation(match, homePlayers, awayPlayers);
  const activeEvents = events.filter(e => e.minute <= 94);

  const statsMap = {};
  homePlayers.forEach(p => {
    statsMap[p.id] = { player_name: p.player_name, yellow_cards: 0, red_cards: 0 };
  });

  activeEvents.forEach(ev => {
    if (ev.type === "card") {
      const isRed = ev.textTr.includes("Kırmızı Kart") || ev.textEn.includes("Red Card") || ev.isRedCard;
      let bookedName = "";
      if (isRed) {
        bookedName = ev.textTr.split("Kırmızı Kart gören oyuncu: ")[1]?.replace(".", "")?.trim() || "";
      } else {
        bookedName = ev.textTr.split("Sarı Kart: ")[1]?.split(" rakibine")[0]?.trim() || "";
      }
      
      console.log(`Event minute ${ev.minute}: parsed name: "${bookedName}"`);
      const booked = homePlayers.find(p => p.player_name.includes(bookedName)) || 
                     awayPlayers.find(p => p.player_name.includes(bookedName));
      if (booked) {
        console.log(`Found booked player: ${booked.player_name} id: ${booked.id}`);
        if (statsMap[booked.id]) {
          statsMap[booked.id].yellow_cards++;
        } else {
          console.log(`No entry in statsMap for id: ${booked.id}`);
        }
      } else {
        console.log(`Could not find booked player in rosters for name: "${bookedName}"`);
      }
    }
  });
}

run();
