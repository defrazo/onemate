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

import { useIsMobile } from '.';

export const useModalBack = (target: ReactNode) => {
	const { modalStore } = useStore();
	const isMobile = useIsMobile();

	useEffect(() => {
		if (!isMobile) return;
		modalStore.setBack(() => modalStore.setModal(target, 'sheet'));
		return () => modalStore.resetBack();
	}, [isMobile, modalStore, target]);
};
