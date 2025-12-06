import path from "node:path";
import type { ImageMetadata } from "astro";

export async function resolveImage(
	src: string,
	basePath = "/",
): Promise<ImageMetadata | undefined> {
	// The glob path here is relative to the project root for consistency.
	// Adjust if images are in a different base directory.
	const files = import.meta.glob<ImageMetadata>(
		"/src/**/*.{jpg,jpeg,png,gif,webp,avif}",
		{ import: "default" },
	);

	const fullPath = path
		.normalize(path.join("/src", basePath, src)) // Ensure path starts from project root for glob matching
		.replace(/\\/g, "/");

	// Check for exact match
	let file = files[fullPath];

	// If exact match not found, try other variations (e.g., if src already includes part of basePath)
	if (!file) {
		// This is a more flexible search, looking for any file that ends with the src path
		const potentialPaths = Object.keys(files).filter((key) =>
			key.endsWith(fullPath),
		);
		if (potentialPaths.length > 0) {
			file = files[potentialPaths[0]];
		}
	}

	if (!file) {
		console.error(`\n[ERROR] Image file not found by utility: ${fullPath}`);
		return undefined;
	}
	return await file();
}
