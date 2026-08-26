import type { ReactNode } from 'react';

import { getRootStore } from '../model';
import { StoreContext } from '.';

interface StoreProviderProps {
	children: ReactNode;
}

const StoreProvider = ({ children }: StoreProviderProps) => {
	const rootStore = getRootStore();

	return <StoreContext.Provider value={rootStore}>{children}</StoreContext.Provider>;
};

export default StoreProvider;
