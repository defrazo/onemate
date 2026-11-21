import { createContext } from 'react';

import type { RootStore } from '../model/root.store';

export const StoreContext = createContext<RootStore | null>(null);
