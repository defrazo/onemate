import { useState } from 'react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { LoadingState } from '@/shared/ui';

import type { CloudTab } from '../model';
import { Clipboard, Files, Toolbar } from './components';

export const Cloud = observer(() => {
	const { cloudStore } = useStore();

	const [tab, setTab] = useState<CloudTab>('files');
	const [searchOpen, setSearchOpen] = useState(false);

	return (
		<div className="flex min-h-0 flex-1 flex-col gap-2">
			{!cloudStore.isReady ? (
				<LoadingState size="lg" />
			) : (
				<>
					<Toolbar
						searchOpen={searchOpen}
						tab={tab}
						onSearchToggle={() => setSearchOpen((prev) => !prev)}
						onTabChange={setTab}
					/>
					{tab === 'files' ? (
						<Files searchOpen={searchOpen} onSearchClose={() => setSearchOpen(false)} />
					) : (
						<Clipboard />
					)}
				</>
			)}
		</div>
	);
});
