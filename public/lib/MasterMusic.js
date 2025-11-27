// MasterMusic.js
// 音乐播放器配置文件

(() => {
	// 确保 APlayer 已加载
	if (typeof APlayer === "undefined") {
		console.error("APlayer 未加载，请检查引用顺序");
		return;
	}

	console.log("MasterMusic.js 已加载，APlayer 可用");

	// 避免重复初始化
	if (window.musicPlayerInitialized) {
		console.log("音乐播放器已初始化，跳过重复初始化");
		return;
	}

	// 标记已初始化
	window.musicPlayerInitialized = true;

	try {
		// 创建音乐播放器实例
		const musicPlayer = new APlayer({
			container: document.getElementById("player"),
			fixed: false,
			autoplay: true,
			theme: "#04112d",
			loop: "all",
			order: "random",
			volume: 1.0,
			mutex: true,
			listFolded: false,
			listMaxHeight: 90,
			lrcType: 1, // 使用内联歌词
			audio: [
				{
					name: "Lemon",
					artist: "米津玄師",
					url: "/music/lemon/lemon.mp3",
					cover:
						"/music/lemon/lemon.jpg",
					lrc: "[00:00.000]Lemon - 米津玄師 (よねづ けんし)[00:00.530]词：米津玄師[00:01.060]曲：米津玄師",
				},
				{
					name: "让风告诉你",
					artist: "花玲,喵☆酱,宴宁,kinsen",
					url: "/music/demo/demo.mp3",
					cover:
						"/music/demo/demo.jpg",
					lrc: "[00:00.000] 作词 : ChiliChill[00:00.281] 作曲 : ChiliChill[00:00.562] 编曲 : ChiliChill[00:00.843] 制作人 : ChiliChill[00:01.124]当你的天空突然下起了大雨[00:05.341]那是我在为你炸乌云[00:09.191]当你的发丝微乱有阵风吹过[00:13.341]那是我在远处想念你[00:33.808]你还在忙吗[00:34.375]还是在摸鱼[00:35.643]我看看 哇 好大一条[00:38.358]那个 摸完能不能借我炸一下[00:41.308]嘿嘿嘿[00:41.958]看起来你怎么不开心[00:44.075]虽然不知道发生了什么[00:46.108]吃饱了再去想吧[00:48.124]（这东西 能吃吗）[00:50.124]烦恼都走开 烦恼都走开[00:52.095]加班都走开 加班都走开[00:54.061]倒霉都走开 倒霉都走开[00:58.061]坏人都走开 坏人都走开[01:00.162]尴尬都走开 尴尬都走开[01:02.094]史莱姆走开 史莱姆走开[01:05.043]当你的天空突然下起了大雨[01:09.311]那是我在为你炸乌云[01:13.162]当你的发丝微乱有阵风吹过[01:17.345]那是我在远处想念你[01:38.476]你在忙吗[01:40.059]还是在摸鱼[01:41.992]我看看 哇 好大一条[01:46.425]那个 摸完能不能借她炸一下[01:50.709]嘿嘿嘿  哎 唱不完了……[01:54.700]不见万家灯火[01:56.849]尽斩世间妖魔[01:58.666]如此一切只为苍生不要想太多[02:02.649]平凡的起起落落[02:04.665]漂浮的因果对错[02:06.616]都可以向风诉说[02:09.182]当前面太多阻碍看不到对岸[02:13.068]请替我保密我为你炸平[02:17.083]虽然我讨厌热热乎乎的东西[02:21.510]我却想要拥抱你可以吗[02:26.211]（吟唱~）[02:39.657]如果你迷恋岁月舍不得向前[02:44.139]我就默默记录这诗篇[02:47.990]如果你厌倦引力想要去飞行[02:52.090]我就让全世界的风吹向你[02:57.056]当你的天空突然下起了大雨[03:01.257]那是我在为你炸乌云[03:05.006]当你的发丝微乱有阵风吹过[03:09.241]那是我在远处想念你[03:13.139]啦啦啦~[03:15.246] 演唱：[03:17.353] 可莉——花玲[03:19.460] 温迪——喵☆酱[03:21.567] 七七——宴宁[03:23.674] 魈——kinsen[03:25.781] [03:27.888] 编曲：ChiliChill[03:29.995] 贝斯：冯子明、山口进也[03:32.102] 长笛：Salit Lahav[03:34.209] 弦乐编写：胡静成[03:36.316] 小提琴：庞阔 / 张浩[03:38.423] 中提琴：毕芳[03:40.530] 大提琴：郎莹[03:42.637] 弦乐录音：李昕达@九紫天诚[03:44.744] 人声录音棚：YIHE Studio[03:46.851] 混音、母带：ChiliChill",
				},
			],
		});

		// 将播放器实例保存到全局，方便其他地方调用
		window.musicPlayer = musicPlayer;

		// 添加错误处理，防止 DOM 操作错误
		musicPlayer.on("error", (error) => {
			console.warn("音乐播放器错误:", error);
		});

		// 监听歌曲切换事件，确保 DOM 稳定
		musicPlayer.on("listswitch", (index) => {
			console.log("切换到歌曲:", index.title);
			// 确保容器存在
			setTimeout(() => {
				const container = document.getElementById("player");
				if (!container) {
					console.warn("播放器容器丢失，尝试重新创建");
					const newContainer = document.createElement("div");
					newContainer.id = "player";
					newContainer.className = "aplayer";
					document.body.appendChild(newContainer);
				}
			}, 100);
		});

		// 恢复之前的播放状态
		if (window.musicPlayerState) {
			const state = window.musicPlayerState;

			// 等待播放器完全加载后恢复状态
			musicPlayer.on("loadeddata", () => {
				// 切换到之前的歌曲
				if (
					state.currentIndex !== undefined &&
					state.currentIndex < musicPlayer.list.audios.length
				) {
					musicPlayer.list.switch(state.currentIndex);
				}

				// 恢复播放进度
				if (state.currentTime) {
					musicPlayer.seek(state.currentTime);
				}

				// 恢复播放状态（需要用户交互）
				if (!state.paused) {
					try {
						// 尝试自动播放，如果失败则等待用户交互
						const playPromise = musicPlayer.play();
						if (playPromise && typeof playPromise.catch === "function") {
							playPromise.catch(() => {
								console.log("页面切换后需要重新获得用户交互权限");
								// 等待用户下次点击任何地方时恢复播放
								waitForUserInteraction();
							});
						}
					} catch (error) {
						console.log("播放器恢复失败:", error);
						waitForUserInteraction();
					}
				}

				// 清除状态
				window.musicPlayerState = null;
			});
		}

		// 等待用户交互后恢复播放
		function waitForUserInteraction() {
			// 避免重复设置监听器
			if (window.waitingForInteraction) {
				return;
			}

			window.waitingForInteraction = true;

			const resumePlay = () => {
				if (
					window.musicPlayer &&
					window.musicPlayer.audio &&
					window.musicPlayer.audio.paused &&
					typeof window.musicPlayer.play === "function"
				) {
					try {
						const playPromise = window.musicPlayer.play();
						if (playPromise && typeof playPromise.catch === "function") {
							playPromise.catch(() => {
								console.log("仍无法自动播放，等待下次交互");
							});
						}
					} catch (error) {
						console.log("播放器调用失败:", error);
					}
				}
				// 重置等待状态
				window.waitingForInteraction = false;
			};

			// 监听多种用户交互事件，使用 once: true 自动移除
			document.addEventListener("click", resumePlay, { once: true });
			document.addEventListener("keydown", resumePlay, { once: true });
			document.addEventListener("touchstart", resumePlay, { once: true });
		}

		console.log("音乐播放器初始化成功");
	} catch (error) {
		console.error("音乐播放器初始化失败:", error);
	}
})();
