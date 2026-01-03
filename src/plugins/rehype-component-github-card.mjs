/// <reference types="mdast" />

function h(tagName, properties = {}, children = []) {
	return {
		type: "element",
		tagName,
		properties,
		children: (Array.isArray(children) ? children : [children]).map((child) => (typeof child === "string" ? { type: "text", value: child } : child)),
	};
}

/**
 * Creates a GitHub Card component.
 * Supports manual override of all properties for "Ten-Year Offline Survival".
 */
export function GithubCardComponent(properties, children) {
	if (Array.isArray(children) && children.length !== 0) return h("div", { class: "hidden" }, ['Invalid directive. ("github" directive must be leaf type "::github{repo="owner/repo"}")']);

	if (!properties.repo || !properties.repo.includes("/")) return h("div", { class: "hidden" }, 'Invalid repository. ("repo" attributte must be in the format "owner/repo")');

	const repo = properties.repo;
	const cardUuid = `GC${Math.random().toString(36).slice(-6)}`;

	// Allow manual overrides from directive properties
	const description = properties.description || "Loading...";
	const stars = String(properties.stars || "0");
	const forks = String(properties.forks || "0");
	const license = properties.license || "Loading...";
	const language = properties.language || "Waiting...";
	const avatar = properties.avatar || "";

	const isStatic = description !== "Loading...";

	return h(
		`a#${cardUuid}-card`,
		{
			class: `card-github no-styling ${isStatic ? "" : "fetch-waiting"}`,
			href: `https://github.com/${repo}`,
			target: "_blank",
			repo,
			"data-description": description,
			"data-stars": stars,
			"data-forks": forks,
			"data-license": license,
			"data-language": language,
			"data-avatar": avatar,
		},
		[
			h("div", { class: "gc-titlebar" }, [
				h("div", { class: "gc-titlebar-left" }, [
					h("div", { class: "gc-owner" }, [
						h(`div#${cardUuid}-avatar`, {
							class: "gc-avatar",
							style: avatar ? `background-image: url(${avatar}); background-color: transparent;` : "",
						}),
						h("div", { class: "gc-user" }, repo.split("/")[0]),
					]),
					h("div", { class: "gc-divider" }, "/"),
					h("div", { class: "gc-repo" }, repo.split("/")[1]),
				]),
				h("div", { class: "github-logo" }),
			]),
			h(`div#${cardUuid}-description`, { class: "gc-description" }, description),
			h("div", { class: "gc-infobar" }, [h(`span#${cardUuid}-stars`, { class: "gc-stars" }, stars), h(`span#${cardUuid}-forks`, { class: "gc-forks" }, forks), h(`span#${cardUuid}-license`, { class: "gc-license" }, license), h(`span#${cardUuid}-language`, { class: "gc-language" }, language)]),
		],
	);
}
