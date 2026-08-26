import type { Column, Task } from '.';

export type CreateColumnInput = Omit<Column, 'id'>;
export type EditColumnInput = Omit<Column, 'id' | 'position'>;

export type CreateTaskInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;
export type EditTaskInput = Omit<Task, 'id' | 'columnId' | 'position' | 'createdAt'>;
