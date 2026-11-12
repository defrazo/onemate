import { cn } from '@/shared/lib/utils';

import { base } from '../lib/base';
import { paddings } from '../lib/paddings';
import { variants } from '../lib/variants';
import type { Component, Padding, VariantMap } from './types';

interface StyleParams<T extends Component> {
	component: T;
	variant?: VariantMap[T];
	padding?: Padding;
	loading?: boolean;
	className?: string;
}

export const resolveStyles = <T extends Component>({
	component,
	variant = 'default',
	padding = 'none',
	loading = false,
	className,
}: StyleParams<T>) => {
	return cn(base[component], variants[component][variant], paddings[padding], loading && 'cursor-wait', className);
};
