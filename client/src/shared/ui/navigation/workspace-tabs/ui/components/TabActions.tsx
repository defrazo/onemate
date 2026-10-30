import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IconDots, IconEdit, IconTrash } from '@tabler/icons-react';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

interface TabActionsProps {
	title: string;
	disabled?: boolean;
	canDelete: boolean;
	className?: string;
	onRename: () => void;
	onDelete: () => void;
}

export const TabActions = ({ title, disabled = false, canDelete, className, onRename, onDelete }: TabActionsProps) => {
	const [open, setOpen] = useState(false);
	const [position, setPosition] = useState({ top: 0, left: 0 });

	const buttonRef = useRef<HTMLDivElement>(null);
	const menuRef = useRef<HTMLDivElement>(null);

	useLayoutEffect(() => {
		if (!open) return;

		const updatePosition = () => {
			const trigger = buttonRef.current?.getBoundingClientRect();
			if (!trigger) return;

			const menuWidth = menuRef.current?.offsetWidth ?? 160;
			const menuHeight = menuRef.current?.offsetHeight ?? 70;
			const gap = 4;

			setPosition({
				top:
					trigger.bottom + gap + menuHeight > window.innerHeight - 8
						? trigger.top - menuHeight - gap
						: trigger.bottom + gap,
				left: Math.max(8, Math.min(trigger.right - menuWidth + 11, window.innerWidth - menuWidth - 8)),
			});
		};

		updatePosition();

		window.addEventListener('resize', updatePosition);
		window.addEventListener('scroll', updatePosition, true);

		return () => {
			window.removeEventListener('resize', updatePosition);
			window.removeEventListener('scroll', updatePosition, true);
		};
	}, [open]);

	useEffect(() => {
		if (!open) return;

		const handlePointerDown = (event: PointerEvent) => {
			const target = event.target as Node;
			if (buttonRef.current?.contains(target) || menuRef.current?.contains(target)) return;

			setOpen(false);
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') setOpen(false);
		};

		document.addEventListener('pointerdown', handlePointerDown);
		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('pointerdown', handlePointerDown);
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [open]);

	useEffect(() => {
		if (disabled) setOpen(false);
	}, [disabled]);

	const actions = [
		{ id: 'rename', label: 'Переименовать', icon: IconEdit, onClick: onRename },
		...(canDelete ? [{ id: 'delete', label: 'Удалить', icon: IconTrash, onClick: onDelete, danger: true }] : []),
	];

	return (
		<>
			<div ref={buttonRef} className={cn('shrink-0', className)}>
				<Button
					aria-expanded={open}
					aria-haspopup="true"
					aria-label={`Действия с «${title}»`}
					centerIcon={<IconDots className="size-4" />}
					disabled={disabled}
					padding="none"
					title="Действия"
					variant="icon"
					onClick={() => setOpen((current) => !current)}
				/>
			</div>
			{open &&
				createPortal(
					<div
						ref={menuRef}
						aria-label={`Действия с «${title}»`}
						className="fixed z-50 flex min-w-40 flex-col overflow-hidden rounded-lg border border-(--tone) bg-(--bg-tertiary)/50 p-1 shadow-lg backdrop-blur-sm"
						style={{ top: position.top, left: position.left }}
					>
						{actions.map(({ id, label, icon: Icon, onClick, ...rest }) => {
							const danger = 'danger' in rest && rest.danger;

							return (
								<button
									key={id}
									className={cn(
										'flex h-9 w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-(--text-secondary) transition-colors lg:h-7',
										danger
											? 'hover:bg-(--danger)/10 hover:text-(--status-error)/80'
											: 'hover:bg-(--tone-strong-hover) hover:text-(--text-primary)'
									)}
									type="button"
									onClick={() => {
										setOpen(false);
										onClick();
									}}
								>
									<Icon className="size-4 shrink-0" />
									<span className="trim">{label}</span>
								</button>
							);
						})}
					</div>,
					document.body
				)}
		</>
	);
};
