import { makeAutoObservable } from 'mobx';
import type { ReactNode } from 'react';

import type { ModalConfig, ModalOptions, ModalType } from '.';

export class ModalStore {
	private history: ModalConfig[] = [];

	modal: ModalConfig | null = null;

	get modalType(): ModalType | undefined {
		return this.modal?.type;
	}

	get canGoBack(): boolean {
		return this.history.length > 0;
	}

	setModal(content: ReactNode, type: ModalType = 'auto', options?: ModalOptions): void {
		this.history = [];
		this.openModal(content, type, options);
	}

	pushModal(content: ReactNode, type: ModalType = 'auto', options?: ModalOptions): void {
		if (this.modal) this.history = [...this.history, this.modal];
		this.openModal(content, type, options);
	}

	goBack(): void {
		if (!this.canGoBack) return;

		const previous = this.history[this.history.length - 1];

		this.history = this.history.slice(0, -1);
		this.modal = previous;
	}

	closeModal(): void {
		this.modal = null;
		this.history = [];
		document.body.style.overflow = '';
	}

	private openModal(content: ReactNode, type: ModalType, options?: ModalOptions): void {
		this.modal = { content, type, position: options?.position, onClose: options?.onClose };
		document.body.style.overflow = 'hidden';
	}

	constructor() {
		makeAutoObservable(this, {}, { autoBind: true, deep: false });
	}
}
