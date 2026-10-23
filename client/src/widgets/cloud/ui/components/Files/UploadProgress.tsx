import { IconCloudUpload } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';

import { formatFileSize, formatRemainingTime, formatUploadSpeed } from '../../../lib';

export const UploadProgress = observer(() => {
	const { cloudStore: store } = useStore();

	const isSaving = store.uploadFileSize > 0 && store.uploadLoadedBytes >= store.uploadFileSize;
	const isMultiple = store.uploadFilesCount > 1;

	return (
		<div className="flex flex-col gap-1.5">
			<div className="flex min-w-0 items-center gap-2 text-xs">
				<IconCloudUpload className="size-4 shrink-0 text-(--accent-primary)" />
				<span className="shrink-0 animate-pulse font-medium">{isSaving ? 'Сохранение' : 'Загрузка'}</span>
				{isMultiple && (
					<span className="text-(--text-secondary)">
						{store.uploadFileIndex} из {store.uploadFilesCount}
					</span>
				)}
				<span className="ml-auto shrink-0 text-(--accent-primary)/80 tabular-nums">
					{store.uploadProgress}%
				</span>
			</div>
			<div className="h-1.5 overflow-hidden rounded-full bg-(--tone-strong-hover)">
				<div
					className="h-full rounded-full bg-(--accent-primary) transition-[width] duration-200"
					style={{ width: `${store.uploadProgress}%` }}
				/>
			</div>
			<div className="flex min-w-0 items-center justify-between gap-2 text-[11px] text-(--text-disabled) tabular-nums">
				<span className="min-w-0 flex-1 truncate" title={store.uploadFileName}>
					{store.uploadFileName}
				</span>
				{!isSaving ? (
					<div className="flex shrink-0 items-center gap-1.5 whitespace-nowrap">
						<span>↑ {formatUploadSpeed(store.uploadSpeed)}</span>
						{store.uploadRemaining !== null && (
							<>
								<span className="opacity-50">·</span>
								<span>~{formatRemainingTime(store.uploadRemaining)}</span>
							</>
						)}
					</div>
				) : (
					<span className="shrink-0">
						{formatFileSize(store.uploadLoadedBytes)} / {formatFileSize(store.uploadFileSize)}
					</span>
				)}
			</div>
		</div>
	);
});
