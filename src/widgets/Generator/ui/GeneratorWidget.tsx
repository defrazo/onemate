import { useDeviceType, useOrientation } from '@/shared/lib/hooks';
import { MobileBlocker } from '@/shared/ui';

import { PreviewGrid } from '.';

const GeneratorWidget = () => {
	const device = useDeviceType();
	const orientation = useOrientation();

	return device === 'mobile' || (device === 'tablet' && orientation === 'portrait') ? (
		<MobileBlocker />
	) : (
		<PreviewGrid />
	);
};

export default GeneratorWidget;
