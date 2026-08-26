import type { ReactNode } from 'react';

export type ModalType = 'modal' | 'sheet' | 'dropdown' | 'auto' | 'none';

export type ModalConfig = {
	content: ReactNode;
	type: ModalType;
	back?: () => void;
	position?: { top: number; left: number };
	onClose?: () => void;
};
