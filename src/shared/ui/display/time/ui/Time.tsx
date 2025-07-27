import { useEffect, useState } from 'react';

const Time = () => {
	const getCurrentTime = () => new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
	const [time, setTime] = useState<string>(getCurrentTime());

	useEffect(() => {
		const interval = setInterval(() => {
			setTime(getCurrentTime());
		}, 60000); // Обновление каждую минуту

		return () => clearInterval(interval);
	}, []);

	return (
		<div className="hidden min-w-21 font-[DS-Digital] text-4xl font-bold text-[var(--accent-default)] md:flex md:justify-center">
			{time}
		</div>
	);
};

export default Time;
