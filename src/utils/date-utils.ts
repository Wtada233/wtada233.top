import dayjs from "dayjs";

export function formatDateToYYYYMMDD(date: Date): string {
	return dayjs(date).format("YYYY-MM-DD");
}
