import { IconArrowUp, IconInfoCircle, IconPlayerStopFilled } from '@tabler/icons-react';
import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';
import { Button, Textarea, Tooltip } from '@/shared/ui';

import { ASSISTANT_MAX_LENGTH, ASSISTANT_MODES } from '../../model/constants';
import type { AssistantMode, AssistantPhase } from '../../model/types';

interface ComposerProps {
	mode?: AssistantMode;
	recovery?: ReactNode;
	value: string;
	phase: AssistantPhase;
	canSend: boolean;
	canStop: boolean;
	onChange: (value: string) => void;
	onSend: () => void;
	onStop: () => void;
}

export const Composer = ({
	mode = 'ask',
	recovery,
	value,
	phase,
	canSend: allowed,
	canStop,
	onChange,
	onSend,
	onStop,
}: ComposerProps) => {
	const generating = phase === 'generating' || phase === 'stopping';
	const canSend = allowed && !generating && phase !== 'loading' && Boolean(value.trim());
	const showLength = value.length >= ASSISTANT_MAX_LENGTH - 500;
	const metadata = ASSISTANT_MODES.find(({ id }) => id === mode) ?? ASSISTANT_MODES[0];

	const handleSend = () => {
		if (canSend) onSend();
	};

	return (
		<form
			className="flex shrink-0 items-end gap-1.5"
			onSubmit={(event) => {
				event.preventDefault();
				handleSend();
			}}
		>
			<div className="relative min-w-0 flex-1">
				<Textarea
					autoResize
					aria-label="Сообщение Mate AI"
					className="block max-h-16 min-h-9 scrollbar-none py-2 pr-6 text-sm"
					id="assistant-input"
					maxLength={ASSISTANT_MAX_LENGTH}
					placeholder={metadata.placeholder}
					rows={1}
					value={value}
					variant="toneStrong"
					onChange={(event) => onChange(event.target.value)}
					onKeyDown={(event) => {
						if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return;

						event.preventDefault();
						handleSend();
					}}
				/>
				<div className="top-2 right-2 hidden lg:absolute">
					<Tooltip
						content="Сообщения обрабатываются AI-провайдером. Не вводите секреты."
						contentClassName="max-w-68"
					>
						<IconInfoCircle className="size-4 text-(--text-disabled)" tabIndex={0} />
					</Tooltip>
				</div>
				{showLength && (
					<span className="pointer-events-none absolute right-2 bottom-1 text-xs text-(--text-disabled)">
						{value.length} / {ASSISTANT_MAX_LENGTH}
					</span>
				)}
			</div>
			{recovery && <div className="mb-1.5 flex shrink-0 items-center">{recovery}</div>}
			<Button
				aria-label={generating ? 'Остановить' : 'Отправить'}
				centerIcon={
					generating ? <IconPlayerStopFilled className="size-4" /> : <IconArrowUp className="size-4" />
				}
				className={cn(
					'size-9 min-h-9 shrink-0 rounded-lg',
					!generating && metadata.color,
					!generating && 'text-(--text-on-accent)!'
				)}
				disabled={generating ? !canStop || phase === 'stopping' : !canSend}
				padding="none"
				type={generating ? 'button' : 'submit'}
				variant={generating ? 'accent' : 'custom'}
				onClick={generating ? onStop : undefined}
			/>
		</form>
	);
};
