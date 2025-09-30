import type { ReactNode } from 'react';
import ReactDOM from 'react-dom';
import { observer } from 'mobx-react-lite';

import { useEscapeClose } from '../model';

interface DropdownProps {
	children: ReactNode;
	position?: { top: number; left: number };
	onClose?: () => void;
}

export const Dropdown = observer(({ children, position, onClose }: DropdownProps) => {
	useEscapeClose(onClose);

	return ReactDOM.createPortal(
		<div className="fixed inset-0 z-20" onClick={onClose}>
			<div
				className="fixed w-fit"
				style={{ top: position?.top, left: position?.left }}
				onClick={(e) => e.stopPropagation()}
			>
				{children}
			</div>
		</div>,
		document.body
	);
});
