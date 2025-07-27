export const MS_IN_SECOND = 1000;
export const MS_IN_MINUTE = 60 * MS_IN_SECOND;
export const MS_IN_HOUR = 60 * MS_IN_MINUTE;
export const MS_IN_DAY = 24 * MS_IN_HOUR;

// Конвертирует секунды в миллисекунды
export const msFromSeconds = (seconds: number): number => seconds * MS_IN_SECOND;

// Конвертирует минуты в миллисекунды
export const msFromMinutes = (minutes: number): number => minutes * MS_IN_MINUTE;

// Конвертирует часы в миллисекунды
export const msFromHours = (hours: number): number => hours * MS_IN_HOUR;

// Конвертирует дни в миллисекунды
export const msFromDays = (days: number): number => days * MS_IN_DAY;

// Форматирует timestamp (секунды) в строку "часы:минуты" (например, "14:05")
export const formatTime = (timestamp: number): string => {
	return new Date(timestamp * 1000).toLocaleTimeString([], {
		hour: '2-digit',
		minute: '2-digit',
	});
};
