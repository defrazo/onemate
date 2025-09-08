// Сбор данных о браузере
export const getBrowserInfo = () => {
	const agent = navigator.userAgent;
	let browser = 'Неизвестный';

	if (/Edg/i.test(agent)) browser = 'Edge';
	else if (/OPR/i.test(agent)) browser = 'Opera';
	else if (/Chrome/i.test(agent)) browser = 'Chrome';
	else if (/Firefox/i.test(agent)) browser = 'Firefox';
	else if (/Safari/i.test(agent)) browser = 'Safari';

	const isPhone = /Mobi|Android|iPhone/i.test(agent);

	return { browser, isPhone };
};

// Возвращает унифицированный ключ для демо-записей в LS
export const key = (id: string, feature: string) => `onemate_${feature}_demo_${id}`;
