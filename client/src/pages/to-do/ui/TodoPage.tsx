import { usePageTitle } from '@/shared/lib/hooks';
import { ComingSoon } from '@/shared/ui';

export const TodoPage = () => {
	usePageTitle('To Do');
	return <ComingSoon />;
};
