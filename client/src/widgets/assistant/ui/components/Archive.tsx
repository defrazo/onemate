import { IconFolderSearch, IconHistory, IconInbox, IconPin, IconPinFilled, IconTrash } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { Button, Divider, Input, LoadingState, NoContent, ViewHeader } from '@/shared/ui';

import type { AssistantStore } from '../../model/assistant.store';

interface ArchiveProps {
	store: AssistantStore;
	onDelete: (id: string) => void;
}

const formatDate = (date: string) => new Date(date).toLocaleDateString('ru-RU');

export const Archive = observer(({ store, onDelete }: ArchiveProps) => {
	const busy = store.archiveLoading || store.archiveSaving;
	const empty = !store.archiveLoading && store.archiveItems.length === 0 && !store.archiveError;

	return (
		<section aria-label="Архив Mate AI" className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-hidden">
			<ViewHeader className="mb-2" icon={IconHistory} title="Архив диалогов" onBack={store.returnActive} />
			<Input
				aria-label="Поиск по названию диалога"
				disabled={store.archiveSaving}
				maxLength={255}
				padding="sm"
				placeholder="Поиск по названию…"
				value={store.search}
				variant="tone"
				onChange={(event) => store.setSearch(event.target.value)}
			/>
			<Divider margY="sm" />
			<div
				aria-busy={busy}
				className="min-h-0 flex-1 scrollbar-none space-y-2 overflow-y-auto overscroll-contain"
			>
				{store.archiveItems.map((item) => {
					const pinned = Boolean(item.pinned_at);

					return (
						<div
							key={item.id}
							className="group/item core-tone flex min-w-0 items-center gap-2 rounded-lg p-2"
						>
							<Button
								className="min-w-0 flex-1 flex-col items-start text-left"
								disabled={store.archiveSaving}
								padding="xs"
								variant="custom"
								onClick={() => void store.openArchived(item)}
							>
								<span className="w-full truncate text-sm" title={item.title}>
									{item.title}
								</span>
								<time className="text-xs text-(--text-disabled)" dateTime={item.last_activity_at}>
									{formatDate(item.last_activity_at)}
								</time>
							</Button>
							<Button
								active={pinned}
								aria-label={pinned ? 'Открепить диалог' : 'Закрепить диалог'}
								centerIcon={
									pinned ? (
										<IconPinFilled className="size-5 text-(--accent-primary) transition-colors hover:text-(--accent-primary-hover) xl:size-4" />
									) : (
										<IconPin className="size-5 transition-opacity xl:size-4 xl:opacity-0 xl:group-hover/item:opacity-100" />
									)
								}

								className={pinned ? 'text-(--accent-primary)' : undefined}
								disabled={busy}
								padding="none"
								variant="icon"
								onClick={() => void store.pinArchive(item)}
							/>
							<Button
								aria-label="Удалить диалог"
								centerIcon={
									<IconTrash className="size-4 transition-colors hover:text-(--status-error)" />
								}
								disabled={busy}
								padding="none"
								variant="icon"
								onClick={() => onDelete(item.id)}
							/>
						</div>
					);
				})}
				{empty && (
					<NoContent
						description={
							store.search ? 'Попробуйте изменить поисковый запрос' : 'Здесь появятся архивные диалоги'
						}
						icon={store.search ? IconFolderSearch : IconInbox}
						title={store.search ? 'Ничего не найдено' : 'Диалогов пока нет'}
					/>
				)}
				{store.archiveLoading && <LoadingState size="md" />}
				{store.archiveError && (
					<div className="flex items-center gap-2 text-xs" role="alert">
						<span className="text-(--status-error)/70">{store.archiveError}</span>
						<Button
							className="rounded-md"
							disabled={busy}
							padding="xs"
							onClick={() => void store.loadArchive()}
						>
							Обновить архив
						</Button>
					</div>
				)}
				{store.archiveHasMore && (
					<Button
						className="mx-auto rounded-md text-xs"
						disabled={busy}
						padding="xs"
						onClick={() => void store.loadArchive(true)}
					>
						Загрузить ещё
					</Button>
				)}
			</div>
			{store.archiveSaving && (
				<div className="mr-auto flex items-center gap-2">
					<LoadingState size="xs" />
					<span className="text-xs text-(--text-secondary)" role="status">
						Сохраняем изменения…
					</span>
				</div>
			)}
		</section>
	);
});
