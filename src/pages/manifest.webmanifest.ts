import type { APIRoute } from "astro";
import { siteConfig } from "../config";

export const GET: APIRoute = () => {
  if (!siteConfig.pwa?.enable) {
    return new Response("PWA not enabled", { status: 404 });
  }

  const manifest = {
    name: siteConfig.pwa.name,
    short_name: siteConfig.pwa.short_name,
    description: siteConfig.pwa.description,
    start_url: siteConfig.pwa.start_url,
    display: siteConfig.pwa.display,
    background_color: siteConfig.pwa.background_color,
    theme_color: siteConfig.pwa.theme_color,
    icons: siteConfig.pwa.icons,
  };

  return new Response(JSON.stringify(manifest), {
    headers: {
      "Content-Type": "application/manifest+json; charset=utf-8",
    },
  });
};
