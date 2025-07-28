import { makeAutoObservable } from 'mobx';

import type { ModalType } from '../ui';

interface ModalConfig {
	content: React.ReactNode;
	type: ModalType;
	back?: () => void;
	position?: { top: number; left: number };
	onClose?: () => void;
}

export class ModalStore {
	modal: ModalConfig | null = null;

	get modalType() {
		return this.modal?.type;
	}

	setModal(
		content: React.ReactNode,
		type: ModalType = 'auto',
		options?: { back?: () => void; position?: { top: number; left: number }; onClose?: () => void }
	) {
		this.modal = {
			content,
			type,
			back: options?.back,
			position: options?.position,
			onClose: options?.onClose,
		};

		document.body.style.overflow = 'hidden';
	}

	closeModal = () => {
		this.modal = null;
		document.body.style.overflow = '';
	};

	setBack(handler: () => void) {
		if (this.modal) this.modal.back = handler;
	}

	resetBack() {
		if (this.modal) this.modal.back = undefined;
	}

	constructor() {
		makeAutoObservable(this);
	}
}

export const modalStore = new ModalStore();
