// src/lib/vendor/overlayscrollbars.d.ts
export interface OverlayScrollbarsOptions {
	target: HTMLElement;
	cancel?: {
		nativeScrollbarsOverlaid?: boolean;
	};
	scrollbars?: {
		theme?: string;
		autoHide?: "never" | "scroll" | "leave" | "move";
		autoHideDelay?: number;
		autoHideSuspend?: boolean;
	};
}

export declare function OverlayScrollbars(

    target: HTMLElement | { target: HTMLElement; cancel?: { nativeScrollbarsOverlaid?: boolean } },

    options?: Partial<OverlayScrollbarsOptions>

): { destroy: () => void; update: () => void };




