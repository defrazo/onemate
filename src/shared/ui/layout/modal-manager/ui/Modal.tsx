import type { ReactNode } from 'react';
import ReactDOM from 'react-dom';
import { observer } from 'mobx-react-lite';

import { IconBack, IconClose } from '@/shared/assets/icons';

import { useEscapeClose } from '../model';

interface ModalProps {
	children: ReactNode;
	onBack?: () => void;
	onClose?: () => void;
}

export const Modal = observer(({ children, onBack, onClose }: ModalProps) => {
	useEscapeClose(onClose);

	return ReactDOM.createPortal(
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
			<div className="core-base core-card core-border max-w-fit flex-col shadow-2xl">
				<div className="top-4 flex h-4 w-full justify-between">
					{onBack && <IconBack className="w-5 cursor-pointer hover:text-(--accent-hover)" onClick={onBack} />}
					{onClose && (
						<IconClose
							className="ml-auto w-5 cursor-pointer hover:text-(--accent-hover)"
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
