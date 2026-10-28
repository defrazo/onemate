import { IconUpload } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { pluralize } from '@/shared/lib/utils';
import { Button, Divider } from '@/shared/ui';

import { formatFileSize } from '../../../lib';

interface FilesFooterProps {
	isDownloading: boolean;
	selectionMode: boolean;
	selectedCount: number;
	selectedSize: number;
	onUpload: () => void;
	onDownload: () => void;
	onDelete: () => void;
	onCancel: () => void;
}

export const FilesFooter = observer(
	({
		isDownloading,
		selectionMode,
		selectedCount,
		selectedSize,
		onUpload,
		onDownload,
		onDelete,
		onCancel,
	}: FilesFooterProps) => {
		const { cloudStore } = useStore();

		if (selectionMode) {
			return (
				<div className="flex items-center justify-between gap-3">
					<div className="flex min-w-0 flex-col gap-0.5">
						<span className="truncate text-[10px] font-medium text-(--accent-primary) md:text-xs">
							{pluralize(selectedCount, 'Выбран', 'Выбрано', 'Выбрано')} {selectedCount}{' '}
							{pluralize(selectedCount, 'файл', 'файла', 'файлов')}
						</span>
						<span className="trim hidden pb-0.5 text-[11px] text-(--text-disabled) md:block">
							Общий размер: {formatFileSize(selectedSize)}
						</span>
					</div>
					<div className="flex items-center gap-2">
						<Button
							className="h-7 text-xs"
							disabled={selectedCount === 0 || isDownloading}
							variant="accent"
							onClick={onDownload}
						>
							{isDownloading ? 'Скачивание' : 'Скачать'}
						</Button>
						<Button
							className="h-7 text-xs"
							disabled={selectedCount === 0 || isDownloading}
							variant="danger"
							onClick={onDelete}
						>
							Удалить
						</Button>
						<Button
							className="h-7 border border-(--border-contrast)/15 text-xs"
							disabled={isDownloading}
							variant="toneStrong"
							onClick={onCancel}
						>
							Отмена
						</Button>
					</div>
				</div>
			);
		}

		return (
			<div className="flex items-end justify-between gap-3">
				<div className="flex w-full min-w-0 flex-col gap-0.5 text-xs text-(--text-secondary)">
					<div className="flex gap-2">
						<span>
							{cloudStore.files.length} {pluralize(cloudStore.files.length, 'файл', 'файла', 'файлов')}
						</span>
						<Divider className="my-auto h-3" direction="Y" />
						<div>
							{formatFileSize(cloudStore.usedBytes)} / {formatFileSize(cloudStore.quotaBytes)}
						</div>
					</div>
					<div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-(--tone-strong-hover)">
						<div
							className="h-full rounded-full bg-(--accent-primary) transition-all"
							style={{ width: `${cloudStore.usagePercent}%` }}
						/>
					</div>
				</div>
				<Button
					className="h-7 w-26.5 shrink-0 text-xs"
					disabled={!cloudStore.isUploading && (!cloudStore.isReady || cloudStore.isUpdatingFiles)}
					leftIcon={!cloudStore.isUploading && <IconUpload className="size-4" />}
					variant={cloudStore.isUploading ? 'toneStrong' : 'accent'}
					onClick={cloudStore.isUploading ? () => cloudStore.cancelUpload() : onUpload}
				>
					{cloudStore.isUploading ? 'Отменить' : 'Загрузить'}
				</Button>
			</div>
		);
	}
);
