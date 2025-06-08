import { observer } from 'mobx-react-lite';

import { useIsMobile } from '@/shared/lib/hooks/useIsMobile';
import { appStore } from '@/shared/store/appStore';

import { BottomSheet, Modal } from '.';

const ModalManager = () => {
	const modal = appStore.modal;
	const isMobile = useIsMobile();

	if (!modal) return null;

	const Wrapper = isMobile ? BottomSheet : Modal;

	return (
		<Wrapper onBack={appStore.back || undefined} onClose={() => appStore.closeModal()}>
			{modal.content}
		</Wrapper>
	);
};

export default observer(ModalManager);
