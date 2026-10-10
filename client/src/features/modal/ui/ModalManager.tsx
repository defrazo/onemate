import { lazy, Suspense } from 'react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { useResponsive } from '@/shared/lib/hooks';

import { Dropdown } from './Dropdown';
import { Modal } from './Modal';

const BottomSheet = lazy(() => import('./BottomSheet').then(({ BottomSheet }) => ({ default: BottomSheet })));

export const ModalManager = observer(() => {
	const { isMobile, isTablet } = useResponsive();

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

	if (modal.type === 'sheet' || (modal.type === 'auto' && isMobile && !isTablet)) {
		return (
			<Suspense fallback={null}>
				<BottomSheet onBack={modal.back} onClose={onClose}>
					{modal.content}
				</BottomSheet>
			</Suspense>
		);
	}

	return <Modal onClose={onClose}>{modal.content}</Modal>;
});
