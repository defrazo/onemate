import type { ReactNode } from 'react';

import { getRootStore } from '../model';
import { StoreContext } from '.';

const StoreProvider = ({ children }: { children: ReactNode }) => {
	const rootStore = getRootStore();

	return <StoreContext.Provider value={rootStore}>{children}</StoreContext.Provider>;
};

export default StoreProvider;
