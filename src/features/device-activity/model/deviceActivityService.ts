import { supabase } from '@/shared/lib/supabase';

import type { ActivityLog } from '.';

const TABLE = 'user_auth_log';
const MAX_LOGS = 10;

export const deviceActivityService = {
	async loadActivityLog(id: string): Promise<ActivityLog[]> {
		const { data, error } = await supabase
			.from(TABLE)
			.select('*')
			.eq('user_id', id)
			.order('created_at', { ascending: false })
			.limit(MAX_LOGS);

		if (error) throw new Error(`Произошла ошибка при загрузке истории активности: ${error.message}`);

		return (data ?? []) as ActivityLog[];
	},

	async saveActivityLog(id: string, log: Omit<ActivityLog, 'id' | 'created_at' | 'user_id'>): Promise<ActivityLog> {
		const { data, error } = await supabase
			.from(TABLE)
			.insert([{ ...log, user_id: id }])
			.select()
			.single();

		if (error) throw new Error(`Произошла ошибка при сохранении истории активности: ${error.message}`);

		void deviceActivityService.pruneActivityLog(id);

		return data as ActivityLog;
	},

	async pruneActivityLog(id: string): Promise<void> {
		const { data, error } = await supabase
			.from(TABLE)
			.select('id')
			.eq('user_id', id)
			.order('created_at', { ascending: false });

		if (error) throw new Error(`Произошла ошибка при обновлении истории активности: ${error.message}`);

		if (data.length > MAX_LOGS) {
			const logsToDelete = data.slice(MAX_LOGS);
			const ids = logsToDelete.map((entry) => entry.id);
			await supabase.from(TABLE).delete().in('id', ids);
		}
	},

	async deleteActivityLog(id: string): Promise<void> {
		const { error } = await supabase.from(TABLE).delete().eq('user_id', id);
		if (error) throw new Error(`Произошла ошибка при очистке истории активности: ${error.message}`);
	},
};
