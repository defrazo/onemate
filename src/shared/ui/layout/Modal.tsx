import { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { observer } from 'mobx-react-lite';

import { IconBack, IconClose } from '@/shared/assets/icons';

interface ModalProps {
	children: React.ReactNode;
	onBack?: () => void;
	onClose?: () => void;
}

const Modal = ({ children, onBack, onClose }: ModalProps) => {
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose?.();
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [onClose]);

	return ReactDOM.createPortal(
		// <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
			<div className="core-base core-card core-border max-w-fit flex-col shadow-2xl">
				<div className="top-4 flex h-4 w-full justify-between">
					{onBack && <IconBack className="w-5 cursor-pointer" onClick={onBack} />}
					{onClose && <IconClose className="ml-auto w-5 cursor-pointer" onClick={onClose} />}
				</div>
				<div>{children}</div>
			</div>
		</div>,

		document.body
	);
};

export default observer(Modal);
