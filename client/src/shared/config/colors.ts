export const COLOR_PALETTE = {
	slate: { label: 'Серый', value: 'var(--palette-slate)' },
	rose: { label: 'Розовый', value: 'var(--palette-rose)' },
	amber: { label: 'Янтарный', value: 'var(--palette-amber)' },
	emerald: { label: 'Изумрудный', value: 'var(--palette-emerald)' },
	violet: { label: 'Фиолетовый', value: 'var(--palette-violet)' },
	lime: { label: 'Лаймовый', value: 'var(--palette-lime)' },
	fuchsia: { label: 'Фуксия', value: 'var(--palette-fuchsia)' },
	sky: { label: 'Голубой', value: 'var(--palette-sky)' },
} as const;

export type PaletteColor = keyof typeof COLOR_PALETTE;
