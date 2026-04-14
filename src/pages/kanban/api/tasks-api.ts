import { supabase } from '@/shared/lib/supabase';

import type { CreateTaskInput, EditTaskInput, Task } from '../model';
import { getCurrentUser, mapTaskFromDb, mapTaskToDb } from '.';

const KANBAN_TASKS = 'kanban_tasks';

export const fetchTasksApi = async (): Promise<Task[]> => {
	const user = await getCurrentUser();

	const { data, error } = await supabase
		.from(KANBAN_TASKS)
		.select('*')
		.eq('user_id', user.id)
		.order('position', { ascending: true });

	if (error) throw error;
	if (!data) return [];

	return data.map(mapTaskFromDb);
};

export const addTaskApi = async (task: CreateTaskInput): Promise<Task> => {
	const user = await getCurrentUser();

	const { data, error } = await supabase
		.from(KANBAN_TASKS)
		.insert({ ...mapTaskToDb(task), user_id: user.id })
		.select()
		.single();

	if (error) throw error;

	return mapTaskFromDb(data);
};

export const editTaskApi = async (id: string, task: EditTaskInput): Promise<Task> => {
	const user = await getCurrentUser();

	const { data, error } = await supabase
		.from(KANBAN_TASKS)
		.update(mapTaskToDb(task))
		.eq('id', id)
		.eq('user_id', user.id)
		.select()
		.single();

	if (error) throw error;

	return mapTaskFromDb(data);
};

export const deleteTaskApi = async (id: string): Promise<void> => {
	const user = await getCurrentUser();

	const { error } = await supabase.from(KANBAN_TASKS).delete().eq('id', id).eq('user_id', user.id);

	if (error) throw error;
};

export const moveTaskApi = async (id: string, columnId: string, position: number, updatedAt: string | null) => {
	const user = await getCurrentUser();

	const { data, error } = await supabase
		.from(KANBAN_TASKS)
		.update(mapTaskToDb({ columnId, position, updatedAt }))
		.eq('id', id)
		.eq('user_id', user.id)
		.select()
		.single();

	if (error) throw error;

	return mapTaskFromDb(data);
};
