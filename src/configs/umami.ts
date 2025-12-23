export const umamiConfig = {
	// Enable Umami analytics
	enabled: true,

	// The script URL is usually in the format: https://<your-umami-instance>/script.js
	scriptUrl: "https://umami.wtada233.top/script.js",
	websiteId: "aecb3d93-5dcb-4bcc-823a-331faa0dddac",

	// Configuration for the Umami Stats widget
	widgetEnabled: true,
	// The API endpoint for stats, usually ends with /api
	apiUrl: "https://umami.wtada233.top/api",
	// You can get the share token from your Umami dashboard
	shareToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3ZWJzaXRlSWQiOiJhZWNiM2Q5My01ZGNiLTRiY2MtODIzYS0zMzFmYWEwZGRkYWMiLCJpYXQiOjE3NjU2OTA2NDR9.iqF37aTBNUjbiY5hCEG8y0KGF0AHXno0VaGf6DG_kXw",
};

export type UmamiConfig = typeof umamiConfig;
