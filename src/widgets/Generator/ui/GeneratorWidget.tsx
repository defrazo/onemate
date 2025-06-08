import { useIsMobile } from '@/shared/lib/hooks';
import { MobileBlocker } from '@/shared/ui';

import { PreviewGrid } from '.';

const GeneratorWidget = () => {
	const isMobile = useIsMobile();

	return isMobile ? <MobileBlocker /> : <PreviewGrid />;
};

export default GeneratorWidget;
