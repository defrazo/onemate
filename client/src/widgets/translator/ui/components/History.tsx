import { useEffect, useRef } from 'react';
import { IconArrowNarrowRight, IconCopy, IconHistory, IconTrash } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { useCopy } from '@/shared/lib/hooks';
import { pluralize, shortDateTime } from '@/shared/lib/utils';
import { BackButton, Button, ConfirmDialog, Divider, NoContent } from '@/shared/ui';

import type { TranslationHistoryEntry } from '../../model/types';

interface HistoryProps {
	onBack: () => void;
	onRestore: (entry: TranslationHistoryEntry) => void;
}

export const History = observer(({ onBack, onRestore }: HistoryProps) => {
	const copy = useCopy();

	const { translatorStore: store, modalStore, userStore } = useStore();

	const language = (code: string) => store.languages.find((item) => item.value === code)?.label ?? code.toUpperCase();

	const ownedModal = useRef<React.ReactNode>(null);

	useEffect(
		() => () => {
			if (ownedModal.current && modalStore.modal?.content === ownedModal.current) modalStore.closeModal();
		},
		[modalStore, userStore.id]
	);

	const clearHistory = () => {
		const owner = userStore.id;

		const content = (
			<ConfirmDialog
				confirmLabel="Очистить"
				description="Все переводы будут удалены с этого устройства"
				title="Очистить историю переводов?"
				variant="danger"
				onCancel={() => modalStore.closeModal()}
				onConfirm={() => {
					modalStore.closeModal();
					if (owner === userStore.id) store.clearHistory();
				}}
			/>
		);

		ownedModal.current = content;
		modalStore.setModal(content);
	};

	return (
		<div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
			<div className="flex shrink-0 items-center justify-between gap-2">
				<BackButton title="Вернуться к переводчику" onClick={onBack} />
				<div className="flex min-w-0 items-center gap-1.5 rounded-md bg-(--accent-primary-muted) px-2 py-1 text-(--accent-primary)">
					<IconHistory className="size-4 shrink-0" />
					<span className="trim text-sm">История переводов</span>
				</div>
			</div>
			{store.historyError && (
				<span className="text-xs text-(--status-error)" role="alert">
					{store.historyError}
				</span>
			)}
			<div className="flex min-h-0 flex-1 scrollbar-none flex-col gap-2 overflow-y-auto">
				{!store.history.length && (
					<NoContent
						description="Здесь появятся переводы за последние 7 дней"
						icon={IconHistory}
						title="История пуста"
					/>
				)}
				{store.history.map((entry) => (
					<div
						key={entry.id}
						className="group/item core-tone core-card flex max-h-23 shrink-0 flex-col justify-between gap-2 overflow-hidden p-2"
					>
						<div className="flex items-center gap-3">
							<div className="flex items-center gap-1">
								<span className="text-xs font-medium text-(--accent-primary)">
									{language(entry.source)}
								</span>
								<IconArrowNarrowRight className="size-4 text-(--text-disabled)" />
								<span className="text-xs font-medium text-(--accent-primary)">
									{language(entry.target)}
								</span>
								<span className="shrink-0 text-xs text-(--text-disabled) transition-opacity xl:opacity-0 xl:group-hover/item:opacity-100">
									({shortDateTime(entry.createdAt)})
								</span>
							</div>
							<Button
								aria-label="Копировать перевод"
								centerIcon={
									<IconCopy className="size-5 transition-[color,opacity] xl:size-4 xl:opacity-0 xl:group-hover/item:opacity-100" />
								}
								className="ml-auto"
								padding="none"
								variant="icon"
								onClick={() => copy(entry.translation, 'Перевод скопирован')}
							/>
							<Button
								aria-label="Удалить запись"
								centerIcon={
									<IconTrash className="size-5 transition-[color,opacity] xl:size-4 xl:opacity-0 xl:group-hover/item:opacity-100" />
								}
								className="hover:text-(--status-error)"
								padding="none"
								variant="icon"
								onClick={() => store.deleteHistory(entry.id)}
							/>
						</div>
						<Button
							className="flex-1 flex-col items-start gap-2 text-left"
							padding="none"
							variant="custom"
							onClick={() => onRestore(entry)}
						>
							<span className="line-clamp-1 text-xs wrap-anywhere text-(--text-secondary)">
								{entry.original}
							</span>
							<Divider />
							<span className="line-clamp-1 text-xs wrap-anywhere text-(--text-primary)">
								{entry.translation}
							</span>
						</Button>
					</div>
				))}
			</div>
			<div className="flex items-center justify-between text-xs text-(--text-tertiary)">
				<span>
					{store.history.length} {pluralize(store.history.length, 'перевод', 'перевода', 'переводов')}
				</span>
				<Button
					aria-label="Очистить историю"
					className="text-(--text-tertiary) hover:text-(--danger)"
					disabled={!store.history.length}
					padding="none"
					variant="custom"
					onClick={clearHistory}
				>
					Очистить историю
				</Button>
			</div>
		</div>
	);
});
