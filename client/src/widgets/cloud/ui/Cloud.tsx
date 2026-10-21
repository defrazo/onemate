import { useState } from 'react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { LoadingState } from '@/shared/ui';

import { CLOUD_LIMITS, type CloudTab } from '../model';
import { Clipboard, Files, Toolbar } from './components';

export const Cloud = observer(() => {
	const { cloudStore, notifyStore } = useStore();

	const [tab, setTab] = useState<CloudTab>('files');
	const [searchOpen, setSearchOpen] = useState(false);

	const [selectionMode, setSelectionMode] = useState(false);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

	const handleTabChange = (value: CloudTab) => {
		if (value === tab) return;

		cancelSelection();
		setSearchOpen(false);
		cloudStore.setSearchQuery('');
		setTab(value);
	};

	const handleRefresh = () => {
		void cloudStore.refresh();
		cancelSelection();
	};

	const cancelSelection = () => {
		setSelectionMode(false);
		setSelectedIds(new Set());
	};

	const toggleSelectionMode = () => {
		if (selectionMode) cancelSelection();
		else setSelectionMode(true);
	};

	const toggleFileSelection = (id: string) => {
		if (!selectedIds.has(id) && selectedIds.size >= CLOUD_LIMITS.SELECTED_FILES) {
			notifyStore.setNotice('Не более 100 файлов', 'error');
			return;
		}

		setSelectedIds((prev) => {
			const next = new Set(prev);

			if (next.has(id)) next.delete(id);
			else if (next.size < CLOUD_LIMITS.SELECTED_FILES) next.add(id);

			return next;
		});
	};

	return (
		<div className="flex min-h-0 flex-1 flex-col gap-2">
			{!cloudStore.isReady ? (
				<LoadingState size="lg" />
			) : (
				<>
					<Toolbar
						searchOpen={searchOpen}
						selectionMode={selectionMode}
						tab={tab}
						onRefresh={handleRefresh}
						onSearchToggle={() => setSearchOpen((prev) => !prev)}
						onSelectionToggle={toggleSelectionMode}
						onTabChange={handleTabChange}
					/>
					{tab === 'files' ? (
						<Files
							searchOpen={searchOpen}
							selectedIds={selectedIds}
							selectionMode={selectionMode}
							onSearchClose={() => setSearchOpen(false)}
							onSelectionCancel={cancelSelection}
							onSelectionToggle={toggleFileSelection}
						/>
					) : (
						<Clipboard />
					)}
				</>
			)}
		</div>
	);
});
