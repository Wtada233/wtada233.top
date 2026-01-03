import { umamiConfig } from "@configs/umami";

export function formatNumber(num: number): string {
	if (num >= 1000000) {
		return `${(num / 1000000).toFixed(1)}M`;
	}
	if (num >= 1000) {
		return `${(num / 1000).toFixed(1)}K`;
	}
	return num.toString();
}

export async function fetchUmamiStats(): Promise<void> {
	if (!umamiConfig.widgetEnabled) {
		return;
	}

	const pageviewsElement = document.getElementById("total-pageviews");
	const visitsElement = document.getElementById("total-visits");
	const visitorsElement = document.getElementById("total-visitors");

	if (!pageviewsElement && !visitsElement && !visitorsElement) {
		return;
	}

	try {
		const endAt = Date.now();
		const startAt = 0;

		const fetchUrl = new URL(`${umamiConfig.apiUrl}/websites/${umamiConfig.websiteId}/stats`);
		fetchUrl.searchParams.set("startAt", startAt.toString());
		fetchUrl.searchParams.set("endAt", endAt.toString());

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

		const response = await fetch(fetchUrl.toString(), {
			method: "GET",
			headers: {
				Accept: "application/json",
				"x-umami-share-token": umamiConfig.shareToken,
			},
			signal: controller.signal,
		});
		clearTimeout(timeoutId);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();

		if (pageviewsElement) pageviewsElement.textContent = formatNumber(data.pageviews?.value || data.pageviews || 0);
		if (visitsElement) visitsElement.textContent = formatNumber(data.visits?.value || data.visits || 0);
		if (visitorsElement) visitorsElement.textContent = formatNumber(data.visitors?.value || data.visitors || 0);
	} catch (error) {
		console.error("获取Umami实时数据失败，尝试使用静态快照:", error);
		const pageviewsElement = document.getElementById("total-pageviews");
		const visitsElement = document.getElementById("total-visits");
		const visitorsElement = document.getElementById("total-visitors");
		const container = document.querySelector("widget-layout[data-id='umami-stats']") as HTMLElement;

		if (container) {
			if (pageviewsElement) pageviewsElement.textContent = formatNumber(Number(container.dataset.pageviews || 0));
			if (visitsElement) visitsElement.textContent = formatNumber(Number(container.dataset.visits || 0));
			if (visitorsElement) visitorsElement.textContent = formatNumber(Number(container.dataset.visitors || 0));
		}
	}
}
