import { type RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IconDots, IconGauge, IconHistory, IconMessagePlus, IconWorld } from '@tabler/icons-react';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

interface MobileActionsProps {
	isAdmin: boolean;
	anchorRef: RefObject<HTMLDivElement | null>;
	searchEnabled: boolean;
	canNewConversation: boolean;
	onToggleSearch: () => void;
	onOpenLimits: () => void;
	onOpenArchive: () => void;
	onNewConversation: () => void;
}

export const MobileActions = ({
	isAdmin,
	anchorRef,
	searchEnabled,
	canNewConversation,
	onToggleSearch,
	onOpenLimits,
	onOpenArchive,
	onNewConversation,
}: MobileActionsProps) => {
	const [open, setOpen] = useState(false);
	const [position, setPosition] = useState({ top: 0, left: 0 });

	const menuRef = useRef<HTMLDivElement>(null);

	useLayoutEffect(() => {
		if (!open) return;

		const updatePosition = () => {
			const trigger = anchorRef.current?.getBoundingClientRect();
			if (!trigger) return;

			const width = 224;
			const height = menuRef.current?.offsetHeight ?? 180;
			const gap = 4;

			setPosition({
				top:
					trigger.bottom + gap + height > window.innerHeight - 8
						? trigger.top - height - gap
						: trigger.bottom + gap,
				left: Math.max(8, Math.min(trigger.right - width, window.innerWidth - width - 8)),
			});
		};

		updatePosition();

		window.addEventListener('resize', updatePosition);
		window.addEventListener('scroll', updatePosition, true);

		return () => {
			window.removeEventListener('resize', updatePosition);
			window.removeEventListener('scroll', updatePosition, true);
		};
	}, [open, anchorRef]);

	useEffect(() => {
		if (!open) return;

		const handlePointerDown = (event: PointerEvent) => {
			const target = event.target as Node;
			if (anchorRef.current?.contains(target) || menuRef.current?.contains(target)) return;
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
	}, [open, anchorRef]);

	const actions = [
		...(isAdmin
			? [
					{
						id: 'search',
						label: 'Поиск в интернете',
						icon: IconWorld,
						onClick: onToggleSearch,
						active: searchEnabled,
					},
				]
			: []),
		{
			id: 'limits',
			label: 'Лимиты и ограничения',
			icon: IconGauge,
			onClick: onOpenLimits,
		},
		{
			id: 'archive',
			label: 'Архив диалогов',
			icon: IconHistory,
			onClick: onOpenArchive,
		},
		{
			id: 'new',
			label: 'Новый диалог',
			icon: IconMessagePlus,
			onClick: onNewConversation,
			disabled: !canNewConversation,
		},
	];

	return (
		<>
			<div ref={anchorRef} className="shrink-0">
				<Button
					aria-expanded={open}
					aria-haspopup="menu"
					aria-label="Действия с диалогом"
					centerIcon={<IconDots className="size-6" />}
					className="size-8 rounded-md"
					padding="none"
					variant="iconSurface"
					onClick={() => setOpen((current) => !current)}
				/>
			</div>
			{open &&
				createPortal(
					<div
						ref={menuRef}
						className="fixed z-50 w-56 rounded-xl border border-(--border-primary) bg-(--bg-secondary) p-1.5 shadow-xl"
						role="menu"
						style={{ top: position.top, left: position.left }}
					>
						{actions.map(({ id, label, icon: Icon, onClick, ...options }) => (
							<Button
								key={id}
								className={cn(
									'w-full justify-start text-sm',
									'active' in options && options.active && 'text-(--accent-primary)'
								)}
								disabled={'disabled' in options && options.disabled}
								leftIcon={<Icon className="size-5 shrink-0" />}
								variant="custom"
								onClick={() => {
									setOpen(false);
									onClick();
								}}
							>
								<span className="trim">{label}</span>
							</Button>
						))}
					</div>,
					document.body
				)}
		</>
	);
};
