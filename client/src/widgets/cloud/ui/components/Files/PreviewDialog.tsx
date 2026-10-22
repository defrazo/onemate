import { useEffect, useState } from 'react';
import { IconCopy, IconDownload, IconFileOff } from '@tabler/icons-react';

import { useStore } from '@/app/providers';
import { useCopy } from '@/shared/lib/hooks';
import { Button, LoadingState } from '@/shared/ui';

import { getPreviewType } from '../../../lib';
import { CLOUD_PREVIEW_BYTES, CLOUD_TEXT_PREVIEW_BYTES, type CloudFile } from '../../../model';

export const PreviewDialog = ({ file }: { file: CloudFile }) => {
	const copy = useCopy();

	const { cloudStore, notifyStore } = useStore();

	const [url, setUrl] = useState<string | null>(null);
	const [content, setContent] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const type = getPreviewType(file.name, file.mimeType);

	const handleDownload = async (): Promise<void> => {
		try {
			await cloudStore.download(file);
		} catch {
			notifyStore.setNotice('Не удалось скачать файл', 'error');
		}
	};

	useEffect(() => {
		let cancelled = false;
		let objectUrl: string | null = null;

		const load = async (): Promise<void> => {
			try {
				const limit = type === 'text' ? CLOUD_TEXT_PREVIEW_BYTES : CLOUD_PREVIEW_BYTES;

				if (file.size > limit) throw new Error('Файл слишком большой для предпросмотра');

				const blob = await cloudStore.getPreview(file.id);

				if (cancelled) return;

				if (blob.size > limit) throw new Error('Файл слишком большой для предпросмотра');

				if (type === 'text') {
					const text = await blob.text();

					if (!cancelled) setContent(text);
					return;
				}

				if (type === 'image' || type === 'pdf') {
					objectUrl = URL.createObjectURL(blob);

					if (!cancelled) setUrl(objectUrl);
				}
			} catch (error) {
				if (!cancelled) {
					notifyStore.setNotice(
						error instanceof Error ? error.message : 'Не удалось загрузить предпросмотр',
						'error'
					);
				}
			} finally {
				if (!cancelled) setIsLoading(false);
			}
		};

		void load();

		return () => {
			cancelled = true;
			if (objectUrl) URL.revokeObjectURL(objectUrl);
		};
	}, [file.id, file.size, cloudStore, notifyStore, type]);

	return (
		<div className="flex min-h-0 flex-col gap-3 md:-mt-4 md:w-2xl">
			<div className="flex min-w-0 flex-col select-none">
				<div className="flex items-center gap-2">
					<h2 className="max-w-2/3 truncate font-semibold xl:text-lg">{file.name}</h2>
					<Button
						centerIcon={<IconDownload className="size-5 shrink-0" />}
						padding="none"
						title="Скачать файл"
						variant="icon"
						onClick={() => void handleDownload()}
					/>
					{type === 'text' && content !== null && (
						<Button
							centerIcon={<IconCopy className="size-5" />}
							padding="none"
							title="Копировать текст"
							variant="icon"
							onClick={() => copy(content, 'Текст скопирован')}
						/>
					)}
				</div>
				<p className="text-xs text-(--text-disabled)">Предпросмотр файла</p>
			</div>
			<div className="flex min-h-48 min-w-0 items-center justify-center overflow-hidden rounded-lg bg-(--tone)">
				{isLoading ? (
					<LoadingState size="lg" />
				) : type === 'image' && url ? (
					<img alt={file.name} className="max-h-[65vh] max-w-full object-contain" src={url} />
				) : type === 'pdf' && url ? (
					<iframe className="h-[65vh] w-full border-0" src={url} title={file.name} />
				) : type === 'text' && content !== null ? (
					<textarea
						readOnly
						className="h-[55vh] w-full resize-none overflow-auto bg-transparent p-3 font-mono text-sm outline-none"
						spellCheck={false}
						value={content ?? ''}
					/>
				) : (
					<div className="flex h-full flex-col items-center justify-center select-none">
						<div className="mb-1.5 flex size-8 items-center justify-center rounded-lg bg-(--tone) md:size-15">
							<IconFileOff className="size-4.5 shrink-0 text-(--text-disabled) md:size-9" />
						</div>
						<span className="text-sm text-(--text-secondary)">Предпросмотр недоступен</span>
					</div>
				)}
			</div>
		</div>
	);
};
