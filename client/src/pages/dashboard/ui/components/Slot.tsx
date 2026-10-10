import { IconLayoutGridAdd } from '@tabler/icons-react';
import type { ReactNode } from 'react';

import type { WidgetId, WidgetSlot } from '@/shared/config';
import { useResponsive } from '@/shared/lib/hooks';
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

export const Slot = ({ options, value, content, onChange, reverse, className }: SlotProps) => {
	const { isMobileLandscape } = useResponsive();

	return (
		<div
			className={cn(
				'flex min-h-0 flex-col gap-3 rounded-xl bg-(--bg-secondary) p-2 lg:p-3',
				isMobileLandscape ? 'max-h-120 min-h-svh' : 'h-[65svh] md:h-[45svh] lg:h-[35svh] landscape:h-[50svh]',
				className
			)}
		>
			{!reverse && <Switcher options={options} value={value} onChange={onChange} />}
			{content ?? (
				<div className="flex min-h-0 flex-1 items-center justify-center">
					<div className="flex flex-col items-center gap-0.5">
						<div className="mb-1 flex size-12 items-center justify-center rounded-xl bg-(--tone-strong)">
							<IconLayoutGridAdd className="size-6 text-(--accent-primary)" />
						</div>
						<span className="text-(--text-secondary)">Свободное место</span>
						<span className="trim text-sm text-(--text-disabled)">Выберите виджет на панели</span>
					</div>
				</div>
			)}
			{reverse && <Switcher options={options} value={value} onChange={onChange} />}
		</div>
	);
};
