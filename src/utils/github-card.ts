export function initGithubCards(): void {
	const cards = document.querySelectorAll(".card-github.fetch-waiting");
	cards.forEach((card) => {
		const repo = card.getAttribute("repo");
		if (!repo) return;

		fetch(`https://api.github.com/repos/${repo}`, { referrerPolicy: "no-referrer" })
			.then((response) => response.json())
			.then((data) => {
				const descEl = card.querySelector(".gc-description");
				const langEl = card.querySelector(".gc-language");
				const forksEl = card.querySelector(".gc-forks");
				const starsEl = card.querySelector(".gc-stars");
				const avatarEl = card.querySelector(".gc-avatar") as HTMLElement;

				if (descEl) descEl.textContent = data.description?.replace(/:[a-zA-Z0-9_]+:/g, "") || "Description not set";
				if (langEl) langEl.textContent = data.language || "";
				if (forksEl) forksEl.textContent = Intl.NumberFormat("en-us", { notation: "compact", maximumFractionDigits: 1 }).format(data.forks).replaceAll("\u202f", "");
				if (starsEl) starsEl.textContent = Intl.NumberFormat("en-us", { notation: "compact", maximumFractionDigits: 1 }).format(data.stargazers_count).replaceAll("\u202f", "");
				if (avatarEl && data.owner?.avatar_url) {
					avatarEl.style.backgroundImage = `url(${data.owner.avatar_url})`;
					avatarEl.style.backgroundColor = "transparent";
				}
				card.classList.remove("fetch-waiting");
			})
			.catch((err) => {
				console.error("Failed to fetch GitHub repo info:", err);
				card.classList.remove("fetch-waiting");
				card.classList.add("fetch-error");
			});
	});
}
