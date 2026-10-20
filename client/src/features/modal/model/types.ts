import type { ReactNode } from 'react';

export type ModalType = 'modal' | 'sheet' | 'dropdown' | 'auto' | 'none';

export type ModalOptions = Pick<ModalConfig, 'position' | 'onClose'>;

export type ModalConfig = {
	content: ReactNode;
	type: ModalType;
	position?: { top: number; left: number };
	onClose?: () => void;
};
