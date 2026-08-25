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

    // Ensure Canonical link is dynamically set to https://statmatik.com
    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement("link");
      canonicalEl.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute("href", "https://statmatik.com");

    setMeta("name", "description", meta.description);
    setMeta("property", "og:title", meta.ogTitle);
    setMeta("property", "og:description", meta.ogDescription);
    setMeta("property", "og:url", "https://statmatik.com");
    setMeta("property", "og:locale", locale === "tr" ? "tr_TR" : `${locale}_${locale.toUpperCase()}`);
    document.documentElement.lang = locale;
  }, [dictionary, locale]);

  return null;
}

