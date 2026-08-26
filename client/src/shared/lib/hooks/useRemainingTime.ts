/**
 * useRemainingTime – хук для отсчета оставшегося времени.
 *
 * @param startAt – время начала отсчета (ISO)
 * @param ttlMs – время жизни в мс
 *
 * Возвращает оставшееся время и флаг expired.
 * Использовать ttlMs в мс (конвертеры в utils/time).
 */

import { useEffect, useState } from 'react';

import { MS_IN_DAY, MS_IN_HOUR, MS_IN_MINUTE, MS_IN_SECOND } from '../utils/time';

export const useRemainingTime = (startAt: string | null, ttlMs: number) => {
	const [timeLeft, setTimeLeft] = useState<number>(ttlMs);

	useEffect(() => {
		if (!startAt) return;

		const deletedTime = new Date(startAt).getTime();
		const expirationTime = deletedTime + ttlMs;

		const update = () => {
			const now = Date.now();
			const remaining = expirationTime - now;
			setTimeLeft(remaining > 0 ? remaining : 0);
		};

		update();
		const interval = setInterval(update, 1000);
		return () => clearInterval(interval);
	}, [startAt, ttlMs]);

	const days = Math.floor(timeLeft / MS_IN_DAY);
	const hours = Math.floor((timeLeft % MS_IN_DAY) / MS_IN_HOUR);
	const minutes = Math.floor((timeLeft % MS_IN_HOUR) / MS_IN_MINUTE);
	const seconds = Math.floor((timeLeft % MS_IN_MINUTE) / MS_IN_SECOND);

	return { days, hours, minutes, seconds, expired: timeLeft <= 0 };
};
