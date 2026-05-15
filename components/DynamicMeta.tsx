"use client";

import { useEffect } from "react";
import { useTranslation } from "@/contexts/LocaleContext";

export function DynamicMeta() {
  const { dictionary, locale } = useTranslation();

  useEffect(() => {
    const { meta } = dictionary;
    document.title = meta.title;

    const setMeta = (attr: string, key: string, value: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", value);
    };

    setMeta("name", "description", meta.description);
    setMeta("property", "og:title", meta.ogTitle);
    setMeta("property", "og:description", meta.ogDescription);
    setMeta("property", "og:locale", locale === "tr" ? "tr_TR" : "en_US");
    document.documentElement.lang = locale;
  }, [dictionary, locale]);

  return null;
}
