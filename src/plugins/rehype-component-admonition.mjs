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
 * Creates an admonition component.
 *
 * @param {Object} properties - The properties of the component.
 * @param {string} [properties.title] - An optional title.
 * @param {('tip'|'note'|'important'|'caution'|'warning')} type - The admonition type.
 * @param {import('mdast').RootContent[]} children - The children elements of the component.
 * @returns {import('mdast').Parent} The created admonition component.
 */
export function AdmonitionComponent(properties, children, type) {
	if (!Array.isArray(children) || children.length === 0) return h("div", { class: "hidden" }, 'Invalid admonition directive. (Admonition directives must be of block type ":::note{name="name"} <content> :::")');

	let label = null;
	if (properties?.["has-directive-label"]) {
		label = children[0]; // The first child is the label
		// biome-ignore lint/style/noParameterAssign: <check later>
		children = children.slice(1);
		label.tagName = "div"; // Change the tag <p> to <div>
	}

	return h("blockquote", { class: `admonition bdm-${type}` }, [h("span", { class: "bdm-title" }, label ? label : type.toUpperCase()), ...children]);
}
