import { MetadataRoute } from "next";
import { TEAMS, getAllPlayers } from "@/data/teams";
import { STADIUMS } from "@/data/stadiums";
import { REFEREES } from "@/data/referees";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://statmatik.com";

  // Static routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/tahminler`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/groups`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/teams`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/venues`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
  ];

  // Dynamic countries: /ulkeler/[id]
  const countryRoutes = TEAMS.map((team) => ({
    url: `${baseUrl}/ulkeler/${team.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Dynamic stadiums: /stadyumlar/[id]
  const stadiumRoutes = STADIUMS.map((stadium) => ({
    url: `${baseUrl}/stadyumlar/${stadium.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Dynamic referees: /hakemler/[id]
  const refereeRoutes = REFEREES.map((referee) => ({
    url: `${baseUrl}/hakemler/${referee.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Dynamic players: /futbolcular/[id]
  const playerRoutes = getAllPlayers().map((player) => ({
    url: `${baseUrl}/futbolcular/${player.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    ...staticRoutes,
    ...countryRoutes,
    ...stadiumRoutes,
    ...refereeRoutes,
    ...playerRoutes,
  ];
}
