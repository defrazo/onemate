import type { ReactNode } from 'react';
import { IconLayoutGridAdd } from '@tabler/icons-react';

import type { WidgetId, WidgetSlot } from '@/shared/config';
import { cn } from '@/shared/lib/utils';

import type { SwitcherOption } from '../../model';
import { Switcher } from '.';

interface SlotProps {
	options: SwitcherOption[];
	value: WidgetSlot;
	content: ReactNode;
	onChange: (value: WidgetId) => void;
	reverse?: boolean;
	className?: string;
}

export const Slot = ({ options, value, content, onChange, reverse, className }: SlotProps) => (
	<div className={cn('core-base flex flex-col gap-2 rounded-xl p-2', reverse && 'flex-col-reverse', className)}>
		<Switcher
			className="z-0 rounded-xl border-(--border-color) bg-(--bg-primary) p-1"
			options={options}
			value={value}
			onChange={onChange}
		/>
		<div className="flex flex-1 flex-col justify-between gap-2 select-none">
			{content ?? (
				<div className="flex min-h-0 flex-1 items-center justify-center">
					<div className="flex flex-col items-center gap-0.5">
						<div className="mb-1 flex size-12 items-center justify-center rounded-xl bg-white/5">
							<IconLayoutGridAdd className="size-6 text-(--accent-default)" />
						</div>
						<span className="text-(--color-secondary)">Свободное место</span>
						<span className="trim text-sm text-(--color-disabled)">Выберите виджет на панели</span>
					</div>
				</div>
			)}
		</div>
	</div>
);
