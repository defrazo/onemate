import { useEffect, useRef, useState } from 'react';
import { IconAdjustmentsHorizontal, IconDots, IconEdit, IconEye, IconEyeOff, IconTrash } from '@tabler/icons-react';

import { useResponsive } from '@/shared/lib/hooks';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

interface ListActionsProps {
	title: string;
	hide: boolean;
	disabled?: boolean;
	onEdit: () => void;
	onDelete: () => void;
	onToggleHide: () => void;
}

export const ListActions = ({ title, hide, disabled = false, onEdit, onDelete, onToggleHide }: ListActionsProps) => {
	const { isMobile } = useResponsive();

	const [open, setOpen] = useState(false);

	const menuRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);

	const actions = [
		{
			id: 'edit',
			label: 'Редактировать',
			icon: IconEdit,
			onClick: onEdit,
			danger: false,
		},
		{
			id: 'hide',
			label: hide ? 'Показать' : 'Скрыть',
			icon: hide ? IconEye : IconEyeOff,
			onClick: onToggleHide,
			danger: false,
		},
		{
			id: 'delete',
			label: 'Удалить',
			icon: IconTrash,
			onClick: onDelete,
			danger: true,
		},
	];

	useEffect(() => {
		if (disabled) setOpen(false);
	}, [disabled]);

	useEffect(() => {
		if (!open) return;

		const handlePointerDown = (event: PointerEvent) => {
			if (menuRef.current?.contains(event.target as Node) || triggerRef.current?.contains(event.target as Node))
				return;

			setOpen(false);
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setOpen(false);
				triggerRef.current?.focus();
			}
		};

		document.addEventListener('pointerdown', handlePointerDown);
		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('pointerdown', handlePointerDown);
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [open]);

	return (
		<div className="relative shrink-0">
			<Button
				ref={triggerRef}
				aria-expanded={open}
				aria-haspopup="true"
				aria-label={`Действия со списком «${title}»`}
				centerIcon={
					isMobile ? (
						<IconAdjustmentsHorizontal className="size-5 xl:size-4" />
					) : (
						<IconDots className="size-4" />
					)
				}
				disabled={disabled}
				padding="none"
				role="menu"
				variant="icon"
				onClick={() => setOpen((current) => !current)}
			/>
			{open && !disabled && (
				<div
					ref={menuRef}
					aria-label={`Действия со списком «${title}»`}
					className="absolute top-full right-0 z-20 mt-1 flex min-w-40 flex-col overflow-hidden rounded-lg border border-(--tone) bg-(--bg-tertiary)/50 p-1 shadow-lg backdrop-blur-sm"
				>
					{actions.map(({ id, label, icon: Icon, onClick, danger }) => (
						<Button
							key={id}
							className={cn(
								'h-9 justify-start rounded-md bg-transparent px-2.5 py-1.5 text-sm text-(--text-secondary) lg:h-7',
								danger
									? 'hover:bg-(--danger)/10 hover:text-(--status-error)/80'
									: 'hover:bg-(--tone-strong-hover) hover:text-(--text-primary)'
							)}
							leftIcon={<Icon className="size-4 shrink-0" />}
							padding="none"
							role="menuitem"
							onClick={() => {
								setOpen(false);
								onClick();
								triggerRef.current?.focus();
							}}
						>
							<span className="trim">{label}</span>
						</Button>
					))}
				</div>
			)}
		</div>
	);
};
