import { makeAutoObservable } from 'mobx';

import { storage } from '@/shared/lib/storage';

class MainPageStore {
	topWidgets = ['calculator', 'calendar', 'notes'];
	bottomWidgets = ['currency', 'weather', 'translator'];

	constructor() {
		makeAutoObservable(this);
		this.load();
	}

	setOrderTop(order: string[]) {
		this.topWidgets = order;
		this.save();
	}

	setOrderBottom(order: string[]) {
		this.bottomWidgets = order;
		this.save();
	}

	load() {
		const savedTop = storage.get('topWidgets');
		const savedBottom = storage.get('bottomWidgets');
		if (savedTop) this.topWidgets = savedTop;
		if (savedBottom) this.bottomWidgets = savedBottom;
	}

	save() {
		storage.set('topWidgets', this.topWidgets);
		storage.set('bottomWidgets', this.bottomWidgets);
	}
}

export const mainPageStore = new MainPageStore();
