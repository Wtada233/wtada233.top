import type { MusicPlayerConfig } from "@/types/config";

export const musicPlayerConfig: MusicPlayerConfig = {
	enable: true, // 启用音乐播放器功能
	mode: "local", // 音乐播放器模式，可选 "local" 或 "meting"
	meting_api: "https://www.bilibili.uno/api?server=:server&type=:type&id=:id&auth=:auth&r=:r", // Meting API 地址
	id: "14164869977", // 歌单ID
	server: "netease", // 音乐源服务器
	type: "playlist", // 播单类型
	local_playlist: [
		{
			id: 1,
			title: "Lemon",
			artist: "米津玄師",
			cover: "/music/lemon/cover.jpg",
			url: "/music/lemon/lemon.mp3",
			duration: 240,
		},
	],
};
