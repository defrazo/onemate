import { cn } from '@/shared/lib/utils';
import { Button, Tooltip } from '@/shared/ui';

import { ASSISTANT_MODES } from '../../model/constants';
import type { AssistantMode } from '../../model/types';

interface ModeSelectorProps {
	value: AssistantMode;
	onChange: (mode: AssistantMode) => void;
}

export const ModeSelector = ({ value, onChange }: ModeSelectorProps) => (
	<div
		aria-label="Режим помощника"
		className="flex shrink-0 items-center gap-1 not-lg:flex-1 not-lg:justify-between lg:mr-auto"
		role="group"
	>
		{ASSISTANT_MODES.map(({ id, title, description, icon: Icon, color }) => {
			const selected = value === id;

			return (
				<Tooltip
					key={id}
					content={
						<div className="flex flex-col gap-0.5">
							<span className="font-medium">{title}</span>
							<span className="text-xs opacity-75">{description}</span>
						</div>
					}
				>
					<>
						<Button
							active={selected}
							aria-label={title}
							centerIcon={<Icon className="size-5" />}
							className={cn(
								'h-7 min-w-7 rounded-md text-xs transition-none',
								selected && 'text-(--text-on-accent)! active:scale-[0.97]',
								selected && color,
								'max-lg:hidden xl:hidden'
							)}
							padding="none"
							variant={selected ? 'custom' : 'iconSurface'}
							onClick={() => onChange(id)}
						/>
						<Button
							active={selected}
							aria-label={title}
							centerIcon={selected ? undefined : <Icon className="size-5 xl:size-4" />}
							className={cn(
								'h-7 min-w-7 rounded-md px-2 text-xs transition-none lg:hidden xl:flex',
								selected && 'min-w-24 text-(--text-on-accent)! active:scale-[0.97]',
								selected && color
							)}
							leftIcon={selected ? <Icon className="size-5 xl:size-4" /> : undefined}
							padding="none"
							variant={selected ? 'custom' : 'iconSurface'}
							onClick={() => onChange(id)}
						>
							{selected && title}
						</Button>
					</>
				</Tooltip>
			);
		})}
	</div>
);
