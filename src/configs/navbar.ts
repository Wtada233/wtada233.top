import { seriesConfig } from "@configs/series";
import { LinkPreset, type NavBarConfig } from "@/types/config";

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		LinkPreset.About,
		...(seriesConfig.enabled ? [LinkPreset.Series] : []),
		LinkPreset.Friends,
		{
			name: "QQ",
			url: "https://qm.qq.com/cgi-bin/qm/qr?k=L1oKGqOXks5BfCnmXICVHK12fp6idgXJ&jump_from=webapi&authKey=0wKKiYFigxhrOpUAvWu4DzoU8oEc7U6JSnBF3rMGo5Zq8PgxPKppLb+pe0Z4GByD",
			external: true, // Show an external link icon and will open in a new tab
		},
	],
};
