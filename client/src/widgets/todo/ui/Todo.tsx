import { useCallback, useEffect } from 'react';
import { IconListSearch } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { Link, LoadingError, NoContent, SyncIndicator } from '@/shared/ui';

import { ListContent, ListSwitcher } from './components';

export const Todo = observer(() => {
	const { todoStore } = useStore();

	const list = todoStore.activeList;

	const handleLoad = useCallback(() => void todoStore.ensureLoaded(), [todoStore]);

	useEffect(() => handleLoad(), [handleLoad]);

	if (!todoStore.isReady) return <LoadingError error={!todoStore.isLoading} size="lg" onRetry={handleLoad} />;

	if (!list)
		return (
			<NoContent
				description="Создайте первый список на странице ToDo"
				icon={IconListSearch}
				title="Пока нет списков"
			>
				<Link className="h-6 rounded-md text-xs" disabled={todoStore.isLoading} to="/todo">
					Перейти в ToDo
				</Link>
			</NoContent>
		);

	return (
		<div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-hidden">
			<ListSwitcher
				canvases={todoStore.canvases}
				disabled={todoStore.isLoading}
				value={list.id}
				onChange={(id) => todoStore.setSelectedList(id)}
			/>
			<ListContent key={list.id} list={list} />
			{todoStore.isSyncing && <SyncIndicator />}
		</div>
	);
});
