import { createElement, type ReactNode, useEffect, useRef, useState } from 'react';
import {
	IconHistory,
	IconMessagePlus,
	IconMessages,
	IconTrash,
	IconWindowMaximize,
	IconWindowMinimize,
	IconWorld,
} from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { useResponsive } from '@/shared/lib/hooks';
import { cn } from '@/shared/lib/utils';
import { BackButton, Button, ConfirmDialog, LoadingState, SyncIndicator, Tooltip } from '@/shared/ui';

import { Archive, ChatContent, ChatExpanded, Limits, Messages, MobileActions, ModeSelector } from './components';

export const Assistant = observer(() => {
	const { isMobile } = useResponsive();

	const { userStore, modalStore, assistantStore: store } = useStore();

	const [expanded, setExpanded] = useState(false);

	const ownedModal = useRef<ReactNode>(null);
	const actionsRef = useRef<HTMLDivElement>(null);

	const closeExpanded = () => setExpanded(false);

	const confirmDelete = (id: string) => {
		const owner = userStore.id;

		const content = createElement(ConfirmDialog, {
			title: 'Удалить диалог?',
			description: 'Диалог и все сообщения будут удалены безвозвратно',
			variant: 'danger',
			confirmLabel: 'Удалить',
			onCancel: () => modalStore.closeModal(),
			onConfirm: () => {
				modalStore.closeModal();
				if (owner === userStore.id) void store.deleteArchive(id);
			},
		});

		ownedModal.current = content;
		modalStore.setModal(content);
	};

	useEffect(() => {
		store.init();
		store.attach();

		return () => {
			store.destroy();
		};
	}, [store]);

	useEffect(
		() => () => {
			if (ownedModal.current && modalStore.modal?.content === ownedModal.current) modalStore.closeModal();
		},
		[modalStore, userStore.id]
	);

	useEffect(() => {
		if (store.view !== 'active') setExpanded(false);
	}, [store.view]);

	if (store.view === 'archive') return <Archive store={store} onDelete={confirmDelete} />;

	if (store.view === 'readonly') {
		const conversation = store.archivedConversation;
		const phase =
			store.archiveLoading && !store.archivedMessages.length
				? 'loading'
				: store.archiveError || store.error
					? 'error'
					: 'idle';

		return (
			<section
				aria-label="Архивный диалог"
				className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-hidden"
			>
				<div className="flex shrink-0 items-center gap-2">
					<BackButton className="min-w-0" onBack="Назад" onClick={store.openArchive} />
					<Button
						className="ml-auto h-8 rounded-md text-xs lg:h-6"
						disabled={!store.canResumeConversation}
						leftIcon={<IconMessages className="size-5 xl:size-4" />}
						padding="sm"
						variant="accent"
						onClick={() => void store.resumeConversation()}
					>
						{isMobile ? 'Продолжить' : 'Продолжить диалог'}
					</Button>
					<Button
						aria-label="Удалить диалог"
						className="h-8 rounded-md text-xs lg:h-6"
						disabled={!conversation || store.archiveSaving || store.archiveLoading}
						leftIcon={<IconTrash className="size-5 xl:size-4" />}
						padding="sm"
						variant="danger"
						onClick={() => {
							if (conversation) confirmDelete(conversation.id);
						}}
					>
						{isMobile ? 'Удалить' : 'Удалить диалог'}
					</Button>
				</div>
				<span
					className="shrink-0 truncate border-b border-(--border-primary) py-1 text-sm font-semibold text-(--accent-primary)"
					title={conversation?.title}
				>
					{conversation?.title}
				</span>
				<Messages
					key={conversation?.id}
					readOnly
					before={store.archivedBefore}
					canRetry={false}
					error={store.archiveError ?? store.error}
					historyError={null}
					loadingHistory={store.archiveLoading}
					messages={store.archivedMessages}
					phase={phase}
					onOlder={() => void store.loadArchivedOlder()}
					onRetry={() => {}}
				/>
				{store.archiveSaving && (
					<div className="mr-auto flex items-center gap-2">
						<LoadingState size="xs" />
						<span className="shrink-0 text-sm text-(--text-disabled)" role="status">
							Сохраняем изменения…
						</span>
					</div>
				)}
				{(store.archiveError || store.error || !store.loaded) && (
					<Button
						className="text-xs"
						disabled={store.archiveSaving || store.busy}
						onClick={() => void store.load()}
					>
						Обновить состояние
					</Button>
				)}
			</section>
		);
	}

	const searchControl = userStore.userRole === 'admin' && (
		<Tooltip
			content={
				store.searchEnabled
					? 'Выключить поиск в интернете'
					: 'Разрешить поиск в интернете. Расход токенов значительно увеличится'
			}
			contentClassName="max-w-70"
		>
			<Button
				aria-checked={store.searchEnabled}
				aria-label="Поиск в интернете"
				centerIcon={<IconWorld className="size-6 lg:size-5 xl:size-4" />}
				className={cn('size-7 rounded-md', store.searchEnabled && 'text-(--accent-primary)!')}
				padding="none"
				role="switch"
				variant="iconSurface"
				onClick={() => store.setSearchEnabled(!store.searchEnabled)}
			/>
		</Tooltip>
	);

	return (
		<section aria-label="Mate AI" className="flex min-h-0 min-w-0 flex-1 flex-col gap-1.5 overflow-hidden">
			<div className="mt-0.5 flex shrink-0 flex-wrap items-center justify-between gap-2 xl:flex-row">
				<ModeSelector value={store.mode} onChange={store.setMode} />
				{isMobile ? (
					<>
						<MobileActions
							anchorRef={actionsRef}
							canNewConversation={store.canSend}
							isAdmin={userStore.userRole === 'admin'}
							searchEnabled={store.searchEnabled}
							onNewConversation={() => void store.newConversation()}
							onOpenArchive={store.openArchive}
							onOpenLimits={() => store.setLimitsOpen(true)}
							onToggleSearch={() => store.setSearchEnabled(!store.searchEnabled)}
						/>
						<Limits mobile anchorRef={actionsRef} />
					</>
				) : (
					<div className="ml-auto flex items-center gap-3 border-(--border-primary) not-lg:border-t not-lg:pt-2 lg:gap-1">
						<Tooltip content="Развернуть чат">
							<Button
								aria-label="Развернуть чат"
								centerIcon={<IconWindowMaximize className="size-6 lg:size-5 xl:size-4" />}
								className="hidden size-7 lg:flex"
								padding="none"
								variant="iconSurface"
								onClick={(event) => {
									event.currentTarget.blur();
									setExpanded(true);
								}}
							/>
						</Tooltip>
						{searchControl}
						<Tooltip content="Лимиты и ограничения">
							<Limits />
						</Tooltip>
						<Tooltip content="Архив диалогов">
							<Button
								aria-label="Архив диалогов"
								centerIcon={<IconHistory className="size-6 lg:size-5 xl:size-4" />}
								className="size-7"
								padding="none"
								variant="iconSurface"
								onClick={store.openArchive}
							/>
						</Tooltip>
						<Tooltip content="Новый диалог">
							<Button
								aria-label="Новый диалог"
								centerIcon={<IconMessagePlus className="size-6 lg:size-5 xl:size-4" />}
								className="size-7"
								disabled={!store.canSend}
								padding="none"
								variant="iconSurface"
								onClick={() => void store.newConversation()}
							/>
						</Tooltip>
					</div>
				)}
			</div>
			<ChatContent />
			{expanded && (
				<ChatExpanded
					blocked={!!modalStore.modal}
					controls={
						<>
							<ModeSelector value={store.mode} onChange={store.setMode} />
							<Tooltip content="Свернуть чат">
								<Button
									aria-label="Свернуть чат"
									centerIcon={<IconWindowMinimize className="lg:size-5 xl:size-4" />}
									className="size-7"
									padding="none"
									variant="iconSurface"
									onClick={closeExpanded}
								/>
							</Tooltip>
							{searchControl}
						</>
					}
					onClose={closeExpanded}
				>
					<ChatContent />
				</ChatExpanded>
			)}
			{store.isSyncing && <SyncIndicator />}
		</section>
	);
});
