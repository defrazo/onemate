import { cn } from '@/shared/lib/utils';

const base = {
	button: 'cursor-pointer rounded-xl transition-colors select-none disabled:cursor-default disabled:opacity-70',
	border: 'border border-solid',
	primaryText: 'cursor-default text-sm leading-4 select-none 2xl:text-base',
	secondaryText: 'cursor-default text-xs leading-4 select-none 2xl:text-sm',
};

export const layout = {
	row: 'flex items-center',
	col: 'flex flex-col',
	overlay: 'fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4',
	blur: 'rounded-xl bg-(--bg-tertiary)/50 shadow-(--shadow) backdrop-blur-sm',
};

export const border = {
	default: cn(base.border, 'border-(--border-color)'),
};

export const button = {
	default: cn(
		base.button,
		'bg-(--accent-default) px-2 py-1 text-base text-(--accent-text) hover:bg-(--accent-hover) disabled:bg-(--color-disabled) xl:text-sm 2xl:text-base'
	),
	icon: cn(base.button, 'hover:text-(--accent-hover) disabled:text-(--color-disabled)'),
	ghost: cn(
		base.button,
		'border border-dashed border-(--border-color) px-2 py-1 hover:border-transparent hover:bg-(--accent-hover) hover:text-(--accent-text) disabled:bg-(--color-disabled)'
	),
};

export const primitives = {
	input: cn(
		border.default,
		'w-full rounded-xl bg-(--bg-tertiary)/50 p-2 text-base outline-none hover:border-(--accent-hover) focus:border-(--accent-hover) xl:text-sm 2xl:text-base'
	),
	hint: cn(base.secondaryText, 'text-(--color-secondary) opacity-70'),
	title: cn(base.primaryText, 'text-left font-bold'),
	label: cn(base.primaryText, 'text-left'),
};
