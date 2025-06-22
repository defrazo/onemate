import { NotifyStore } from './notifyStore';
import { UIStore } from './uiStore';

export const uiStore = new UIStore();
export const notifyStore = new NotifyStore();

export const rootStore = {
	uiStore,
	notifyStore,
};
