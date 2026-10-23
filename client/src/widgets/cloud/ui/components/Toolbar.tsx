import { SegmentedControl } from '@/shared/ui';

import type { CloudTab } from '../../model';
import { ClipboardToolbar, FilesToolbar } from '.';

const CLOUD_TABS = [
	{ value: 'files', label: 'Файлы' },
	{ value: 'text', label: 'Текст' },
] satisfies { value: CloudTab; label: string }[];

interface ToolbarProps {
	tab: CloudTab;
	searchOpen: boolean;
	selectionMode: boolean;
	onTabChange: (value: CloudTab) => void;
	onSearchToggle: () => void;
	onSelectionToggle: () => void;
	onRefresh: () => void;
}

export const Toolbar = ({
	tab,
	searchOpen,
	selectionMode,
	onTabChange,
	onSearchToggle,
	onSelectionToggle,
	onRefresh,
}: ToolbarProps) => {
	return (
		<div className="flex min-w-0 items-center justify-between">
			<div className="flex min-w-0 items-center gap-2">
				{tab === 'files' ? (
					<FilesToolbar
						searchOpen={searchOpen}
						selectionMode={selectionMode}
						onRefresh={onRefresh}
						onSearchToggle={onSearchToggle}
						onSelectionToggle={onSelectionToggle}
					/>
				) : (
					<ClipboardToolbar />
				)}
			</div>
			<SegmentedControl className="w-44" options={CLOUD_TABS} value={tab} onChange={onTabChange} />
		</div>
	);
};
