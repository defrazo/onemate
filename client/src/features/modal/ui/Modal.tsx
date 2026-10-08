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
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
			<div className="core-surface core-pad max-w-fit flex-col bg-(--bg-secondary)/70 shadow-2xl backdrop-blur-sm">
				<div className="top-4 flex h-4 w-full justify-between">
					{onClose && (
						<Button
							centerIcon={<IconX className="size-4.5" onClick={onClose} />}
							className="z-10 ml-auto"
							padding="none"
							type="button"
							variant="icon"
						/>
					)}
				</div>
				<div>{children}</div>
			</div>
		</div>,
		document.body
	);
});
