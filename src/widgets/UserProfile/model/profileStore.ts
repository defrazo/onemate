import { makeAutoObservable } from 'mobx';

import { storage } from '@/shared/lib/storage/localStorage';

import { TabId } from '.';

export class ProfileStore {
	activeTab: TabId = storage.get('savedTab') || 'profile';

	setActiveTab(tab: TabId) {
		this.activeTab = tab;
		storage.set('savedTab', tab);
	}

	constructor() {
		makeAutoObservable(this);
	}
}

export const profileStore = new ProfileStore();
