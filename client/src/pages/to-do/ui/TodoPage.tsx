import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { usePageTitle } from '@/shared/lib/hooks';
import { ComingSoon, LoadingError, LoadingState } from '@/shared/ui';

import { TodoRepo } from '../api';
import { TodoStore } from '../model';

export const TodoPage = observer(() => {
	usePageTitle('To Do');

	const { userStore } = useStore();
	const [store] = useState(() => new TodoStore(new TodoRepo(), userStore));

	useEffect(() => {
		store.init();
		return () => store.destroy();
	}, [store]);

	if (store.isLoading) return <LoadingState />;

	if (store.error) return <LoadingError message={store.error} onRetry={store.reload} />;

	return <ComingSoon />;
});
