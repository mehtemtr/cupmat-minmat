import { getActiveTeamsForStage } from "../lib/fantasy/points";

const stages = ["matchday_1", "matchday_2", "matchday_3", "round_of_32", "round_of_16", "quarter_finals", "semi_finals", "finals"];

stages.forEach(stage => {
  const active = getActiveTeamsForStage(stage);
  console.log(`Stage: ${stage} -> Active Teams Count: ${active.length}`);
  if (active.length <= 16) {
    console.log(`Active Teams:`, active);
  }
});
