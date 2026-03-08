export const layout = {
	row: 'flex flex-row',
	col: 'flex flex-col',
	wrap: 'flex flex-wrap',
	center: 'flex items-center justify-center',
	between: 'flex items-center justify-between',
	overlay: 'fixed inset-0 z-50 flex items-center justify-center bg-black/40',
};

export const surface = {
	base: 'rounded-xl border border-solid',
	card: 'rounded-xl border border-solid shadow-sm',
	elevated: 'rounded-xl shadow-md',
	ghost: 'border border-transparent',
	panel: 'rounded-lg bg-(--bg-secondary)',
};

export const controls = {
	button: 'cursor-pointer select-none transition-colors rounded-xl w-40 mx-auto  transition-colors hover:bg-(--accent-hover) bg-(--accent-default) px-2 py-1 text-(--accent-text) disabled:bg-(--color-disabled) disabled:opacity-70 disabled:cursor-default',
	iconButton: 'cursor-pointer hover:text-(--accent-hover)',
	clickable: 'cursor-pointer',
	disabled: 'opacity-50 pointer-events-none',
};

export const primitives = {
	section: 'flex flex-col gap-4',
	header: 'flex items-center justify-between',
	footer: 'flex justify-end gap-2',
	input: 'rounded-xl outline-none focus:border-(--accent-hover) border border-solid border-(--border-color) bg-transparent p-2',
};
