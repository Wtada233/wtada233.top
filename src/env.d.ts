/// <reference types="astro/client" />
/// <reference path="../.astro/types.d.ts" />

declare module "virtual:pwa-register" {
	export type RegisterSWOptions = {
		immediate?: boolean;
		onNeedRefresh?: () => void;
		onOfflineReady?: () => void;
		onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
		onRegisteredSW?: (swScriptUrl: string, registration: ServiceWorkerRegistration | undefined) => void;
		onRegisterError?: (error: unknown) => void;
	};

	export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => Promise<void>;
}

declare module "virtual:pwa-info" {
	export const pwaInfo:
		| {
				webManifest: {
					href: string;
					linkTag: string;
				};
		  }
		| undefined;
}
