import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { cn } from '@/shared/lib/utils';

import { conditionIcons } from '../lib';
import type { ConditionCode } from '../model';

interface ConditionIconProps {
	condition: ConditionCode;
	description: string;
	className?: string;
}

export const ConditionIcon = observer(({ condition, description, className }: ConditionIconProps) => {
	const { themeStore } = useStore();

	const theme = themeStore.theme;
	const icon = conditionIcons[theme][condition] || conditionIcons[theme].default;

	return (
		<img
			alt={description}
			className={cn('no-touch-callout size-full text-[var(--color-primary)]', className)}
			height="100%"
			src={icon}
			width="100%"
			onContextMenu={(e) => e.preventDefault()}
		/>
	);
});
