type Timestamps = { created_at: string; updated_at: string };

export type TodoItem = Timestamps & {
	id: string;
	list_id: string;
	text: string;
	is_completed: boolean;
	position: number;
};

export type TodoList = Timestamps & {
	id: string;
	canvas_id: string;
	title: string;
	color: string;
	slot: number;
	is_collapsed: boolean;
	items: TodoItem[];
};

export type TodoCanvas = Timestamps & {
	id: string;
	user_id: string;
	title: string;
	lists: TodoList[];
};

export type ListChanges = Partial<Pick<TodoList, 'title' | 'color' | 'is_collapsed'>>;
export type ItemChanges = Partial<Pick<TodoItem, 'text' | 'is_completed'>>;
