import type { ReactNode } from 'react';
import ReactDOM from 'react-dom';
import { IconX } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useEscapeClose } from '@/shared/lib/hooks';

interface ModalProps {
	children: ReactNode;
	onClose?: () => void;
}

export const Modal = observer(({ children, onClose }: ModalProps) => {
	useEscapeClose(onClose);

	return ReactDOM.createPortal(
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
			<div className="core-card core-border max-w-fit flex-col bg-(--bg-secondary)/70 shadow-2xl backdrop-blur-sm">
				<div className="top-4 flex h-4 w-full justify-between">
					{onClose && (
						<IconX
							className="z-10 ml-auto size-4.5 cursor-pointer text-(--color-secondary) transition-colors hover:text-(--accent-hover)"
							onClick={onClose}
						/>
					)}
				</div>
				<div>{children}</div>
			</div>
		</div>,
		document.body
	);
});
