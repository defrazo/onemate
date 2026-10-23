import { useCallback, useEffect, useRef, useState } from 'react';
import {
	IconAlertCircle,
	IconCloudDownload,
	IconCopy,
	IconDownload,
	IconFile,
	IconFileText,
	IconLoader2,
	IconPhoto,
	IconRefresh,
} from '@tabler/icons-react';
import { useParams } from 'react-router-dom';

import { useStore } from '@/app/providers';
import { useCopy, usePageTitle } from '@/shared/lib/hooks';
import { Button } from '@/shared/ui';
import { formatFileSize } from '@/widgets/cloud';

import { getSharedFile, getSharedFileDownloadUrl, getSharedFilePreviewUrl, SharedFileNotFoundError } from '../api';
import { getPreviewType } from '../lib';
import type { SharedFile } from '../model';

type Status = 'loading' | 'success' | 'not-found' | 'error';
type PreviewStatus = 'idle' | 'loading' | 'success' | 'error';

const MAX_TEXT_BYTES = 1024 * 1024;

export const SharedFilePage = () => {
	usePageTitle('Общий файл');

	const copy = useCopy();
	const { token } = useParams<{ token: string }>();

	const { notifyStore } = useStore();

	const [status, setStatus] = useState<Status>('loading');
	const [file, setFile] = useState<SharedFile | null>(null);
	const [retry, setRetry] = useState(0);

	const [showPreview, setShowPreview] = useState(false);
	const [previewStatus, setPreviewStatus] = useState<PreviewStatus>('idle');
	const [textPreview, setTextPreview] = useState('');

	const previewController = useRef<AbortController | null>(null);

	const previewType = file ? getPreviewType(file.mimeType) : null;
	const previewUrl = token ? getSharedFilePreviewUrl(token) : '';
	const downloadUrl = token ? getSharedFileDownloadUrl(token) : '';

	const closePreview = useCallback(() => {
		previewController.current?.abort();
		previewController.current = null;

		setShowPreview(false);
		setPreviewStatus((current) => (current === 'loading' ? 'idle' : current));
	}, []);

	const handlePreview = async () => {
		if (!previewType || !token) return;

		if (showPreview) {
			closePreview();
			return;
		}

		setShowPreview(true);

		if (previewType === 'text' && file && file.size > MAX_TEXT_BYTES) {
			setPreviewStatus('error');
			return;
		}

		if (previewType !== 'text') {
			setPreviewStatus('loading');
			return;
		}

		if (previewStatus === 'success') return;

		const controller = new AbortController();
		previewController.current = controller;

		setPreviewStatus('loading');

		try {
			const response = await fetch(previewUrl, { signal: controller.signal });
			if (!response.ok) throw new Error('Ошибка предпросмотра');

			const blob = await response.blob();
			if (controller.signal.aborted) return;
			if (blob.size > MAX_TEXT_BYTES) throw new Error('Файл слишком большой для предпросмотра');

			const text = await blob.text();
			if (controller.signal.aborted) return;

			setTextPreview(text);
			setPreviewStatus('success');
		} catch {
			if (!controller.signal.aborted) setPreviewStatus('error');
		} finally {
			if (previewController.current === controller) previewController.current = null;
		}
	};

	const handleCopyText = async () => {
		if (!file || previewType !== 'text') return;

		try {
			if (file.size > MAX_TEXT_BYTES) throw new Error('Файл слишком большой для копирования');

			let text = textPreview;

			if (previewStatus !== 'success') {
				const response = await fetch(previewUrl);
				if (!response.ok) throw new Error('Не удалось загрузить текст');

				const blob = await response.blob();
				if (blob.size > MAX_TEXT_BYTES) throw new Error('Файл слишком большой для копирования');

				text = await blob.text();

				setTextPreview(text);
				setPreviewStatus('success');
			}

			copy(text, 'Текст скопирован');
		} catch (error) {
			notifyStore.setNotice(error instanceof Error ? error.message : 'Не удалось скопировать текст', 'error');
		}
	};

	const handleRetry = () => {
		closePreview();
		setPreviewStatus('idle');
		setTextPreview('');
		setRetry((current) => current + 1);
	};

	useEffect(() => {
		previewController.current?.abort();
		previewController.current = null;

		setShowPreview(false);
		setPreviewStatus('idle');
		setTextPreview('');
	}, [token]);

	useEffect(() => {
		if (!token) {
			setStatus('not-found');
			return;
		}

		const controller = new AbortController();

		const load = async () => {
			setStatus('loading');
			setFile(null);

			try {
				const data = await getSharedFile(token, controller.signal);

				if (controller.signal.aborted) return;

				setFile(data);
				setStatus('success');
			} catch (error) {
				if (controller.signal.aborted) return;

				setStatus(error instanceof SharedFileNotFoundError ? 'not-found' : 'error');
			}
		};

		void load();

		return () => controller.abort();
	}, [token, retry]);

	useEffect(() => {
		return () => {
			previewController.current?.abort();
		};
	}, [token, retry]);

	useEffect(() => {
		const meta = document.createElement('meta');
		meta.name = 'robots';
		meta.content = 'noindex, nofollow, noarchive';

		document.head.appendChild(meta);

		return () => meta.remove();
	}, []);

	return (
		<div className="flex min-h-screen items-center justify-center px-4 py-10 select-none">
			<div className="core-surface core-pad flex w-full max-w-xl flex-col items-center gap-3 bg-(--bg-secondary) px-6 py-8 shadow-(--shadow-contrast) md:px-8">
				<div className="flex size-16 items-center justify-center rounded-xl bg-(--accent-primary-muted)">
					{status === 'loading' ? (
						<IconLoader2 className="size-8 animate-spin text-(--accent-primary)" />
					) : status === 'not-found' || status === 'error' ? (
						<IconAlertCircle className="size-8 text-(--accent-primary)" />
					) : (
						<IconCloudDownload className="size-8 text-(--accent-primary)" />
					)}
				</div>
				{status === 'loading' && (
					<div className="flex flex-col items-center">
						<h1 className="text-xl font-semibold">Загружаем файл</h1>
						<p className="text-center text-sm text-(--text-secondary)">Получаем информацию о файле</p>
					</div>
				)}
				{status === 'not-found' && (
					<>
						<h1 className="text-center text-xl font-semibold">Файл недоступен</h1>
						<p className="max-w-sm text-center text-sm text-(--text-secondary)">
							Возможно, владелец отключил публичный доступ, удалил файл или ссылка недействительна.
						</p>
					</>
				)}
				{status === 'error' && (
					<>
						<h1 className="text-center text-xl font-semibold">Не удалось загрузить файл</h1>
						<p className="max-w-sm text-center text-sm text-(--text-secondary)">
							Произошла ошибка соединения с сервером. Попробуйте ещё раз.
						</p>
						<Button
							className="mt-2 h-10 min-w-48"
							leftIcon={<IconRefresh className="size-4" />}
							onClick={handleRetry}
						>
							Повторить попытку
						</Button>
					</>
				)}
				{status === 'success' && file && (
					<>
						<div className="flex flex-col items-center">
							<h1 className="text-xl font-semibold">Общий доступ к файлу</h1>
							<p className="text-sm text-(--text-secondary)">Просмотрите или скачайте файл</p>
						</div>
						<div className="flex w-full min-w-0 items-center gap-3 rounded-xl bg-(--bg-tertiary) px-3 py-2.5">
							<div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-(--accent-primary-muted)">
								{previewType === 'image' ? (
									<IconPhoto className="size-6 text-(--accent-primary)" />
								) : previewType === 'text' ? (
									<IconFileText className="size-6 text-(--accent-primary)" />
								) : (
									<IconFile className="size-6 text-(--accent-primary)" />
								)}
							</div>
							<div className="flex min-w-0 flex-1 flex-col gap-0.5">
								<span className="truncate font-semibold" title={file.name}>
									{file.name}
								</span>
								<span className="text-xs text-(--text-secondary)">{formatFileSize(file.size)}</span>
							</div>
						</div>
						<div className="flex w-full flex-col gap-2 md:flex-row">
							<a
								className="flex h-8 w-full min-w-0 items-center justify-center gap-2 rounded-lg bg-(--accent-primary) px-4 font-medium text-(--text-on-accent) transition-colors hover:bg-(--accent-primary-hover) xl:max-w-60"
								href={downloadUrl}
							>
								<IconDownload className="size-4" />
								Скачать файл
							</a>
							<div className="flex flex-1 items-center gap-2">
								{previewType && (
									<Button
										className="h-8 min-w-0 flex-1"
										variant="toneStrong"
										onClick={() => void handlePreview()}
									>
										{showPreview ? 'Скрыть просмотр' : 'Предпросмотр'}
									</Button>
								)}
								{previewType === 'text' && (
									<Button
										centerIcon={<IconCopy className="size-4" />}
										className="size-8 shrink-0"
										disabled={file.size > MAX_TEXT_BYTES}
										title="Копировать текст"
										variant="toneStrong"
										onClick={() => void handleCopyText()}
									/>
								)}
							</div>
						</div>
						{showPreview && (
							<div className="relative w-full min-w-0 overflow-hidden rounded-xl bg-(--bg-tertiary)">
								{previewStatus === 'loading' && (
									<div className="flex h-48 flex-col items-center justify-center gap-3">
										<IconLoader2 className="size-7 animate-spin text-(--accent-primary)" />
										<span className="text-sm text-(--text-secondary)">Загружаем предпросмотр</span>
									</div>
								)}
								{previewStatus === 'error' && (
									<div className="flex h-40 flex-col items-center justify-center gap-2 px-4">
										<IconAlertCircle className="size-7 text-(--text-secondary)" />
										<p className="text-center text-sm text-(--text-secondary)">
											Не удалось открыть предпросмотр
										</p>
										<Button
											variant="ghost"
											onClick={() => {
												setPreviewStatus('idle');
												setShowPreview(false);
											}}
										>
											Закрыть
										</Button>
									</div>
								)}
								{previewType === 'image' && previewStatus !== 'error' && (
									<img
										alt={file.name}
										className={
											previewStatus === 'success' ? 'max-h-96 w-full object-contain' : 'hidden'
										}
										src={previewUrl}
										onError={() => setPreviewStatus('error')}
										onLoad={() => setPreviewStatus('success')}
									/>
								)}
								{previewType === 'pdf' && previewStatus !== 'error' && (
									<iframe
										className={previewStatus === 'success' ? 'h-96 w-full' : 'h-0 w-full'}
										src={previewUrl}
										title={file.name}
										onLoad={() => setPreviewStatus('success')}
									/>
								)}
								{previewType === 'text' && previewStatus === 'success' && (
									<div className="relative">
										<Button
											centerIcon={<IconCopy className="size-4" />}
											className="absolute top-2 right-2 z-10 size-8"
											title="Копировать текст"
											variant="iconSurface"
											onClick={() => void handleCopyText()}
										/>
										<pre className="max-h-96 overflow-auto p-4 pr-12 text-xs whitespace-pre-wrap select-text">
											{textPreview}
										</pre>
									</div>
								)}
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
};
