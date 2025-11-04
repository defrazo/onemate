import type { ReactNode } from 'react';

import { IconEmpty } from '@/shared/assets/icons';
import { cn } from '@/shared/lib/utils';
import type { TabOption } from '@/shared/ui';
import { TabSlider } from '@/shared/ui';

interface WidgetPanel {
	tabs: TabOption[];
	value: string;
	content: ReactNode;
	onChange: (value: string) => void;
	reverse?: boolean;
	className?: string;
}

export const WidgetPanel = ({ tabs, value, content, onChange, reverse, className }: WidgetPanel) => (
	<div className={cn('core-base flex flex-col gap-2 rounded-xl p-2', reverse && 'flex-col-reverse', className)}>
		<TabSlider
			className="z-0 rounded-xl border-(--border-color) bg-(--bg-primary) p-1"
			tabs={tabs}
			value={value}
			onChange={onChange}
		/>
		<div className="flex flex-1 flex-col justify-between gap-2 select-none">
			{content ?? (
				<div className="flex flex-1 flex-col items-center justify-evenly">
					<IconEmpty className="size-60 opacity-10" />
					<div className="font-semibold text-(--color-disabled) opacity-40">Выберите виджет</div>
				</div>
			)}
		</div>
	</div>
);
