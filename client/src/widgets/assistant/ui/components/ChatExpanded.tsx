import { type ReactNode, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { IconMessageQuestion, IconX } from '@tabler/icons-react';

import { useBodyScrollLock } from '@/shared/lib/hooks';
import { Button } from '@/shared/ui';

interface ChatExpandedProps {
	children: ReactNode;
	controls: ReactNode;
	blocked: boolean;
	onClose: () => void;
}

export const ChatExpanded = ({ children, controls, blocked, onClose }: ChatExpandedProps) => {
	useBodyScrollLock(true);

	const dialogRef = useRef<HTMLDialogElement>(null);
	const closeRef = useRef(onClose);
	const titleId = useId();

	closeRef.current = onClose;

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;

		const previous = document.activeElement;
		const media = window.matchMedia('(min-width: 1024px)');

		const handleResize = () => {
			if (!media.matches) closeRef.current();
		};

		dialog.showModal();
		handleResize();

		media.addEventListener('change', handleResize);

		return () => {
			media.removeEventListener('change', handleResize);

			if (dialog.open) dialog.close();
			if (previous instanceof HTMLElement && previous.isConnected) previous.focus({ preventScroll: true });
		};
	}, []);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;

		if (blocked) {
			if (dialog.open) dialog.close();
			return;
		}

		if (!dialog.open) dialog.showModal();
	}, [blocked]);

	return createPortal(
		<dialog
			ref={dialogRef}
			aria-labelledby={titleId}
			className="m-auto h-[90dvh] max-h-[calc(100dvh-3rem)] w-[calc(100vw-3rem)] max-w-300 min-w-0 overflow-hidden rounded-xl border border-(--border-primary) bg-(--bg-secondary) p-0 text-(--text-primary) shadow-2xl outline-none backdrop:bg-black/60"
			onCancel={(event) => {
				event.preventDefault();
				if (!blocked) closeRef.current();
			}}
		>
			<div className="flex h-full min-h-0 min-w-0 flex-col gap-2 p-4">
				<div className="flex shrink-0 items-center gap-2">
					<div className="flex size-7 items-center justify-center rounded-md bg-(--accent-primary-muted)">
						<IconMessageQuestion className="size-4 text-(--accent-primary)" stroke={2.5} />
					</div>
					<h2 className="trim mr-auto text-lg font-bold select-none" id={titleId}>
						Mate AI
					</h2>
					<Button
						aria-label="Закрыть"
						centerIcon={<IconX className="size-4.5" />}
						className="focus-visible:ring-0"
						padding="none"
						variant="icon"
						onClick={onClose}
					/>
				</div>
				<div className="flex shrink-0 items-center gap-2">{controls}</div>
				{children}
			</div>
		</dialog>,
		document.body
	);
};
