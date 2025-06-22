import { observer } from 'mobx-react-lite';

import { useIsMobile } from '@/shared/lib/hooks';
import { uiStore } from '@/shared/stores';

import { BottomSheet, Dropdown, Modal } from '.';

const ModalManager = () => {
	const modal = uiStore.modal;
	const isMobile = useIsMobile();

	if (!modal || modal.type === 'none') return null;

	let Wrapper;

	switch (modal.type) {
		case 'modal':
			Wrapper = Modal;
			break;
		case 'bottom-sheet':
			Wrapper = BottomSheet;
			break;
		case 'dropdown':
			Wrapper = Dropdown;
			break;
		case 'auto':
		default:
			Wrapper = isMobile ? BottomSheet : Modal;
			break;
	}

	return (
		<Wrapper onBack={modal.back} onClose={uiStore.closeModal} {...(modal.position && { position: modal.position })}>
			{modal.content}
		</Wrapper>
	);
};

export default observer(ModalManager);
