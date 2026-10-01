import { IconCopy, IconX } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { useCopy } from '@/shared/lib/hooks';
import { cn } from '@/shared/lib/utils';
import { Button, LoadingState, Textarea } from '@/shared/ui';

import { TRANSLATOR_MAX_LENGTH } from '../../model';

export const TranslateField = observer(({ side }: { side: 'source' | 'target' }) => {
	const copy = useCopy();

	const { translatorStore } = useStore();

	const isSource = side === 'source';
	const text = isSource ? translatorStore.sourceText : translatorStore.targetText;

	return (
		<div
			className={cn(
				'flex min-w-0 flex-1 flex-col border-(--border-primary)',
				isSource ? 'xl:border-r' : 'border-t xl:border-t-0'
			)}
		>
			<Textarea
				className={cn(
					'h-full min-h-0 flex-1 resize-none overflow-auto px-2 py-3',
					!isSource && 'text-(--text-primary)'
				)}
				maxLength={isSource ? TRANSLATOR_MAX_LENGTH : undefined}
				name={`${side}-textbox`}
				placeholder={isSource ? 'Введите текст...' : 'Перевод появится здесь'}
				readOnly={!isSource}
				size="custom"
				value={text}
				variant="custom"
				onChange={isSource ? (e) => translatorStore.setSourceText(e.target.value) : undefined}
			/>
			<div className={cn('flex items-center justify-between', isSource ? 'pr-2' : 'pl-2')}>
				<div className="flex items-center gap-2">
					{isSource && (
						<div className="flex h-6 items-center justify-center gap-1 rounded-lg bg-(--accent-primary)/10 px-2 text-xs text-(--accent-primary) tabular-nums">
							{translatorStore.sourceText.length} / {TRANSLATOR_MAX_LENGTH} зн.
						</div>
					)}
					{!isSource && translatorStore.isLoading && <LoadingState size="xs" />}
				</div>
				<div className="pointer-events-auto flex items-center gap-1.5 transition-opacity group-hover:opacity-100 xl:opacity-0">
					{isSource && (
						<Button
							centerIcon={<IconX className="size-4" stroke={3} />}
							className="size-6 text-(--text-secondary)/70 transition-colors hover:text-(--status-error)"
							disabled={!text}
							size="custom"
							title="Очистить"
							variant="mobile"
							onClick={translatorStore.clear}
						/>
					)}
					<Button
						centerIcon={<IconCopy className="size-4" />}
						className="size-6 text-(--text-secondary)/70 transition-colors hover:text-(--accent-primary)"
						disabled={!text}
						size="custom"
						title={isSource ? 'Скопировать оригинал' : 'Скопировать перевод'}
						variant="mobile"
						onClick={() => copy(text, isSource ? 'Оригинал скопирован' : 'Перевод скопирован')}
					/>
				</div>
			</div>
		</div>
	);
});
