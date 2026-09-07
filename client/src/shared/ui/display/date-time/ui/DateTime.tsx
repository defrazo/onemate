import { useEffect, useState } from 'react';

const WEEKDAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const MONTHS = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

const getDateTime = () => {
	const now = new Date();

	return {
		time: now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
		date: `${WEEKDAYS[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]}`,
		iso: now.toISOString(),
	};
};

export const DateTime = () => {
	const [dateTime, setDateTime] = useState(getDateTime);

	useEffect(() => {
		let interval: number;

		const now = new Date();
		const delay = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

		const timeout = window.setTimeout(() => {
			setDateTime(getDateTime());
			interval = window.setInterval(() => setDateTime(getDateTime()), 60_000);
		}, delay);

		return () => {
			window.clearTimeout(timeout);
			window.clearInterval(interval);
		};
	}, []);

	return (
		<div className="hidden flex-col items-center gap-2 xl:flex">
			<time className="trim text-lg font-semibold text-(--color-primary) tabular-nums" dateTime={dateTime.iso}>
				{dateTime.time}
			</time>
			<span className="trim text-xs text-(--color-secondary)">{dateTime.date}</span>
		</div>
	);
};
