import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { useDeviceType } from '@/shared/lib/hooks';

import { BottomSheet, Dropdown, Modal } from '.';

export const ModalManager = observer(() => {
	const device = useDeviceType();

	const { modalStore } = useStore();

	const modal = modalStore.modal;
	if (!modal || modal.type === 'none') return null;

	const onClose = () => {
		modal.onClose?.();
		modalStore.closeModal();
	};

	if (modal.type === 'dropdown') {
		return (
			<Dropdown position={modal.position} onClose={onClose}>
				{modal.content}
			</Dropdown>
		);
	}

	if (modal.type === 'sheet' || (modal.type === 'auto' && device === 'mobile')) {
		return (
			<BottomSheet onBack={modal.back} onClose={onClose}>
				{modal.content}
			</BottomSheet>
		);
	}

	return <Modal onClose={onClose}>{modal.content}</Modal>;
});
