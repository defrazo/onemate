import { type DragEvent, useEffect, useRef, useState } from 'react';
import { IconCloudUpload, IconFolderSearch, IconUpload, IconX } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { pluralize } from '@/shared/lib/utils';
import { Button, Divider, Input, NoContent } from '@/shared/ui';

import { formatFileSize, normalizePastedFiles } from '../../../lib';
import { useCloudPaste } from '../../../model';
import { Item } from '.';

export const Files = observer(({ searchOpen, onSearchClose }: { searchOpen: boolean; onSearchClose: () => void }) => {
	const { cloudStore, notifyStore } = useStore();

	const [isDragging, setIsDragging] = useState(false);

	const inputRef = useRef<HTMLInputElement>(null);
	const searchRef = useRef<HTMLInputElement>(null);
	const dragCounter = useRef(0);

	const canUpload = cloudStore.isReady && !cloudStore.isUploading;

	const uploadFiles = async (files: File[]): Promise<void> => {
		if (!files.length || !canUpload) return;

		try {
			await cloudStore.upload(files);
		} catch (error) {
			notifyStore.setNotice(error instanceof Error ? error.message : 'Что-то пошло не так', 'error');
		}
	};

	const closeSearch = () => {
		cloudStore.setSearchQuery('');
		onSearchClose();
	};

	const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
		event.preventDefault();

		if (!canUpload || !event.dataTransfer.types.includes('Files')) return;

		dragCounter.current += 1;
		setIsDragging(true);
	};

	const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
		event.preventDefault();

		if (!event.dataTransfer.types.includes('Files')) return;

		dragCounter.current = Math.max(0, dragCounter.current - 1);

		if (dragCounter.current === 0) setIsDragging(false);
	};

	const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
		event.preventDefault();

		event.dataTransfer.dropEffect = canUpload ? 'copy' : 'none';
	};

	const handleDrop = (event: DragEvent<HTMLDivElement>) => {
		event.preventDefault();

		dragCounter.current = 0;
		setIsDragging(false);

		if (!canUpload) return;

		void uploadFiles(Array.from(event.dataTransfer.files));
	};

	const pasteHandlers = useCloudPaste((files) => {
		void uploadFiles(normalizePastedFiles(files));
	}, canUpload);

	useEffect(() => {
		if (searchOpen) searchRef.current?.focus();
	}, [searchOpen]);

	useEffect(() => {
		const resetDrag = () => {
			dragCounter.current = 0;
			setIsDragging(false);
		};

		window.addEventListener('drop', resetDrag);
		window.addEventListener('dragend', resetDrag);

		return () => {
			window.removeEventListener('drop', resetDrag);
			window.removeEventListener('dragend', resetDrag);
		};
	}, []);

	return (
		<div
			{...pasteHandlers}
			className="flex min-h-0 flex-1 flex-col gap-2"
			onDragEnter={handleDragEnter}
			onDragLeave={handleDragLeave}
			onDragOver={handleDragOver}
			onDrop={handleDrop}
		>
			{searchOpen && (
				<div className="flex min-w-0 items-center gap-2 xl:ml-2">
					<Input
						ref={searchRef}
						className="h-8 min-w-0 flex-1 text-sm"
						id="search"
						placeholder="Поиск файлов..."
						value={cloudStore.searchQuery}
						variant="tone"
						onChange={(event) => cloudStore.setSearchQuery(event.target.value)}
						onKeyDown={(event) => {
							if (event.key === 'Escape') closeSearch();
						}}
					/>
					<Button
						centerIcon={<IconX className="size-4" />}
						className="p-1.5"
						title="Закрыть поиск"
						variant="icon"
						onClick={closeSearch}
					/>
				</div>
			)}
			<input
				ref={inputRef}
				multiple
				className="hidden"
				type="file"
				onChange={(event) => {
					void uploadFiles(Array.from(event.target.files ?? []));
					event.target.value = '';
				}}
			/>
			{cloudStore.isUploading && (
				<div className="flex flex-col gap-1">
					<div className="flex justify-between text-xs text-(--text-secondary)">
						<span>Загрузка...</span>
						<span>{cloudStore.uploadProgress}%</span>
					</div>
					<div className="h-1.5 overflow-hidden rounded-full bg-(--tone-strong)">
						<div
							className="h-full bg-(--accent-primary)"
							style={{ width: `${cloudStore.uploadProgress}%` }}
						/>
					</div>
				</div>
			)}
			<div className="relative min-h-0 flex-1">
				<div className="h-full scrollbar-none overflow-y-auto">
					{cloudStore.files.length === 0 ? (
						<NoContent
							description="Загруженные файлы появятся здесь"
							icon={IconCloudUpload}
							title="Файлов пока нет"
						/>
					) : cloudStore.visibleFiles.length === 0 ? (
						<NoContent
							description="Попробуйте изменить поисковый запрос"
							icon={IconFolderSearch}
							title="Ничего не найдено"
						/>
					) : (
						<div className="flex flex-col gap-1">
							{cloudStore.visibleFiles.map((file) => (
								<Item key={file.id} file={file} />
							))}
						</div>
					)}
				</div>
				{isDragging && (
					<div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl border border-dashed border-(--accent-primary) bg-(--bg-secondary)/95">
						<div className="mb-1.5 flex size-15 items-center justify-center rounded-xl bg-(--accent-primary-muted)">
							<IconCloudUpload className="size-9 text-(--accent-primary)" />
						</div>
						<span className="text-sm font-semibold">Отпустите файлы для загрузки</span>
						<span className="text-xs text-(--text-secondary)">Файлы будут добавлены в облако</span>
					</div>
				)}
			</div>
			<div className="flex items-end justify-between gap-3">
				<div className="flex w-full min-w-0 flex-col gap-0.5 text-xs text-(--text-secondary)">
					<div className="flex gap-2">
						<span>
							{cloudStore.files.length} {pluralize(cloudStore.files.length, 'файл', 'файла', 'файлов')}
						</span>
						<Divider direction="Y" />
						<div>
							{formatFileSize(cloudStore.usedBytes)} / {formatFileSize(cloudStore.quotaBytes)}
						</div>
					</div>
					<div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-(--tone-strong)">
						<div
							className="h-full rounded-full bg-(--accent-primary) transition-all"
							style={{ width: `${cloudStore.usagePercent}%` }}
						/>
					</div>
				</div>
				<Button
					className="h-7 shrink-0 text-xs"
					disabled={!canUpload}
					leftIcon={<IconUpload className="size-4" />}
					variant="accent"
					onClick={() => inputRef.current?.click()}
				>
					Загрузить
				</Button>
			</div>
		</div>
	);
});
