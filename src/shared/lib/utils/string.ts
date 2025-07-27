// Приводит нижнерегистровую строку к виду с заглавной первой буквой
export const capitalizeFirstLetter = (str: string): string => {
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
