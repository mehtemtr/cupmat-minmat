async function run() {
  try {
    const url = 'https://statmatik.com/api/stats/tournament-leaders';
    console.log("Fetching from " + url);
    const res = await fetch(url);
    if (!res.ok) {
      console.error("HTTP error:", res.status, await res.text());
      return;
    }
    const data = await res.json();
    console.log("Success:", data.success);
    console.log("Scorers length:", data.scorers?.length);
    if (data.scorers && data.scorers.length > 0) {
      console.log("Top 5 Scorers:");
      data.scorers.slice(0, 5).forEach((s, i) => {
        console.log(`${i+1}. Player ID: ${s.player.id}, Name: ${s.player.name}, Position: ${s.player.position}, Team ID: ${s.team.id}, Goals: ${s.goals}`);
      });
    } else {
      console.log("No scorers found!");
    }
  } catch (err) {
    console.error("Error fetching:", err);
  }
}
run();
