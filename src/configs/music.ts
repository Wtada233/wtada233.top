import type { MusicPlayerConfig } from "@/types/config";

export const musicPlayerConfig: MusicPlayerConfig = {
	enable: true, // 启用音乐播放器功能
	local_playlist: [
		{
			id: 1,
			title: "Lemon",
			artist: "米津玄師",
			cover: "/music/lemon/lemon.jpg",
			url: "/music/lemon/lemon.mp3",
			duration: 240,
		},
	],
};
