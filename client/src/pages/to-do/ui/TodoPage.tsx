import { type ReactNode, useEffect, useRef, useState } from 'react';
import { IconPlus } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { LS_PREFIX } from '@/shared/config';
import { usePageTitle } from '@/shared/lib/hooks';
import { Button, CollectionTabs, ConfirmDialog, InlineEdit, LoadingError, Spinner } from '@/shared/ui';

import { TodoRepo } from '../api';
import { TODO_LIMITS, type TodoList, TodoStore } from '../model';
import { ListCard, ListDialog } from '.';

export const TodoPage = observer(() => {
	usePageTitle('To Do');

	const { userStore, modalStore } = useStore();
	const [store] = useState(() => new TodoStore(new TodoRepo(), userStore));

	const [selected, setSelected] = useState<{ userId: string | null; id: string } | null>(null);
	const [editingId, setEditingId] = useState<string>();
	const [draft, setDraft] = useState('');
	const [validation, setValidation] = useState<string | null>(null);

	const ownedModal = useRef<ReactNode>(null);
	const active = useRef(false);

	useEffect(() => {
		active.current = true;
		store.init();
		return () => {
			active.current = false;
			store.destroy();
			if (ownedModal.current && modalStore.modal?.content === ownedModal.current) modalStore.closeModal();
		};
	}, [store, modalStore]);

	const storageKey = `${LS_PREFIX}todo_canvas_${userStore.id}`;
	let remembered: string | null = null;
	try {
		remembered = localStorage.getItem(storageKey);
	} catch {
		/* Storage may be unavailable. */
	}
	const requestedId = selected?.userId === userStore.id ? selected.id : remembered;
	const canvas =
		store.canvases.find(({ id }) => id === requestedId) ??
		store.canvases.find(({ title }) => title === 'Общее') ??
		store.canvases[0];

	const select = (id: string) => {
		setSelected({ userId: userStore.id, id });
		setEditingId(undefined);
		setValidation(null);
		try {
			localStorage.setItem(storageKey, id);
		} catch {
			/* Keep selection in memory. */
		}
	};

	const open = (content: ReactNode) => {
		ownedModal.current = content;
		modalStore.setModal(content);
	};

	const save = async (operation: () => Promise<void>) => {
		if (store.isLoading) return false;
		const userId = userStore.id;
		await operation();
		return active.current && userStore.id === userId && !store.error;
	};

	const createCanvas = () =>
		open(
			<ListDialog
				maxLength={TODO_LIMITS.CANVAS_TITLE}
				title="Новый холст"
				withColor={false}
				onClose={modalStore.closeModal}
				onSubmit={async (title) => {
					const ids = new Set(store.canvases.map((entry) => entry.id));
					if (!(await save(() => store.createCanvas(title)))) return false;
					const created = store.canvases.find((entry) => !ids.has(entry.id));
					if (created) select(created.id);
					return true;
				}}
			/>
		);

	const editList = (list?: TodoList) => {
		if (!canvas) return;
		open(
			<ListDialog
				initialColor={list?.color}
				initialTitle={list?.title}
				title={list ? 'Редактировать список' : 'Новый список'}
				onClose={modalStore.closeModal}
				onSubmit={(title, color) =>
					save(() =>
						list ? store.updateList(list.id, { title, color }) : store.createList(canvas.id, title, color)
					)
				}
			/>
		);
	};

	const confirmDelete = (title: string, description: string, operation: () => Promise<void>) =>
		open(
			<ConfirmDialog
				confirmLabel="Удалить"
				description={description}
				title={title}
				variant="danger"
				onCancel={modalStore.closeModal}
				onConfirm={() => {
					if (store.isLoading) return;
					modalStore.closeModal();
					void operation();
				}}
			/>
		);

	const rename = async () => {
		if (!editingId || store.isLoading) return;

		if (!draft.trim()) {
			setValidation('Введите название холста');
			return;
		}

		if (await save(() => store.renameCanvas(editingId, draft.trim()))) {
			setEditingId(undefined);
			setValidation(null);
		}
	};

	if (!canvas && !store.error)
		return <LoadingError message="Что-то пошло не так..." size="xl" onRetry={() => store.reload()} />;

	return (
		<section className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
			<CollectionTabs
				activeId={canvas?.id}
				canCreate={store.canvases.length < TODO_LIMITS.CANVASES}
				canDelete={store.canvases.length > 1}
				disabled={store.isLoading}
				editingId={editingId}
				editor={
					<InlineEdit
						label="Название холста"
						maxLength={TODO_LIMITS.CANVAS_TITLE}
						saving={store.isLoading}
						value={draft}
						onCancel={() => {
							setEditingId(undefined);
							setValidation(null);
						}}
						onChange={setDraft}
						onConfirm={() => void rename()}
					/>
				}
				items={store.canvases}
				label="Холсты ToDo"
				onCreate={createCanvas}
				onDelete={(id) => {
					if (store.canvases.length <= 1) return;
					const target = store.canvases.find((entry) => entry.id === id);
					confirmDelete(
						'Удаление холста',
						`Удалить холст «${target?.title}» со всеми списками и пунктами?`,
						() => store.deleteCanvas(id)
					);
				}}
				onRename={(id) => {
					setDraft(store.canvases.find((entry) => entry.id === id)?.title ?? '');
					setEditingId(id);
					setValidation(null);
				}}
				onSelect={select}
			/>
			{validation && (
				<p className="text-sm text-(--status-error)" role="alert">
					{validation}
				</p>
			)}
			{store.error && (
				<div
					className="flex items-center justify-between gap-3 rounded-lg bg-(--status-error-muted) p-3 text-sm text-(--status-error)"
					role="alert"
				>
					<span>{store.error}</span>
					<Button disabled={store.isLoading} onClick={() => void store.reload()}>
						Обновить
					</Button>
				</div>
			)}
			{canvas && (
				<>
					<div className="flex items-center justify-between gap-3">
						<div className="flex items-center gap-2 text-sm text-(--text-secondary)">
							<span>
								{canvas.lists.length} / {TODO_LIMITS.LISTS} списков
							</span>
							{store.isLoading && (
								<span aria-label="Сохранение" role="status">
									<Spinner className="size-4 border-2" />
								</span>
							)}
						</div>
						<Button
							className="text-sm"
							disabled={store.isLoading || canvas.lists.length >= TODO_LIMITS.LISTS}
							leftIcon={<IconPlus className="size-4" />}
							variant="accent"
							onClick={() => editList()}
						>
							Добавить список
						</Button>
					</div>
					{canvas.lists.length === 0 && (
						<div className="rounded-lg border border-dashed border-(--border-primary) p-6 text-center">
							<p className="font-semibold">Холст пуст</p>
							<p className="mt-1 text-sm text-(--text-secondary)">
								Добавьте список, чтобы начать планирование
							</p>
						</div>
					)}
					<div className="@container min-h-0 min-w-0 flex-1 overflow-auto pb-3">
						<div
							key={`${userStore.id}:${canvas.id}`}
							className="core-gap grid min-w-140 grid-cols-2 items-start xl:grid-cols-4 @min-[35rem]:min-w-0 max-xl:@min-[52rem]:grid-cols-3"
						>
							{Array.from({ length: TODO_LIMITS.LISTS }, (_, slot) => {
								const list = canvas.lists.find((entry) => entry.slot === slot);
								return list ? (
									<ListCard
										key={list.id}
										list={list}
										store={store}
										onDelete={() =>
											confirmDelete(
												'Удаление списка',
												`Удалить список «${list.title}» со всеми пунктами?`,
												() => store.deleteList(list.id)
											)
										}
										onEdit={() => editList(list)}
									/>
								) : (
									<div key={`empty-${slot}`} aria-hidden="true" className="invisible min-h-12" />
								);
							})}
						</div>
					</div>
				</>
			)}
		</section>
	);
});
