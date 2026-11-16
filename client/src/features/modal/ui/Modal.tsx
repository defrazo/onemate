import ReactDOM from 'react-dom';
import { IconX } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';
import type { ReactNode } from 'react';

import { useEscapeClose } from '@/shared/lib/hooks';
import { Button } from '@/shared/ui';

interface ModalProps {
	children: ReactNode;
	onClose?: () => void;
}

export const Modal = observer(({ children, onClose }: ModalProps) => {
	useEscapeClose(onClose);

	return ReactDOM.createPortal(
		<div className="modal-safe-area fixed inset-0 z-50 flex items-center justify-center bg-black/60">
			<div className="modal-panel core-surface core-pad relative flex min-h-0 max-w-fit min-w-0 flex-col bg-(--bg-secondary) shadow-2xl backdrop-blur-sm">
				{onClose && (
					<Button
						centerIcon={<IconX className="size-4.5" />}
						className="absolute top-3 right-3 z-10"
						padding="none"
						type="button"
						variant="icon"
						onClick={onClose}
					/>
				)}
				<div className="core-scrollbar min-h-0 overscroll-contain">{children}</div>
			</div>
		</div>,
		document.body
	);
});
