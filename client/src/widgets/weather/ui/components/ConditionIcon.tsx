import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { cn } from '@/shared/lib/utils';

import { conditionIcons } from '../../lib';
import type { ConditionCode } from '../../model';

interface ConditionIconProps {
	condition: ConditionCode;
	description: string;
	title?: string;
	className?: string;
}

export const ConditionIcon = observer(({ condition, description, title, className }: ConditionIconProps) => {
	const { themeStore } = useStore();

	const icons = conditionIcons[themeStore.theme];
	const icon = icons[condition] ?? icons.default;

	return (
		<img
			alt={description}
			className={cn('no-touch-callout size-full text-(--color-primary)', className)}
			decoding="async"
			height="100%"
			loading="lazy"
			src={icon}
			title={title}
			width="100%"
		/>
	);
});
