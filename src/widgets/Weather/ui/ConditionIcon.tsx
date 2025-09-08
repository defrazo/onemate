import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';

import { conditionIcons } from '../lib';
import type { ConditionCode } from '../model';

interface ConditionIconProps {
	condition: ConditionCode;
	description: string;
	className?: string;
}

export const ConditionIcon = observer(
	({ condition, description, className = 'size-full text-[var(--color-primary)]' }: ConditionIconProps) => {
		const { themeStore } = useStore();

		const theme = themeStore.theme;
		const icon = conditionIcons[theme][condition] || conditionIcons[theme].default;

		return <img alt={description} className={className} height="100%" src={icon} width="100%" />;
	}
);
