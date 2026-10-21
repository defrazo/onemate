import { useEffect, useState } from 'react';
import {
	type Icon,
	IconCheck,
	IconLink,
	IconSquare,
	IconSquareCheck,
	IconStar,
	IconStarFilled,
	IconX,
} from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { useCopy } from '@/shared/lib/hooks';
import { cn } from '@/shared/lib/utils';
import { Button, ConfirmDialog, Input } from '@/shared/ui';

import { formatFileSize, getFileIcon, getFileNameParts, getPreviewType } from '../../../lib';
import type { CloudFile } from '../../../model';
import { FilesItemActions, PreviewDialog, ShareDialog } from '.';

interface FilesItem {
	file: CloudFile;
	selectionMode: boolean;
	selected: boolean;
	onSelect: () => void;
}

export const FilesItem = observer(({ file, selectionMode, selected, onSelect }: FilesItem) => {
	const copy = useCopy();

	const { cloudStore, modalStore, notifyStore } = useStore();

	const [isEditing, setIsEditing] = useState(false);
	const [name, setName] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const { name: originalName, extension } = getFileNameParts(file.name);
	const publicUrl = file.publicUrl;
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

	useEffect(() => {
		if (selectionMode) setIsEditing(false);
	}, [selectionMode]);

	return (
		<div
			className={cn(
				'group/file flex min-w-0 flex-col gap-2 rounded-lg py-1.5 transition-colors hover:bg-(--tone-hover) xl:px-2',
				selectionMode && 'cursor-pointer',
				selectionMode && selected && 'xl:bg-(--tone-hover)'
			)}
			onClick={selectionMode ? onSelect : undefined}
		>
			<div className="flex min-w-0 items-center gap-2">
				{selectionMode ? (
					<ItemData
						selectionMode
						date={date}
						icon={FileIcon}
						name={file.name}
						selected={selected}
						size={file.size}
					/>
				) : isEditing ? (
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
						className="min-w-0 flex-1 gap-2 rounded-md text-left"
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
				{selectionMode ? null : isEditing ? (
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
						{publicUrl && (
							<Button
								centerIcon={
									<IconLink className="size-4 text-(--accent-primary) transition-colors hover:text-(--accent-primary-hover)" />
								}
								className="px-1.5"
								disabled={isLoading}
								padding="none"
								title="Скопировать ссылку"
								variant="icon"
								onClick={() => copy(publicUrl, 'Ссылка скопирована')}
							/>
						)}
						<Button
							centerIcon={
								file.isFavorite ? (
									<IconStarFilled className="size-4 text-(--accent-primary) transition-colors hover:text-(--accent-primary-hover)" />
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
						<FilesItemActions
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
	selectionMode?: boolean;
	selected?: boolean;
}

const ItemData = ({
	icon: Icon,
	name,
	size,
	date,
	partial,
	selectionMode = false,
	selected = false,
}: ItemDataProps) => {
	return (
		<>
			<div className="flex size-8.5 shrink-0 items-center justify-center rounded-lg bg-(--tone-strong)">
				{selectionMode ? (
					selected ? (
						<IconSquareCheck className="size-5 text-(--accent-primary)" />
					) : (
						<IconSquare className="size-5 text-(--text-secondary) transition-colors group-hover/file:text-(--accent-primary)" />
					)
				) : (
					<Icon className="size-5 text-(--accent-primary)" />
				)}
			</div>
			{!partial && (
				<div className="flex min-w-0 flex-1 flex-col">
					<span className="-mb-0.5 block w-full truncate text-sm font-semibold">{name}</span>
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
