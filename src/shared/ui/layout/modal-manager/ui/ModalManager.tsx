import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { useDeviceType } from '@/shared/lib/hooks';

import { BottomSheet, Dropdown, Modal } from '.';

const ModalManager = () => {
	const { modalStore } = useStore();

	const modal = modalStore.modal;
	const device = useDeviceType();

	if (!modal || modal.type === 'none') return null;

	const componentMap = {
		modal: Modal,
		sheet: BottomSheet,
		dropdown: Dropdown,
		auto: device === 'mobile' ? BottomSheet : Modal,
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
