import type { ReactNode } from 'react';
import { action, computed, makeObservable, observable } from 'mobx';

import type { ModalConfig, ModalType } from '../ui';

export class ModalStore {
	modal: ModalConfig | null = null;

	get modalType(): ModalType | undefined {
		return this.modal?.type;
	}

	setModal(
		content: ReactNode,
		type: ModalType = 'auto',
		options?: { back?: () => void; position?: { top: number; left: number }; onClose?: () => void }
	): void {
		this.modal = {
			content,
			type,
			back: options?.back,
			position: options?.position,
			onClose: options?.onClose,
		};

		document.body.style.overflow = 'hidden';
	}

	closeModal(): void {
		this.modal = null;
		document.body.style.overflow = '';
	}

	setBack(handler: () => void): void {
		if (this.modal) this.modal.back = handler;
	}

	resetBack(): void {
		if (this.modal) this.modal.back = undefined;
	}

	constructor() {
		makeObservable(this, {
			modal: observable.ref,
			modalType: computed,
			setModal: action.bound,
			closeModal: action.bound,
			setBack: action.bound,
			resetBack: action.bound,
		});
	}
}
