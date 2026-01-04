import Key from "@i18n/i18nKey";
import type { Translation } from "@i18n/translation";

export const zh_CN: Translation = {
	[Key.home]: "主页",
	[Key.about]: "关于",
	[Key.friends]: "友链",
	[Key.archive]: "归档",
	[Key.search]: "搜索",

	[Key.tags]: "标签",
	[Key.categories]: "分类",
	[Key.recentPosts]: "最新文章",

	[Key.untitled]: "无标题",
	[Key.uncategorized]: "未分类",
	[Key.noTags]: "无标签",
	[Key.noSeries]: "无系列",

	[Key.wordCount]: "字",
	[Key.wordsCount]: "字",
	[Key.minuteCount]: "分钟",
	[Key.minutesCount]: "分钟",
	[Key.postCount]: "篇文章",
	[Key.postsCount]: "篇文章",

	[Key.byTime]: "按时间",
	[Key.bySeries]: "按系列",
	[Key.byCategory]: "按分类",
	[Key.byTag]: "按标签",

	[Key.numberOfSeries]: "{n}个系列",
	[Key.numberOfArticles]: "{n}篇文章",

	[Key.themeColor]: "主题色",

	[Key.lightMode]: "亮色",
	[Key.darkMode]: "暗色",
	[Key.systemMode]: "跟随系统",

	[Key.more]: "更多",

	[Key.author]: "作者",
	[Key.publishedAt]: "发布于",
	[Key.license]: "许可协议",
	[Key.series]: "系列",

	[Key.totalArticles]: "文章总数",
	[Key.totalSeries]: "系列总数",
	[Key.totalTags]: "标签总数",
	[Key.totalCategories]: "分类总数",
	[Key.totalWords]: "总字数",
	[Key.blogInfo]: "博客信息",
	[Key.runningTime]: "运行时间",
	[Key.relatedPosts]: "相关文章",

	[Key.pinned]: "置顶",
	[Key.pinnedToBottom]: "置底",
	[Key.disabledEffects]: "禁用效果",

	[Key.share]: "分享",
	[Key.shareToTwitter]: "分享到 Twitter",
	[Key.shareToFacebook]: "分享到 Facebook",
	[Key.copyLink]: "复制链接",
	[Key.clearAll]: "清除全部",

	[Key.playlist]: "播放列表",

	[Key.noResults]: "未找到相关内容",

	[Key.toc]: "目录",

	[Key.statistics]: "统计",
	[Key.totalPageviews]: "总浏览量",
	[Key.totalVisits]: "访问数",
	[Key.totalVisitors]: "游客数",
	[Key.runningTimeStatus]: "⭐本站已运行: {d}天{h}小时{m}分{s}秒 ☁️",

	[Key.aiSummary]: "AI 摘要",
	[Key.aiModel]: "Gemini 2.5 Pro",

	[Key.pageNotFoundTitle]: "页面未找到",
	[Key.pageNotFoundHeading]: "页面走丢了",
	[Key.pageNotFoundDescription]: "抱歉，您访问的页面不存在或已被移动。\n请检查URL是否正确，或者返回首页继续浏览。",
	[Key.pageNotFoundHomeButton]: "返回首页",
	[Key.pageNotFoundArchiveButton]: "文章归档",
	[Key.pageNotFoundBackButtonHint]: "您也可以使用浏览器的后退按钮返回上一页",

	// RSS页面
	[Key.rss]: "RSS 订阅",
	[Key.rssDescription]: "订阅获取最新更新",
	[Key.rssSubtitle]: "通过 RSS 订阅，第一时间获取最新文章和动态",
	[Key.rssLink]: "RSS 链接",
	[Key.rssCopyToReader]: "复制链接到你的 RSS 阅读器",
	[Key.rssCopyLink]: "复制链接",
	[Key.rssLatestPosts]: "最新文章",
	[Key.rssWhatIsRSS]: "什么是 RSS？",
	[Key.rssWhatIsRSSDescription]: "RSS（Really Simple Syndication）是一种用于发布经常更新内容的标准格式。通过 RSS，你可以：",
	[Key.rssBenefit1]: "及时获取网站最新内容，无需手动访问",
	[Key.rssBenefit2]: "在一个地方管理多个网站的订阅",
	[Key.rssBenefit3]: "避免错过重要更新和文章",
	[Key.rssBenefit4]: "享受无广告的纯净阅读体验",
	[Key.rssHowToUse]: "推荐使用 Feedly、Inoreader 或其他 RSS 阅读器来订阅本站。",
	[Key.rssCopied]: "RSS 链接已复制到剪贴板！",
	[Key.rssCopyFailed]: "复制失败，请手动复制链接",

	//最后编辑时间卡片
	[Key.lastModifiedPrefix]: "最后更新于 ",
	[Key.lastModifiedOutdated]: "部分内容可能已过时",
	[Key.lastModifiedDaysAgo]: "距今已过 {days} 天",
	[Key.year]: "年",
	[Key.month]: "月",
	[Key.day]: "日",
	[Key.hour]: "时",
	[Key.minute]: "分",
	[Key.second]: "秒",

	[Key.langMismatchNotice]: "检测到您的首选语言为简体中文。",
	[Key.langMismatchConfirm]: "切换到简体中文",

	// Webmentions
	[Key.webmentions]: "Webmentions 引用",
	[Key.noWebmentions]: "暂无引用",
	[Key.failedToLoadWebmentions]: "无法加载引用数据",
	[Key.likes]: "次赞",
	[Key.reposts]: "次转发",
	[Key.mentions]: "次提及",

	// Footer Build Date
	[Key.lastBuildAt]: "最后构建于",

	// Twikoo Lite
	[Key.reply]: "回复",
	[Key.replyTo]: "回复 @{nick}:",
	[Key.noComments]: "暂无评论，来做第一个吧！",
	[Key.placeholder]: "支持 Markdown 语法...",
	[Key.nickRequired]: "请输入昵称",
	[Key.sending]: "发送中...",
	[Key.submitFailed]: "提交失败",
	[Key.blogger]: "博主",
	[Key.refresh]: "刷新评论",
	[Key.email]: "邮箱",
	[Key.website]: "网址",
	[Key.repliesCount]: "个回复",
	[Key.commentsCount]: "条评论",
	[Key.cancel]: "取消",
	[Key.like]: "喜欢",
	[Key.login]: "登录管理",
	[Key.logout]: "退出管理",
	[Key.loginSuccess]: "登录成功",
	[Key.loginFailed]: "登录失败，请检查密码",
	[Key.delete]: "删除",
	[Key.deleteConfirm]: "确认删除这条评论吗？",
	[Key.submit]: "提交评论",
	[Key.pin]: "置顶",
	[Key.unpin]: "取消置顶",
	[Key.pinnedTag]: "置顶",
	[Key.invalidEmail]: "邮箱格式不正确",
	[Key.unknownError]: "未知错误",
	[Key.adminPasswordPrompt]: "请输入管理密码：",
	[Key.deleteFailed]: "删除失败",
	[Key.operationFailed]: "操作失败",
	[Key.twikooVersionMismatch]: "⚠️ Twikoo 版本不匹配",
	[Key.twikooClient]: "TwikooLite 版本 v{version}",
	[Key.twikooServer]: "Twikoo 版本 v{version}",
	[Key.twikooPoweredBy]: "由 Twikoo 提供支持",
};
