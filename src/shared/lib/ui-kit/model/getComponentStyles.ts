import { cn } from '@/shared/lib/utils';

import { base, sizes, states, variants } from '../lib';
import type { Component, SizeMap, VariantMap } from '.';

interface StyleParams<T extends Component> {
	component: T;
	variant?: VariantMap[T];
	size?: SizeMap[T];
	active?: boolean;
	disabled?: boolean;
	error?: boolean;
	loading?: boolean;
}

export const getComponentStyles = <T extends Component>({
	component,
	variant = 'default',
	size = 'md',
	error = false,
	active = false,
	disabled = false,
	loading = false,
}: StyleParams<T>) => {
	const baseClass = base[component] ?? '';
	const variantClass = variants[component][variant];
	const sizeClass = sizes[component][size];

	return cn(
		baseClass,
		variantClass,
		sizeClass,
		active && states.active,
		disabled && states.disabled,
		error && states.error,
		loading && states.loading
	);
};
