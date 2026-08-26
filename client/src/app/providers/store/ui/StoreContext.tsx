import { createContext } from 'react';

import type { RootStore } from '../model';

export const StoreContext = createContext<RootStore | null>(null);
