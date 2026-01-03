/**
 * 将 RGB 转换为 HSL 中的 Hue 值
 */
export function rgbToHue(r: number, g: number, b: number): number {
	const red = r / 255;
	const green = g / 255;
	const blue = b / 255;

	const max = Math.max(red, green, blue);
	const min = Math.min(red, green, blue);
	let h = 0;

	if (max === min) {
		h = 0; // 灰色，无色相
	} else {
		const d = max - min;
		switch (max) {
			case red:
				h = (green - blue) / d + (green < blue ? 6 : 0);
				break;
			case green:
				h = (blue - red) / d + 2;
				break;
			case blue:
				h = (red - green) / d + 4;
				break;
		}
		h /= 6;
	}

	return Math.round(h * 360);
}
