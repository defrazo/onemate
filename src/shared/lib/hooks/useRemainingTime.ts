import { useEffect, useState } from 'react';

const MS_IN_SECOND = 1000;
const MS_IN_MINUTE = 60 * MS_IN_SECOND;
const MS_IN_HOUR = 60 * MS_IN_MINUTE;
const MS_IN_DAY = 24 * MS_IN_HOUR;

const TTL_MS = 30 * MS_IN_DAY;

export const useRemainingTime = (deletedAt: string | null) => {
	const [timeLeft, setTimeLeft] = useState(TTL_MS);

	useEffect(() => {
		if (!deletedAt) return;

		const deletedTime = new Date(deletedAt).getTime();
		const expirationTime = deletedTime + TTL_MS;

		const update = () => {
			const now = Date.now();
			const remaining = expirationTime - now;
			setTimeLeft(remaining > 0 ? remaining : 0);
		};

		update();
		const interval = setInterval(update, 1000);
		return () => clearInterval(interval);
	}, [deletedAt]);

	const days = Math.floor(timeLeft / MS_IN_DAY);
	const hours = Math.floor((timeLeft % MS_IN_DAY) / MS_IN_HOUR);
	const minutes = Math.floor((timeLeft % MS_IN_HOUR) / MS_IN_MINUTE);
	const seconds = Math.floor((timeLeft % MS_IN_MINUTE) / MS_IN_SECOND);

	return { days, hours, minutes, seconds, expired: timeLeft <= 0 };
};
