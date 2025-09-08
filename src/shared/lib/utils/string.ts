// Приводит нижнерегистровую строку к виду с заглавной первой буквой
export const capitalizeFirstLetter = (str: string): string => {
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Форматирует мобильный номер телефона по 	маске
export const formatPhone = (raw: string, isErase?: boolean): string => {
	const digits = raw.replace(/\D/g, '');
	const clean = digits.startsWith('7') || digits.startsWith('8') ? digits.slice(1) : digits;

	if (!clean.length) return '+7';

	if (isErase && !clean.length) return '';

	const parts = [clean.slice(0, 3), clean.slice(3, 6), clean.slice(6, 8), clean.slice(8, 10)];
	const erasing = isErase && !parts[1] && !parts[2] && !parts[3];

	let formatted = '+7';

	if (parts[0]) formatted += ` (${parts[0]}`;
	if (parts[0]?.length === 3 && !erasing) formatted += ')';
	if (parts[1]) formatted += ` ${parts[1]}`;
	if (parts[2]) formatted += `-${parts[2]}`;
	if (parts[3]) formatted += `-${parts[3]}`;

	return formatted;
};

// Форматирует число с обрезкой нулей после запятой.
export const formatFixed = (number: number, digits = 2, locale: string = 'ru-RU'): string => {
	const rounded = Number(number.toFixed(digits));
	const noFraction = Math.abs(rounded - Math.trunc(rounded)) < 1e-9;

	return rounded.toLocaleString(locale, {
		minimumFractionDigits: noFraction ? 0 : digits,
		maximumFractionDigits: digits,
	});
};

// Преобразует объект в plain текст
export const toPlain = <T>(value: T): T => {
	return JSON.parse(JSON.stringify(value));
};
