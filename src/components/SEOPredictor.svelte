<!-- src/components/SEOPredictor.svelte -->
<script lang="ts">
  import { url } from "@utils/url-utils";

  let inputUrl: string = '';
  let isLoading: boolean = false;
  let error: string | null = null;
  let seoData: any = null; // This will hold parsed SEO data

  // Function to fetch and parse the URL
  async function fetchSeoData() {
    isLoading = true;
    error = null;
    seoData = null;

    if (!inputUrl) {
      error = "Please enter a URL.";
      isLoading = false;
      return;
    }

    try {
      // Use the Astro API endpoint to fetch the URL content
      const apiUrl = url(`/api/fetch-page?url=${encodeURIComponent(inputUrl)}`);
      const response = await fetch(apiUrl);
      const contentType = response.headers.get('content-type');

      if (!response.ok) {
        let errorMessage = `Failed to fetch URL: ${response.status} ${response.statusText}`;
        if (contentType && contentType.includes('application/json')) {
            const errorBody = await response.json();
            errorMessage = errorBody.error || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Check if the response is HTML
      if (!contentType || !contentType.includes('text/html')) {
        throw new Error(`The fetched URL is not HTML. Content-Type: ${contentType}`);
      }
      
      const htmlString = await response.text();
      
      // Parse HTML string
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, "text/html");

      // Extract SEO data
      const extractedData = extractSeoData(doc);
      seoData = extractedData;

    } catch (e: any) {
      error = e.message;
    } finally {
      isLoading = false;
    }
  }

  // Function to extract SEO data from the parsed DOM
  function extractSeoData(doc: Document) {
    const data: any = {};

    // Page Title
    data.title = doc.title;

    // Meta Description
    data.metaDescription = getMetaContent(doc, 'name', 'description');

    // Meta Keywords
    data.metaKeywords = getMetaContent(doc, 'name', 'keywords');

    // Open Graph
    data.og = {
      title: getMetaContent(doc, 'property', 'og:title'),
      description: getMetaContent(doc, 'property', 'og:description'),
      image: getMetaContent(doc, 'property', 'og:image'),
      url: getMetaContent(doc, 'property', 'og:url')
    };

    // Twitter Cards
    data.twitter = {
      card: getMetaContent(doc, 'name', 'twitter:card'),
      title: getMetaContent(doc, 'name', 'twitter:title'),
      description: getMetaContent(doc, 'name', 'twitter:description'),
      image: getMetaContent(doc, 'name', 'twitter:image')
    };

    // Images
    data.images = Array.from(doc.querySelectorAll('img'))
                       .map(img => img.src)
                       .filter(src => src); // Filter out empty src

    // Schema Markup (basic detection)
    data.schema = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'))
                      .map(script => {
                        try {
                            return JSON.parse(script.textContent || '{}');
                        } catch (e) {
                            console.error("Error parsing Schema Markup:", e);
                            return {};
                        }
                      });

    return data;
  }

  // Helper function to get meta tag content
  function getMetaContent(doc: Document, attributeName: string, attributeValue: string) {
    const metaTag = doc.querySelector(`meta[${attributeName}="${attributeValue}"]`);
    return metaTag ? metaTag.getAttribute('content') : null;
  }

  // SERP Snippet preview helper function
  function getSerpTitle(seoData: any, url: string) {
    return seoData.og.title || seoData.title || url;
  }

  function getSerpDescription(seoData: any) {
    return seoData.og.description || seoData.metaDescription || "No description available.";
  }

</script>

<div class="p-4">
  <div class="mb-4">
    <label for="url-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      Enter URL to preview:
    </label>
    <input
      type="url"
      id="url-input"
      bind:value={inputUrl}
      placeholder="e.g., https://example.com"
      class="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
      on:keydown={(e) => { if (e.key === 'Enter') fetchSeoData(); }}
    />
  </div>
  <button
    on:click={fetchSeoData}
    disabled={isLoading}
    class="btn-regular px-4 py-2 rounded-md shadow-sm font-medium"
  >
    {#if isLoading}
      Fetching...
    {:else}
      Fetch SEO Data
    {/if}
  </button>

  {#if error}
    <p class="text-red-500 mt-4">Error: {error}</p>
  {/if}

  {#if seoData}
    <div class="mt-6">
      <h2 class="text-xl font-bold mb-3">SEO Data Preview</h2>

      <!-- Simulated SERP Snippet -->
      <div class="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
        <h3 class="text-lg font-semibold text-blue-800 dark:text-blue-400">
          {getSerpTitle(seoData, inputUrl)}
        </h3>
        <p class="text-green-700 dark:text-green-400 text-sm">{inputUrl}</p>
        <p class="text-gray-800 dark:text-gray-200 text-sm mt-1">
          {getSerpDescription(seoData)}
        </p>
      </div>

      <!-- General SEO Metadata -->
      <div class="mb-4">
        <h3 class="font-semibold text-lg mb-2">General Metadata</h3>
        <p><strong>Title:</strong> {seoData.title || 'N/A'}</p>
        <p><strong>Meta Description:</strong> {seoData.metaDescription || 'N/A'}</p>
        <p><strong>Meta Keywords:</strong> {seoData.metaKeywords || 'N/A'}</p>
      </div>

      <!-- Open Graph Data -->
      <div class="mb-4">
        <h3 class="font-semibold text-lg mb-2">Open Graph Data</h3>
        <p><strong>OG Title:</strong> {seoData.og.title || 'N/A'}</p>
        <p><strong>OG Description:</strong> {seoData.og.description || 'N/A'}</p>
        <p><strong>OG Image:</strong> {seoData.og.image || 'N/A'}</p>
        {#if seoData.og.image}
            <img src={seoData.og.image} alt="OG Image Preview" class="max-w-xs mt-2 border rounded-md" />
        {/if}
        <p><strong>OG URL:</strong> {seoData.og.url || 'N/A'}</p>
      </div>

      <!-- Twitter Card Data -->
      <div class="mb-4">
        <h3 class="font-semibold text-lg mb-2">Twitter Card Data</h3>
        <p><strong>Twitter Card:</strong> {seoData.twitter.card || 'N/A'}</p>
        <p><strong>Twitter Title:</strong> {seoData.twitter.title || 'N/A'}</p>
        <p><strong>Twitter Description:</strong> {seoData.twitter.description || 'N/A'}</p>
        <p><strong>Twitter Image:</strong> {seoData.twitter.image || 'N/A'}</p>
        {#if seoData.twitter.image}
            <img src={seoData.twitter.image} alt="Twitter Image Preview" class="max-w-xs mt-2 border rounded-md" />
        {/if}
      </div>

      <!-- Images Found -->
      <div class="mb-4">
        <h3 class="font-semibold text-lg mb-2">Images on Page ({seoData.images.length})</h3>
        {#if seoData.images.length > 0}
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {#each seoData.images as imageSrc}
              <div class="border p-2 rounded-md">
                <img src={imageSrc} alt="Page Image" class="max-w-full h-auto rounded-md" />
                <p class="text-xs break-all mt-1">{imageSrc}</p>
              </div>
            {/each}
          </div>
        {:else}
          <p>No images found.</p>
        {/if}
      </div>

      <!-- Schema Markup -->
      <div class="mb-4">
        <h3 class="font-semibold text-lg mb-2">Schema Markup ({seoData.schema.length})</h3>
        {#if seoData.schema.length > 0}
            <pre class="whitespace-pre-wrap break-words bg-gray-100 dark:bg-gray-800 p-3 rounded-md text-xs">{JSON.stringify(seoData.schema, null, 2)}</pre>
        {:else}
            <p>No Schema Markup found.</p>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  /* Add any specific Svelte component styles here if needed */
</style>

