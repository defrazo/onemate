import { useEffect, useId, useState } from 'react';
import { IconCheck } from '@tabler/icons-react';

import { COLOR_PALETTE, type PaletteColor } from '@/shared/config';
import { useOutsideClick } from '@/shared/lib/hooks';
import { cn } from '@/shared/lib/utils';

import { Button } from '../../../primitives/button';

interface ColorPickerProps {
	color: PaletteColor;
	disabled?: boolean;
	title?: string;
	size?: 'sm' | 'md';
	onChange: (color: PaletteColor) => void;
}

export const ColorPicker = ({ color, disabled = false, title = 'Цвет', size = 'md', onChange }: ColorPickerProps) => {
	const [open, setOpen] = useState(false);

	const paletteId = useId();

	const ref = useOutsideClick<HTMLDivElement>(() => setOpen(false));

	useEffect(() => {
		if (!open) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') setOpen(false);
		};

		document.addEventListener('keydown', handleKeyDown);

		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [open]);

	useEffect(() => {
		if (disabled) setOpen(false);
	}, [disabled]);

	return (
		<div ref={ref} className="relative">
			<Button
				aria-controls={open && !disabled ? paletteId : undefined}
				aria-expanded={open && !disabled}
				aria-haspopup="true"
				aria-label={title}
				className={cn(
					'rounded-md hover:bg-(--tone-hover) disabled:cursor-default disabled:opacity-50',
					size === 'sm' ? 'size-7' : 'size-8'
				)}
				disabled={disabled}
				padding="none"
				title={title}
				variant="custom"
				onClick={() => setOpen((value) => !value)}
			>
				<span className="size-4 rounded-full" style={{ backgroundColor: COLOR_PALETTE[color].value }} />
			</Button>
			{open && !disabled && (
				<div
					className="absolute top-full right-0 z-30 mt-1 w-max rounded-lg border border-(--border-primary) bg-(--bg-secondary) p-2 shadow-lg"
					id={paletteId}
				>
					<div className="mb-1 text-xs font-medium text-(--text-secondary)">Выберите цвет</div>
					<div className="grid grid-cols-4 gap-1.5">
						{Object.entries(COLOR_PALETTE).map(([id, config]) => {
							const selected = color === id;

							return (
								<Button
									key={id}
									aria-label={config.label}
									aria-pressed={selected}
									centerIcon={
										<span
											className="flex size-4 items-center justify-center rounded-full"
											style={{ backgroundColor: config.value }}
										>
											{selected && <IconCheck className="size-3 text-white" />}
										</span>
									}
									className={cn(
										'size-7 rounded-md hover:bg-(--tone-hover)',
										selected && 'bg-(--tone-hover)'
									)}
									padding="none"
									title={config.label}
									variant="custom"
									onClick={() => {
										onChange(id as PaletteColor);
										setOpen(false);
									}}
								/>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
};
