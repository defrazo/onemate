import { userStore } from '@/entities/user';
import { supabase } from '@/shared/lib/supabase';

import type { ActivityLog } from '.';

const TABLE = 'user_auth_log';

export const deviceActivityService = {
	async loadActivityLog(): Promise<ActivityLog[]> {
		const id = userStore.getIdOrThrow();

		const { data, error } = await supabase
			.from(TABLE)
			.select('*')
			.eq('user_id', id)
			.order('created_at', { ascending: false });

		if (error) throw new Error(`Ошибка получения истории активности: ${error.message}`);

		return data;
	},

	async saveActivityLog(log: Omit<ActivityLog, 'id' | 'created_at' | 'user_id'>): Promise<ActivityLog> {
		const id = userStore.getIdOrThrow();

		const logWithUser = { ...log, user_id: id };

		const { data: inserted, error: insertError } = await supabase
			.from(TABLE)
			.insert([logWithUser])
			.select()
			.single();

		if (insertError) throw new Error(`Ошибка сохранения истории активности: ${insertError.message}`);

		const { data: allLogs, error: selectError } = await supabase
			.from(TABLE)
			.select('id')
			.eq('user_id', id)
			.order('created_at', { ascending: false });

		if (!selectError && allLogs.length > 10) {
			const logsToDelete = allLogs.slice(10);
			const ids = logsToDelete.map((entry) => entry.id);
			await supabase.from(TABLE).delete().in('id', ids);
		}

		return inserted;
	},
};
