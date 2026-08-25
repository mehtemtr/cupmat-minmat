import { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://statmatik.com";
  const supportedLocales = ["tr", "en", "es", "fr", "de", "it", "pt", "ar", "ko"];

  const buildLanguageAlternates = (path: string) => {
    const languages: Record<string, string> = {
      "x-default": `${baseUrl}${path}`,
      tr: `${baseUrl}${path}`,
    };
    for (const loc of supportedLocales) {
      if (loc !== "tr") {
        languages[loc] = `${baseUrl}${path}?lang=${loc}`;
      }
    }
    return languages;
  };

  // Active routes of the project
  const routes: { path: string; changeFrequency: "always" | "hourly" | "daily" | "weekly"; priority: number }[] = [
    {
      path: "",
      changeFrequency: "always",
      priority: 1.0,
    },
    {
      path: "/haberler",
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      path: "/cupmat",
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      path: "/minmat",
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      path: "/minlan",
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      path: "/leaderboard",
      changeFrequency: "daily",
      priority: 0.75,
    },
    {
      path: "/ajtran",
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  return routes.map((r) => ({
    url: `${baseUrl}${r.path}`,
    lastModified: new Date(),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
    alternates: {
      languages: buildLanguageAlternates(r.path),
    },
  }));
}

