import { storage } from '@/shared/lib/storage';
import { generateUUID, key, randomNumber, toPlain } from '@/shared/lib/utils';

import type { ActivityLog, IActivityRepo } from '../../model';
import { fakeLog } from '../demo';

export class ActivityRepoDemo implements IActivityRepo {
	async loadActivityLog(id: string): Promise<ActivityLog[]> {
		const stored = storage.get(key(id, 'activity'));
		const current = Array.isArray(stored) ? (stored as ActivityLog[]) : [];

		let filled: ActivityLog[];

		if (current.length < 10) filled = this.sortByDateDesc([...current, ...this.getDefault(id)]).slice(0, 10);
		else filled = this.sortByDateDesc(current);

		storage.set(key(id, 'activity'), toPlain(filled));
		return structuredClone(filled);
	}

	async saveActivityLog(id: string, log: Omit<ActivityLog, 'id' | 'created_at' | 'user_id'>): Promise<ActivityLog> {
		const logs = (storage.get(key(id, 'activity')) ?? []) as ActivityLog[];
		const withDefaults = this.attachDefaults(id, log);
		const next = this.sortByDateDesc([withDefaults, ...logs]).slice(0, 10);

		storage.set(key(id, 'activity'), toPlain(next));
		return withDefaults;
	}

	async deleteActivityLog(id: string): Promise<void> {
		storage.remove(key(id, 'activity'));
	}

	private getDefault(id: string): ActivityLog[] {
		const now = Date.now();
		return Array.from({ length: 10 }, (_, i) => {
			const jitter = randomNumber(-20, 20) * 60 * 1000;
			return fakeLog({ createdAtMs: now - i * 12 * 60 * 60 * 1000 + jitter, id });
		});
	}

	private attachDefaults(id: string, log: Omit<ActivityLog, 'id' | 'created_at' | 'user_id'>): ActivityLog {
		return { ...log, id: generateUUID(), user_id: id, created_at: new Date().toISOString() };
	}

	private sortByDateDesc(items: ActivityLog[]): ActivityLog[] {
		return [...items].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
	}
}
