// src/pages/api/fetch-page.ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const urlParam = new URL(request.url).searchParams.get('url');

  if (!urlParam) {
    return new Response(JSON.stringify({ error: 'URL parameter is missing.' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const response = await fetch(urlParam);

    if (!response.ok) {
      return new Response(JSON.stringify({ error: `Failed to fetch URL: ${response.statusText}` }), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const htmlContent = await response.text();
    return new Response(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: `Server error: ${error.message}` }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
