import { useDeviceType } from '@/shared/lib/hooks';
import { MobileBlocker } from '@/shared/ui';

import { PreviewGrid } from '.';

const GeneratorWidget = () => {
	const device = useDeviceType();

	return device === 'mobile' ? <MobileBlocker /> : <PreviewGrid />;
};

export default GeneratorWidget;
