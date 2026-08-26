import { usePageTitle } from '@/shared/lib/hooks';
import { UnderConstruction } from '@/shared/ui';

const TodoPage = () => {
	usePageTitle('To Do');
	return <UnderConstruction />;
};

export default TodoPage;
