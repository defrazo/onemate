import { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { observer } from 'mobx-react-lite';

interface DropdownProps {
	children: React.ReactNode;
	onClose?: () => void;
	position?: { top: number; left: number };
}

const Dropdown = ({ children, onClose, position }: DropdownProps) => {
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose?.();
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [onClose]);

	return ReactDOM.createPortal(
		<div className="fixed inset-0" onClick={onClose}>
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
};

export default observer(Dropdown);
