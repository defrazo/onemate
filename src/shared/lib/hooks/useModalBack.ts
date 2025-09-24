/**
 * useModalBack – хук для установки действия "назад" в модалке на мобильных устройствах.
 *
 * На мобильных устройствах заменяет обработчик кнопки "назад" так,
 * чтобы при его вызове открывалась переданная модалка в режиме "sheet".
 * При размонтировании сбрасывает обработчик "назад" в store.
 *
 * @param target – React-элемент модалки, который нужно открыть при возврате назад
 */

import { type ReactNode, useEffect } from 'react';

import { useStore } from '@/app/providers';

import { useDeviceType } from '.';

export const useModalBack = (target: ReactNode) => {
	const { modalStore } = useStore();
	const device = useDeviceType();

	useEffect(() => {
		if (device !== 'mobile') return;
		modalStore.setBack(() => modalStore.setModal(target, 'sheet'));
		return () => modalStore.resetBack();
	}, [device, modalStore, target]);
};
