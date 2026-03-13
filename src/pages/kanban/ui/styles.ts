import { cn } from '@/shared/lib/utils';

const base = {
	button: 'cursor-pointer select-none transition-colors rounded-xl disabled:cursor-default disabled:opacity-70',
	border: 'border border-solid',
};

export const layout = {
	row: 'flex items-center',
	col: 'flex flex-col',
	overlay: 'fixed inset-0 z-50 flex items-center justify-center bg-black/40',
	blur: 'bg-(--bg-tertiary)/50 backdrop-blur-sm rounded-xl shadow-(--shadow)',
};

export const border = {
	default: cn(base.border, 'border-(--border-color)'),
};

export const button = {
	default: cn(
		base.button,
		'hover:bg-(--accent-hover) bg-(--accent-default) px-2 py-1 text-(--accent-text) disabled:bg-(--color-disabled)'
	),
	icon: cn(base.button, 'hover:text-(--accent-hover) disabled:text-(--color-disabled)'),
	ghost: cn(
		base.button,
		'border border-dashed border-(--border-color) hover:text-(--accent-text) hover:bg-(--accent-hover) px-2 py-1 disabled:bg-(--color-disabled)'
	),
};

export const primitives = {
	input: cn(
		border.default,
		'rounded-xl outline-none p-2 flex-1 bg-(--bg-tertiary)/50 hover:border-(--accent-hover) focus:border-(--accent-hover)'
	),
	hint: 'text-(--color-secondary) select-none opacity-70 text-sm',
	title: 'leading-4 cursor-default select-none font-bold text-left',
};
