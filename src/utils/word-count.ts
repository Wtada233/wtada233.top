/**
 * 统计文本中的字数，支持中日韩（CJK）文字和普通单词
 * @param text 待统计的文本
 * @returns 总字数
 */
export function countWords(text: string): number {
	if (!text) return 0;
	// 匹配所有中日韩文字 (CJK)
	const cjkRegex = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f\u3131-\uD79D]/g;
	const cjkCount = (text.match(cjkRegex) || []).length;
	const wordCount = (text.replace(cjkRegex, " ").trim().split(/\s+/) || []).filter((w) => w.length > 0).length;
	return cjkCount + wordCount;
}
