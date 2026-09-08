import { usePageTitle } from '@/shared/lib/hooks';
import { UnderConstruction } from '@/shared/ui';

export const TodoPage = () => {
	usePageTitle('To Do');
	return <UnderConstruction />;
};
