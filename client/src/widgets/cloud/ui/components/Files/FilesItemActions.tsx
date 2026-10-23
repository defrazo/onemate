import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IconDots, IconDownload, IconEdit, IconEye, IconLink, IconTrash } from '@tabler/icons-react';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

interface FilesItemActionsProps {
	disabled?: boolean;
	canPreview: boolean;
	onPreview: () => void;
	onDownload: () => void;
	onRename: () => void;
	onShare: () => void;
	onDelete: () => void;
}

export const FilesItemActions = ({
	disabled = false,
	canPreview,
	onPreview,
	onDownload,
	onRename,
	onShare,
	onDelete,
}: FilesItemActionsProps) => {
	const [open, setOpen] = useState(false);
	const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

	const buttonRef = useRef<HTMLDivElement>(null);
	const menuRef = useRef<HTMLDivElement>(null);

	const actions = [
		{ id: 'preview', label: 'Просмотреть', icon: IconEye, onClick: onPreview, hidden: !canPreview },
		{ id: 'download', label: 'Скачать', icon: IconDownload, onClick: onDownload },
		{ id: 'rename', label: 'Переименовать', icon: IconEdit, onClick: onRename },
		{ id: 'share', label: 'Поделиться', icon: IconLink, onClick: onShare },
		{ id: 'delete', label: 'Удалить', icon: IconTrash, onClick: onDelete, danger: true },
	];

	useLayoutEffect(() => {
		if (!open) return;

		const updatePosition = () => {
			const trigger = buttonRef.current?.getBoundingClientRect();
			if (!trigger) return;

			const menuWidth = 192;
			const gap = 4;

			const menuHeight = menuRef.current?.offsetHeight ?? 220;

			setPosition({
				top:
					trigger.bottom + gap + menuHeight > window.innerHeight - 8
						? trigger.top - menuHeight - gap
						: trigger.bottom + gap,
				left: Math.max(8, Math.min(trigger.right - menuWidth, window.innerWidth - menuWidth - 8)),
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

	return (
		<>
			<div ref={buttonRef} className="shrink-0">
				<Button
					centerIcon={<IconDots className="size-4" />}
					disabled={disabled}
					padding="none"
					title="Действия с файлом"
					variant="icon"
					onClick={() => setOpen((current) => !current)}
				/>
			</div>
			{open &&
				createPortal(
					<div
						ref={menuRef}
						className="fixed z-50 w-48 rounded-xl border border-(--border-primary) bg-(--bg-secondary) p-1.5 shadow-xl"
						style={{ top: position.top, left: position.left }}
					>
						{actions
							.filter((action) => !action.hidden)
							.map(({ id, label, icon: Icon, onClick, danger }) => (
								<div key={id}>
									{danger && <div className="my-1 border-t border-(--border-primary)" />}

									<Button
										className={cn(
											'w-full justify-start text-sm hover:bg-(--tone-strong-hover)',
											danger && 'text-(--status-error)'
										)}
										leftIcon={
											<Icon
												className={cn('size-4 shrink-0', !danger && 'text-(--text-secondary)')}
											/>
										}
										variant="custom"
										onClick={() => {
											setOpen(false);
											onClick();
										}}
									>
										{label}
									</Button>
								</div>
							))}
					</div>,
					document.body
				)}
		</>
	);
};
