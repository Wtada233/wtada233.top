export function initGithubCards(): void {
	const cards = document.querySelectorAll(".card-github");
	cards.forEach((card) => {
		const repo = card.getAttribute("repo");
		if (!repo) return;

		const descEl = card.querySelector(".gc-description");
		const langEl = card.querySelector(".gc-language");
		const forksEl = card.querySelector(".gc-forks");
		const starsEl = card.querySelector(".gc-stars");
		const licenseEl = card.querySelector(".gc-license");
		const avatarEl = card.querySelector(".gc-avatar") as HTMLElement;

		// 1. 如果已有静态数据，先立即应用一遍以防万一（虽然插件已处理，但为了鲁棒性）
		const preDesc = card.getAttribute("data-description");
		if (preDesc && preDesc !== "Loading...") {
			if (descEl) descEl.textContent = preDesc;
			if (langEl) langEl.textContent = card.getAttribute("data-language") || "";
			if (forksEl) forksEl.textContent = card.getAttribute("data-forks") || "0";
			if (starsEl) starsEl.textContent = card.getAttribute("data-stars") || "0";
			if (licenseEl) licenseEl.textContent = card.getAttribute("data-license") || "None";
			const avatarUrl = card.getAttribute("data-avatar");
			if (avatarEl && avatarUrl) {
				avatarEl.style.backgroundImage = `url(${avatarUrl})`;
				avatarEl.style.backgroundColor = "transparent";
			}
			card.classList.remove("fetch-waiting");
		}

		fetch(`https://api.github.com/repos/${repo}`, { referrerPolicy: "no-referrer" })
			.then((response) => {
				if (!response.ok) throw new Error("API response not ok");
				return response.json();
			})
			.then((data) => {
				if (descEl) descEl.textContent = data.description?.replace(/:[a-zA-Z0-9_]+:/g, "") || "Description not set";
				if (langEl) langEl.textContent = data.language || "";
				if (forksEl) forksEl.textContent = Intl.NumberFormat("en-us", { notation: "compact", maximumFractionDigits: 1 }).format(data.forks).replaceAll("\u202f", "");
				if (starsEl) starsEl.textContent = Intl.NumberFormat("en-us", { notation: "compact", maximumFractionDigits: 1 }).format(data.stargazers_count).replaceAll("\u202f", "");
				if (licenseEl) licenseEl.textContent = data.license?.spdx_id || data.license?.name || "None";
				if (avatarEl && data.owner?.avatar_url) {
					avatarEl.style.backgroundImage = `url(${data.owner.avatar_url})`;
					avatarEl.style.backgroundColor = "transparent";
				}
				card.classList.remove("fetch-waiting");
			})
			.catch((err) => {
				console.warn(`Failed to fetch latest data for ${repo}, keeping/using static fallback.`, err);

				// 如果 API 失败且当前内容还是初始态，则尝试应用一次预置数据作为 Fallback
				const preDesc = card.getAttribute("data-description");
				if (preDesc && (descEl?.textContent === "Loading..." || !descEl?.textContent)) {
					if (descEl) descEl.textContent = preDesc;
					if (langEl) langEl.textContent = card.getAttribute("data-language") || "";
					if (forksEl) forksEl.textContent = card.getAttribute("data-forks") || "0";
					if (starsEl) starsEl.textContent = card.getAttribute("data-stars") || "0";
					if (licenseEl) licenseEl.textContent = card.getAttribute("data-license") || "None";
					const avatarUrl = card.getAttribute("data-avatar");
					if (avatarEl && avatarUrl) {
						avatarEl.style.backgroundImage = `url(${avatarUrl})`;
						avatarEl.style.backgroundColor = "transparent";
					}
				}
				card.classList.remove("fetch-waiting");
			});
	});
}
