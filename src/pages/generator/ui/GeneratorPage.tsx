import { usePageTitle } from '@/shared/lib/hooks';
import GeneratorWidget from '@/widgets/generator';

const GeneratorPage = () => {
	usePageTitle('OneGen');

	return <GeneratorWidget />;
};

export default GeneratorPage;
