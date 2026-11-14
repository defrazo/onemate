import { createElement, type ReactNode, useEffect, useRef } from 'react';
import { IconHistory, IconMessagePlus, IconTrash, IconWorld } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { cn } from '@/shared/lib/utils';
import { BackButton, Button, ConfirmDialog, LoadingState, Tooltip } from '@/shared/ui';

import { Archive, Composer, Limits, Messages, ModeSelector, SubmissionError } from './components';

export const Assistant = observer(() => {
	const { userStore, modalStore, assistantStore: store } = useStore();

	const ownedModal = useRef<ReactNode>(null);

	const recovery = store.submissionRecovery;
	const generating = store.phase === 'stopping' || store.generating;
	const canStop = !store.busy && store.generating && store.generation?.status !== 'cancelled';

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

	if (store.view === 'archive') return <Archive store={store} onDelete={confirmDelete} />;

	if (store.view === 'readonly') {
		const conversation = store.archivedConversation;
		const phase =
			store.archiveLoading && !store.archivedMessages.length ? 'loading' : store.archiveError ? 'error' : 'idle';

		return (
			<section
				aria-label="Архивный диалог"
				className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-hidden"
			>
				<div className="flex shrink-0 items-center justify-between gap-2">
					<BackButton className="min-w-0" onBack="Назад" onClick={store.openArchive} />
					<Button
						aria-label="Удалить диалог"
						className="rounded-md text-xs"
						disabled={!conversation || store.archiveSaving || store.archiveLoading}
						leftIcon={<IconTrash className="size-4" />}
						padding="sm"
						variant="danger"
						onClick={() => {
							if (conversation) confirmDelete(conversation.id);
						}}
					>
						Удалить диалог
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
					error={store.archiveError}
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
							Удаляем…
						</span>
					</div>
				)}
			</section>
		);
	}

	return (
		<section aria-label="Mate AI" className="flex min-h-0 min-w-0 flex-1 flex-col gap-1.5 overflow-hidden">
			<div className="mt-0.5 flex shrink-0 flex-wrap items-center justify-between gap-1">
				<ModeSelector value={store.mode} onChange={store.setMode} />
				<Tooltip
					content={
						store.searchEnabled
							? 'Выключить поиск в интернете'
							: 'Разрешить поиск в интернете. Расход токенов значительно увеличится.'
					}
					contentClassName="max-w-70"
				>
					<Button
						aria-checked={store.searchEnabled}
						aria-label="Поиск в интернете"
						centerIcon={<IconWorld className="size-4" />}
						className={cn('size-7 rounded-md', store.searchEnabled && 'text-(--accent-primary)!')}
						padding="none"
						role="switch"
						variant="iconSurface"
						onClick={() => store.setSearchEnabled(!store.searchEnabled)}
					/>
				</Tooltip>
				<Tooltip content="Лимиты и ограничения">
					<Limits store={store} />
				</Tooltip>
				<Tooltip content="Архив диалогов">
					<Button
						aria-label="Архив диалогов"
						centerIcon={<IconHistory className="size-4" />}
						className="size-7"
						padding="none"
						variant="iconSurface"
						onClick={store.openArchive}
					/>
				</Tooltip>
				<Tooltip content="Новый диалог">
					<Button
						aria-label="Новый диалог"
						centerIcon={<IconMessagePlus className="size-4" />}
						className="size-7 rounded-md"
						disabled={!store.canSend}
						padding="none"
						title="Новый диалог"
						variant="iconSurface"
						onClick={() => void store.newConversation()}
					/>
				</Tooltip>
			</div>
			<Messages
				before={store.before}
				canRetry={store.canSend}
				error={null}
				historyError={store.historyError}
				loadingHistory={store.loadingHistory}
				messages={store.visibleMessages}
				phase={store.phase === 'error' && store.error === recovery?.error ? 'idle' : store.phase}
				recovery={recovery ? { ...recovery, onRepeat: () => void store.repeatSubmission() } : null}
				regenerateMessageId={store.regenerateMessageId}
				submittedMessageId={store.lastSubmittedMessageId}
				onOlder={() => void store.loadOlder()}
				onRegenerate={(id) => void store.regenerate(id)}
				onRetry={(id) => void store.retry(id)}
			/>
			{generating && (
				<div className="mr-auto flex items-center gap-2">
					<LoadingState size="xs" />
					<span className="shrink-0 text-sm text-(--text-disabled)" role="status">
						{store.phase === 'stopping' ? 'Останавливаем…' : 'Ожидаем ответ…'}
					</span>
				</div>
			)}
			{store.error && store.error !== recovery?.error && (
				<span className="text-xs text-(--status-error)" role="alert">
					{store.error}
				</span>
			)}
			{store.error && (
				<Button className="text-xs" disabled={store.busy} onClick={() => void store.load()}>
					Обновить диалог
				</Button>
			)}
			<Composer
				canSend={store.canSend}
				canStop={canStop}
				mode={store.mode}
				phase={store.phase}
				recovery={
					recovery && !recovery.messageId ? (
						<SubmissionError
							disabled={recovery.disabled}
							error={recovery.error}
							onRepeat={() => void store.repeatSubmission()}
						/>
					) : null
				}
				value={store.input}
				onChange={store.setInput}
				onSend={() => void store.send()}
				onStop={() => void store.stop()}
			/>
		</section>
	);
});
