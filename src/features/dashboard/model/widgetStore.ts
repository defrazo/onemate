import { makeAutoObservable } from 'mobx';

import { storage } from '@/shared/lib/storage/localStorage';

class WidgetStore {
	widgets = ['calculator', 'calendar', 'weather', 'notes', 'currency', 'translator'];

	constructor() {
		makeAutoObservable(this);
		this.load();
	}

	setOrder(order: string[]) {
		this.widgets = order;
		this.save();
	}

	load() {
		const saved = storage.get('widgets');
		if (saved) {
			this.widgets = saved;
		}
	}
	// load() {
	// 	const saved = localStorage.getItem('widgetOrder');
	// 	if (saved) {
	// 		this.widgets = JSON.parse(saved);
	// 	}
	// }

	save() {
		storage.set('widgets', this.widgets);
	}
}

export const widgetStore = new WidgetStore();
