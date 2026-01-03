// src/lib/vendor/photoswipe-lightbox.d.ts
export interface PhotoSwipeLightboxOptions {
    gallery: string | HTMLElement;
    children?: string;
    pswpModule: () => Promise<unknown>;
    closeSVG?: string;
    zoomSVG?: string;
    padding?: { top: number; bottom: number; left: number; right: number };
    wheelToZoom?: boolean;
    arrowPrev?: boolean;
    arrowNext?: boolean;
    imageClickAction?: string;
    tapAction?: string;
    doubleTapAction?: string;
}

export default class PhotoSwipeLightbox {
    constructor(options: PhotoSwipeLightboxOptions);
    init(): void;
    destroy(): void;
    addFilter(name: string, callback: (itemData: Record<string, unknown>, element: HTMLElement) => void): void;
}

