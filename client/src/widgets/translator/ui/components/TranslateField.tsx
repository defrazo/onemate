import { IconCopy, IconDownload, IconHistory, IconX } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { useCopy } from '@/shared/lib/hooks';
import { cn } from '@/shared/lib/utils';
import { Button, LoadingState, Textarea, Tooltip } from '@/shared/ui';

import { TRANSLATOR_MAX_LENGTH } from '../../model/constants';

interface TranslateFieldProps {
	side: 'source' | 'target';
	onHistory?: () => void;
}

export const TranslateField = observer(({ side, onHistory }: TranslateFieldProps) => {
	const copy = useCopy();

	const { notifyStore, translatorStore } = useStore();

	const isSource = side === 'source';
	const text = isSource ? translatorStore.sourceText : translatorStore.targetText;

	return (
		<div className="flex min-w-0 flex-1 flex-col gap-2 border-(--border-primary)">
			<Textarea
				className={cn(
					'block h-full min-h-0 flex-1 scrollbar-none overflow-auto p-2 hover:border-transparent focus:border-transparent',
					!isSource && 'text-(--text-primary) caret-transparent'
				)}
				maxLength={isSource ? TRANSLATOR_MAX_LENGTH : undefined}
				name={`${side}-textbox`}
				placeholder={isSource ? 'Введите текст...' : 'Перевод появится здесь'}
				readOnly={!isSource}
				resize="none"
				value={text}
				variant="custom"
				wrapperClassName="min-h-0 flex-1"
				onChange={isSource ? (e) => translatorStore.setSourceText(e.target.value) : undefined}
			/>
			<div className={cn('flex h-6 items-center justify-between', isSource ? 'pr-2' : 'pl-2')}>
				<div className="flex items-center gap-2">
					{isSource && (
						<div className="flex h-6 items-center justify-center gap-1 rounded-md bg-(--accent-primary-muted) px-2 text-xs text-(--accent-primary) tabular-nums">
							{translatorStore.sourceText.length} / {TRANSLATOR_MAX_LENGTH} зн.
						</div>
					)}
					{!isSource &&
						(translatorStore.isLoading ? (
							<LoadingState size="xs" />
						) : (
							(translatorStore.availability === 'downloadable' ||
								translatorStore.availability === 'downloading') && (
								<Button
									className="h-6 rounded-md px-2 text-xs group-hover:opacity-100 xl:opacity-70"
									disabled={translatorStore.isPreparing}
									leftIcon={<IconDownload className="-mr-1 size-4" />}
									padding="none"
									onClick={() => {
										translatorStore.prepare().catch((error) => {
											if (error instanceof DOMException && error.name === 'AbortError') return;
											notifyStore.setNotice('Что-то пошло не так', 'error');
										});
									}}
								>
									<span className="trim">
										{translatorStore.isPreparing
											? `Загрузка модели: ${translatorStore.preparationProgress}%`
											: 'Локальный перевод'}
									</span>
								</Button>
							)
						))}
				</div>
				<div className="pointer-events-auto flex h-full items-center gap-3 transition-opacity group-hover:opacity-100 xl:opacity-0">
					{isSource && (
						<Button
							centerIcon={<IconX className="size-5 hover:text-(--danger) xl:size-4" stroke={3} />}
							disabled={!text}
							padding="none"
							title="Очистить"
							variant="icon"
							onClick={translatorStore.clear}
						/>
					)}
					{!isSource && translatorStore.canUseHistory && (
						<Tooltip content="История переводов">
							<Button
								aria-label="История переводов"
								centerIcon={<IconHistory className="size-5 xl:size-4" />}
								padding="none"
								variant="icon"
								onClick={onHistory}
							/>
						</Tooltip>
					)}
					<Button
						centerIcon={<IconCopy className="size-5 xl:size-4" />}
						disabled={!text}
						padding="none"
						title={isSource ? 'Скопировать оригинал' : 'Скопировать перевод'}
						variant="icon"
						onClick={() => copy(text, isSource ? 'Оригинал скопирован' : 'Перевод скопирован')}
					/>
				</div>
			</div>
		</div>
	);
});
