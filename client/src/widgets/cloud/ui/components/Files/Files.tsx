import { type DragEvent, useEffect, useRef, useState } from 'react';
import { IconCloudUpload, IconFolderSearch, IconX } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { pluralize } from '@/shared/lib/utils';
import { Button, ConfirmDialog, Input, NoContent } from '@/shared/ui';

import { normalizePastedFiles } from '../../../lib';
import { useCloudPaste } from '../../../model';
import { FilesFooter, FilesItem, UploadProgress } from '.';

interface FilesProps {
	searchOpen: boolean;
	selectionMode: boolean;
	selectedIds: Set<string>;
	onSearchClose: () => void;
	onSelectionToggle: (id: string) => void;
	onSelectionCancel: () => void;
}

export const Files = observer(
	({ searchOpen, selectionMode, selectedIds, onSearchClose, onSelectionToggle, onSelectionCancel }: FilesProps) => {
		const { cloudStore, modalStore, notifyStore } = useStore();

		const [isDragging, setIsDragging] = useState(false);

		const inputRef = useRef<HTMLInputElement>(null);
		const searchRef = useRef<HTMLInputElement>(null);
		const dragCounter = useRef(0);

		const canUpload = cloudStore.isReady && !cloudStore.isUploading && !selectionMode;

		const selectedSize = cloudStore.files.reduce(
			(total, file) => total + (selectedIds.has(file.id) ? file.size : 0),
			0
		);

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

		const handleDeleteSelected = () => {
			if (!selectedIds.size) return;

			const ids = [...selectedIds];
			const count = ids.length;

			modalStore.setModal(
				<ConfirmDialog
					confirmLabel="Удалить"
					description={`Удалить ${count} ${pluralize(count, 'файл', 'файла', 'файлов')}? Это действие нельзя отменить.`}
					title="Удаление файлов"
					variant="danger"
					onCancel={() => modalStore.closeModal()}
					onConfirm={() => {
						modalStore.closeModal();
						onSelectionCancel();

						void cloudStore
							.deleteMany(ids)
							.then(() => {
								notifyStore.setNotice(
									`Удалено ${count} ${pluralize(count, 'файл', 'файла', 'файлов')}`,
									'success'
								);
							})
							.catch((error) => {
								notifyStore.setNotice(
									error instanceof Error ? error.message : 'Не удалось удалить файлы',
									'error'
								);
							});
					}}
				/>
			);
		};

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
				{cloudStore.isUploading && <UploadProgress />}
				<div className="relative min-h-0 flex-1 scrollbar-none overflow-y-auto overscroll-contain">
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
								<FilesItem
									key={file.id}
									file={file}
									selected={selectedIds.has(file.id)}
									selectionMode={selectionMode}
									onSelect={() => onSelectionToggle(file.id)}
								/>
							))}
						</div>
					)}
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
				<FilesFooter
					selectedCount={selectedIds.size}
					selectedSize={selectedSize}
					selectionMode={selectionMode}
					onCancel={onSelectionCancel}
					onDelete={handleDeleteSelected}
					onUpload={() => inputRef.current?.click()}
				/>
			</div>
		);
	}
);
