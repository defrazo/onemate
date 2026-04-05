import { supabase } from '@/shared/lib/supabase';

import type { Column } from '../model';
import { getCurrentUser, mapColumnFromDb, mapColumnToDb, mapColumnUpdateToDb } from '.';

const KANBAN_COLUMNS = 'kanban_columns';

export const fetchColumnsApi = async (): Promise<Column[]> => {
	const user = await getCurrentUser();

	const { data, error } = await supabase
		.from(KANBAN_COLUMNS)
		.select('*')
		.eq('user_id', user.id)
		.order('position', { ascending: true });

	if (error) throw error;
	if (!data) return [];

	return data.map(mapColumnFromDb);
};

export const addColumnApi = async (column: Omit<Column, 'id'>): Promise<Column> => {
	const user = await getCurrentUser();

	const { data, error } = await supabase
		.from(KANBAN_COLUMNS)
		.insert({
			...mapColumnToDb(column),
			user_id: user.id,
		})
		.select()
		.single();

	if (error) throw error;

	return mapColumnFromDb(data);
};

export const editColumnApi = async (id: string, column: Omit<Column, 'id' | 'position'>): Promise<Column> => {
	const user = await getCurrentUser();

	const { data, error } = await supabase
		.from(KANBAN_COLUMNS)
		.update(mapColumnUpdateToDb(column))
		.eq('id', id)
		.eq('user_id', user.id)
		.select()
		.single();

	if (error) throw error;

	return mapColumnFromDb(data);
};

export const deleteColumnApi = async (id: string): Promise<void> => {
	const user = await getCurrentUser();

	const { error } = await supabase.from(KANBAN_COLUMNS).delete().eq('id', id).eq('user_id', user.id);

	if (error) throw error;
};

export const moveColumnApi = async (id: string, newPosition: number) => {
	const user = await getCurrentUser();

	const { data, error } = await supabase
		.from(KANBAN_COLUMNS)
		.update({ position: newPosition })
		.eq('id', id)
		.eq('user_id', user.id)
		.select()
		.single();

	if (error) throw error;

	return mapColumnFromDb(data);
};
