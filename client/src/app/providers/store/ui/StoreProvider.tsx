import type { ReactNode } from 'react';

import { getRootStore } from '../model/root.store';
import { StoreContext } from './StoreContext';

export const StoreProvider = ({ children }: { children: ReactNode }) => {
	const rootStore = getRootStore();

	return <StoreContext.Provider value={rootStore}>{children}</StoreContext.Provider>;
};
