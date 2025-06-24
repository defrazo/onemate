import copy from 'copy-to-clipboard';

import { notifyStore } from '@/shared/stores';

export const useCopy = (data: string, message?: string): void => {
	copy(data);
	notifyStore.setSuccess(message ?? 'Данные скопированы!');
};
