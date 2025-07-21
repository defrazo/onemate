import { makeAutoObservable } from 'mobx';

import { storage } from '@/shared/lib/storage';

class DashboardStore {
	topWidgets = ['calculator', 'calendar', 'notes'];
	bottomWidgets = ['currency', 'weather', 'translator'];

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

	constructor() {
		makeAutoObservable(this);
		this.load();
	}
}

export const dashboardStore = new DashboardStore();
