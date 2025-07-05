import { makeAutoObservable } from 'mobx';

type ModalType = 'modal' | 'bottom-sheet' | 'dropdown' | 'auto' | 'none';

interface ModalConfig {
	content: React.ReactNode;
	type?: ModalType;
	back?: () => void;
	position?: { top: number; left: number };
	onClose?: () => void;
}

export class UIStore {
	theme: 'light' | 'dark' = 'dark';
	modal: ModalConfig | null = null;

	get currentTheme() {
		return this.theme === 'light' ? 'Светлая' : 'Темная';
	}

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
	}

	setBack(handler: () => void) {
		if (this.modal) this.modal.back = handler;
	}

	resetBack() {
		if (this.modal) this.modal.back = undefined;
	}

	closeModal = () => {
		this.modal = null;
	};

	setTheme(theme: 'light' | 'dark') {
		this.theme = theme;
		localStorage.setItem('theme', theme);
		this.applyTheme(theme);
	}

	toggleTheme() {
		const newTheme = this.theme === 'dark' ? 'light' : 'dark';
		this.setTheme(newTheme);
	}

	private initTheme() {
		const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;

		if (savedTheme) this.setTheme(savedTheme);
		else {
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			this.setTheme(prefersDark ? 'dark' : 'light');
		}
	}

	private applyTheme(theme: 'light' | 'dark') {
		document.body.classList.toggle('light-theme', theme === 'light');
		document.body.classList.toggle('dark-theme', theme === 'dark');
	}

	constructor() {
		makeAutoObservable(this);
		this.initTheme();
	}
}
