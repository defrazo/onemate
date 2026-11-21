import { useContext } from 'react';

import { StoreContext } from './StoreContext';

export const useStore = () => {
	const context = useContext(StoreContext);
	if (!context) throw new Error('useStore должен использоваться в рамках StoreProvider');

	return context;
};
