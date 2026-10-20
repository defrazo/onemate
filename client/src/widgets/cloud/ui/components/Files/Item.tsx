import { useState } from 'react';
import { type Icon, IconCheck, IconStar, IconStarFilled, IconX } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { Button, ConfirmDialog, Input } from '@/shared/ui';

import { formatFileSize, getFileIcon, getFileNameParts, getPreviewType } from '../../../lib';
import type { CloudFile } from '../../../model';
import { ItemActions, PreviewDialog, ShareDialog } from '.';

export const Item = observer(({ file }: { file: CloudFile }) => {
	const { cloudStore, modalStore, notifyStore } = useStore();

	const [isEditing, setIsEditing] = useState(false);
	const [name, setName] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const { name: originalName, extension } = getFileNameParts(file.name);
	const date = new Date(file.createdAt).toLocaleDateString('ru-RU');
	const FileIcon = getFileIcon(file.name);
	const previewType = getPreviewType(file.name, file.mimeType);
	const canPreview = previewType !== null;

	const executeAsync = async (callback: () => Promise<unknown>): Promise<void> => {
		if (isLoading) return;

		setIsLoading(true);

		try {
			await callback();
		} catch (error) {
			notifyStore.setNotice(error instanceof Error ? error.message : 'Что-то пошло не так', 'error');
		} finally {
			setIsLoading(false);
		}
	};

	const handlePreview = () => {
		if (!canPreview || isLoading) return;

		modalStore.setModal(<PreviewDialog file={file} />);
	};

	const startEditing = () => {
		setName(originalName);
		setIsEditing(true);
	};

	const cancelEditing = () => {
		setName(originalName);
		setIsEditing(false);
	};

	const saveName = async (): Promise<void> => {
		const trimmed = name.trim();

		if (!trimmed) {
			notifyStore.setNotice('Введите имя файла', 'error');
			return;
		}

		const filename = `${trimmed}${extension}`;

		if (filename === file.name) {
			setIsEditing(false);
			return;
		}

		await executeAsync(async () => {
			await cloudStore.renameFile(file.id, filename);
			setIsEditing(false);
		});
	};

	const deleteFile = () => {
		modalStore.setModal(
			<ConfirmDialog
				confirmLabel="Удалить"
				description={`Удалить файл «${file.name}»? Это действие нельзя отменить.`}
				title="Удаление файла"
				variant="danger"
				onCancel={() => modalStore.closeModal()}
				onConfirm={async () => {
					try {
						await cloudStore.delete(file.id);

						modalStore.closeModal();
						notifyStore.setNotice('Файл удалён', 'success');
					} catch (error) {
						notifyStore.setNotice(error instanceof Error ? error.message : 'Что-то пошло не так', 'error');
					}
				}}
			/>
		);
	};

	return (
		<div className="group/file flex min-w-0 flex-col gap-2 rounded-lg py-1.5 transition-colors hover:bg-(--tone-hover) xl:px-2">
			<div className="flex min-w-0 items-center gap-2">
				{isEditing ? (
					<div className="flex min-w-0 flex-1 items-center gap-2">
						<ItemData partial date={date} icon={FileIcon} name={file.name} size={file.size} />
						<Input
							autoFocus
							className="min-w-0 flex-1 bg-transparent pl-1.5 text-sm outline-none not-lg:py-0.5"
							id={`filename-${file.name}`}
							maxLength={255 - extension.length}
							rightIcon={
								extension && (
									<span className="shrink-0 text-sm text-(--text-secondary)">{extension}</span>
								)
							}
							value={name}
							onChange={(event) => setName(event.target.value)}
							onKeyDown={(event) => {
								if (event.key === 'Enter') {
									event.preventDefault();
									void saveName();
								}

								if (event.key === 'Escape') cancelEditing();
							}}
						/>
					</div>
				) : canPreview ? (
					<Button
						className="flex-1 gap-2 rounded-md text-left"
						disabled={isLoading}
						padding="none"
						title={file.name}
						variant="custom"
						onClick={handlePreview}
					>
						<ItemData date={date} icon={FileIcon} name={file.name} size={file.size} />
					</Button>
				) : (
					<div className="flex min-w-0 flex-1 items-center gap-2">
						<ItemData date={date} icon={FileIcon} name={file.name} size={file.size} />
					</div>
				)}
				{isEditing ? (
					<>
						<Button
							centerIcon={<IconCheck className="size-4" />}
							disabled={isLoading}
							padding="none"
							title="Сохранить имя"
							variant="icon"
							onClick={() => void saveName()}
						/>
						<Button
							centerIcon={<IconX className="size-4" />}
							disabled={isLoading}
							padding="none"
							title="Отмена"
							variant="icon"
							onClick={cancelEditing}
						/>
					</>
				) : (
					<>
						<Button
							centerIcon={
								file.isFavorite ? (
									<IconStarFilled className="size-4 text-(--accent-primary)" />
								) : (
									<IconStar className="size-4 transition-opacity xl:opacity-0 xl:group-hover/file:opacity-100" />
								)
							}
							className="px-1.5"
							disabled={isLoading}
							padding="none"
							title={file.isFavorite ? 'Убрать из избранного' : 'В избранное'}
							variant="icon"
							onClick={() => void executeAsync(() => cloudStore.toggleFavorite(file.id))}
						/>
						<ItemActions
							canPreview={canPreview}
							disabled={isLoading}
							onDelete={deleteFile}
							onDownload={() => {
								void executeAsync(() => cloudStore.download(file));
							}}
							onPreview={handlePreview}
							onRename={startEditing}
							onShare={() => modalStore.setModal(<ShareDialog fileId={file.id} />)}
						/>
					</>
				)}
			</div>
		</div>
	);
});

interface ItemDataProps {
	icon: Icon;
	name: string;
	size: number;
	date: string;
	partial?: boolean;
}

const ItemData = ({ icon: Icon, name, size, date, partial }: ItemDataProps) => {
	return (
		<>
			<div className="flex size-8.5 shrink-0 items-center justify-center rounded-lg bg-(--tone-strong)">
				<Icon className="size-5 text-(--accent-primary)" />
			</div>
			{!partial && (
				<div className="flex min-w-0 flex-1 flex-col">
					<span className="-mb-0.5 max-w-50 truncate text-sm font-semibold xl:max-w-72 2xl:max-w-85">
						{name}
					</span>
					<span className="flex items-center gap-1.5 text-xs text-(--text-secondary)">
						<span>{formatFileSize(size)}</span>
						<span className="transition-opacity xl:opacity-0 xl:group-hover/file:opacity-100">·</span>
						<span className="transition-opacity xl:opacity-0 xl:group-hover/file:opacity-100">{date}</span>
					</span>
				</div>
			)}
		</>
	);
};
