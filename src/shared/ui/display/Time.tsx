import { useEffect, useState } from 'react';

const Time = () => {
	const [time, setTime] = useState(getCurrentTime());

	useEffect(() => {
		const interval = setInterval(() => {
			setTime(getCurrentTime());
		}, 60000); // Обновление каждую минуту

		return () => clearInterval(interval);
	}, []);

	function getCurrentTime() {
		return new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
	}

	return (
		<div className="hidden min-w-21 font-[DS-Digital] text-4xl font-bold text-[var(--accent-default)] md:flex md:justify-center">
			{time}
		</div>
	);
};

export default Time;
