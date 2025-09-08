import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { useIsMobile } from '@/shared/lib/hooks';

import { BottomSheet, Dropdown, Modal } from '.';

const ModalManager = () => {
	const { modalStore } = useStore();

	const modal = modalStore.modal;
	const isMobile = useIsMobile();

	if (!modal || modal.type === 'none') return null;

	const componentMap = {
		modal: Modal,
		sheet: BottomSheet,
		dropdown: Dropdown,
		auto: isMobile ? BottomSheet : Modal,
	};

	const Wrapper = componentMap[modal.type] ?? Modal;

	return (
		<Wrapper
			onBack={modal.back}
			onClose={modalStore.closeModal}
			{...(modal.position && { position: modal.position })}
		>
			{modal.content}
		</Wrapper>
	);
};

export default observer(ModalManager);
