import Key from "@i18n/i18nKey";
import type { Translation } from "@i18n/translation";

export const ja: Translation = {
	[Key.home]: "Home",
	[Key.about]: "About",
	[Key.friends]: "友達",
	[Key.archive]: "Archive",
	[Key.search]: "検索",

	[Key.tags]: "タグ",
	[Key.categories]: "カテゴリ",
	[Key.recentPosts]: "最近の投稿",

	[Key.untitled]: "タイトルなし",
	[Key.uncategorized]: "カテゴリなし",
	[Key.noTags]: "タグなし",
	[Key.noSeries]: "シリーズなし",

	[Key.wordCount]: "文字",
	[Key.wordsCount]: "文字",
	[Key.minuteCount]: "分",
	[Key.minutesCount]: "分",
	[Key.postCount]: "件の投稿",
	[Key.postsCount]: "件の投稿",

	[Key.byTime]: "時間順",
	[Key.bySeries]: "シリーズ順",
	[Key.byCategory]: "カテゴリ順",
	[Key.byTag]: "タグ順",

	[Key.numberOfSeries]: "{n} シリーズ",
	[Key.numberOfArticles]: "{n} 記事",

	[Key.themeColor]: "テーマカラー",

	[Key.lightMode]: "ライト",
	[Key.darkMode]: "ダーク",
	[Key.systemMode]: "システム",

	[Key.more]: "もっと",

	[Key.author]: "作者",
	[Key.publishedAt]: "公開日",
	[Key.license]: "ライセンス",
	[Key.series]: "シリーズ",

	[Key.relatedPosts]: "関連投稿",

	// Blog Stats
	[Key.totalArticles]: "全記事",
	[Key.totalSeries]: "全シリーズ",
	[Key.totalTags]: "全タグ",
	[Key.totalCategories]: "全カテゴリ",
	[Key.totalWords]: "総語数",
	[Key.blogInfo]: "ブログ情報",
	[Key.runningTime]: "稼働時間",

	[Key.pinned]: "ピン留め",
	[Key.pinnedToBottom]: "下部にピン留め",
	[Key.disabledEffects]: "エフェクト無効",

	[Key.share]: "共有",
	[Key.shareToTwitter]: "Twitterで共有",
	[Key.shareToFacebook]: "Facebookで共有",
	[Key.copyLink]: "リンクをコピー",
	[Key.clearAll]: "すべてクリア",

	[Key.playlist]: "プレイリスト",

	[Key.noResults]: "結果が見つかりませんでした",

	[Key.toc]: "目次",

	[Key.statistics]: "統計",
	[Key.totalPageviews]: "総閲覧数",
	[Key.totalVisits]: "訪問数",
	[Key.totalVisitors]: "訪問者数",
	[Key.runningTimeStatus]: "⭐ 稼働時間: {d}日 {h}時間 {m}分 {s}秒 ☁️",

	[Key.aiSummary]: "AI 要約",
	[Key.aiModel]: "Gemini 2.5 Pro",

	[Key.pageNotFoundTitle]: "ページが見つかりません",
	[Key.pageNotFoundHeading]: "ページが見つかりません",
	[Key.pageNotFoundDescription]: "申し訳ありませんが、お探しのページは見つかりませんでした、または移動されました。\nURLを確認するか、ホームページに戻ってください。",
	[Key.pageNotFoundHomeButton]: "ホームに戻る",
	[Key.pageNotFoundArchiveButton]: "記事アーカイブ",
	[Key.pageNotFoundBackButtonHint]: "ブラウザの戻るボタンで前のページに戻ることもできます",

	//最終編集時間カード
	[Key.lastModifiedPrefix]: "最終更新日：",
	[Key.lastModifiedOutdated]: "一部の内容は古くなっている可能性があります",
	[Key.lastModifiedDaysAgo]: "{days} 日前",
	[Key.year]: "年",
	[Key.month]: "月",
	[Key.day]: "日",
	[Key.hour]: "時",
	[Key.minute]: "分",
	[Key.second]: "秒",

	[Key.langMismatchNotice]: "優先言語が日本語として検出されました。",
	[Key.langMismatchConfirm]: "日本語に切り替える",

	// RSSページ
	[Key.rss]: "RSSフィード",
	[Key.rssDescription]: "最新の更新を購読する",
	[Key.rssSubtitle]: "RSSで購読して、最新の記事と更新を第一时间で取得する",
	[Key.rssLink]: "RSSリンク",
	[Key.rssCopyToReader]: "RSSリンクをリーダーにコピー",
	[Key.rssCopyLink]: "リンクをコピー",
	[Key.rssLatestPosts]: "最新の投稿",
	[Key.rssWhatIsRSS]: "RSSとは？",
	[Key.rssWhatIsRSSDescription]: "RSS（Really Simple Syndication）は、頻繁に更新されるコンテンツを公開するための標準形式です。RSSを使用すると：",
	[Key.rssBenefit1]: "手動で訪問することなく、最新のウェブサイトコンテンツを及时に取得",
	[Key.rssBenefit2]: "1か所で複数のウェブサイトの購読を管理",
	[Key.rssBenefit3]: "重要な更新や記事を見逃すことを回避",
	[Key.rssBenefit4]: "広告なしのクリーンな読書体験を楽しむ",
	[Key.rssHowToUse]: "Feedly、Inoreaderまたは他のRSSリーダーを使用してこのサイトを購読することを推奨します。",
	[Key.rssCopied]: "RSSリンクがクリップボードにコピーされました！",
	[Key.rssCopyFailed]: "コピーに失敗しました。手動でリンクをコピーしてください",

	// Webmentions
	[Key.webmentions]: "Webmentions",
	[Key.noWebmentions]: "Webmention はまだありません",
	[Key.failedToLoadWebmentions]: "Webmention の読み込みに失敗しました",
	[Key.likes]: "いいね",
	[Key.reposts]: "リポスト",
	[Key.mentions]: "メンション",

	// Footer Build Date
	[Key.lastBuildAt]: "最終ビルド日時",

	// Twikoo Lite
	[Key.reply]: "返信",
	[Key.replyTo]: "@{nick} に返信:",
	[Key.noComments]: "コメントはまだありません。最初のコメントを書いてみませんか？",
	[Key.placeholder]: "Markdownをサポートしています...",
	[Key.nickRequired]: "ニックネームを入力してください",
	[Key.sending]: "送信中...",
	[Key.submitFailed]: "送信に失敗しました",
	[Key.blogger]: "ブロガー",
	[Key.refresh]: "コメントを更新",
	[Key.email]: "メールアドレス",
	[Key.website]: "ウェブサイト",
	[Key.repliesCount]: "件の返信",
	[Key.commentsCount]: "件のコメント",
	[Key.cancel]: "キャンセル",
	[Key.like]: "いいね",
	[Key.login]: "管理者ログイン",
	[Key.logout]: "ログアウト",
	[Key.loginSuccess]: "ログインに成功しました",
	[Key.loginFailed]: "ログインに失敗しました。パスワードを確認してください",
	[Key.delete]: "削除",
	[Key.deleteConfirm]: "このコメントを削除してもよろしいですか？",
	[Key.submit]: "コメントを送信",
	[Key.pin]: "固定する",
	[Key.unpin]: "固定を解除",
	[Key.pinnedTag]: "固定済み",
	[Key.invalidEmail]: "メールアドレスの形式が正しくありません",
	[Key.unknownError]: "不明なエラー",
	[Key.adminPasswordPrompt]: "管理者パスワードを入力してください：",
	[Key.deleteFailed]: "削除に失敗しました",
	[Key.operationFailed]: "操作に失敗しました",
	[Key.twikooVersionMismatch]: "⚠️ Twikoo バージョン不一致",
	[Key.twikooClient]: "TwikooLite v{version}",
	[Key.twikooServer]: "Twikoo v{version}",
	[Key.twikooPoweredBy]: "Powered by",
};
