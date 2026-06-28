import { getLockedTeamsForStage } from "../lib/fantasy/points";
import { STAGE_START_DATES } from "../lib/fantasy/bot-registration";

const now = new Date("2026-06-28T21:38:10+03:00");

const stages = ["matchday_1", "matchday_2", "matchday_3", "round_of_32", "round_of_16", "quarter_finals", "semi_finals", "finals"];

stages.forEach(stage => {
  const locked = getLockedTeamsForStage(stage, now);
  console.log(`Stage: ${stage} -> Locked Teams Count: ${locked.length}`);
  console.log(`Locked Teams List:`, locked);
});
