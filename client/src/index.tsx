import { createRoot } from 'react-dom/client';

import { StartupProvider } from '@/app/providers';

import '@/shared/styles/index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

const root = createRoot(rootElement);
root.render(<StartupProvider />);
