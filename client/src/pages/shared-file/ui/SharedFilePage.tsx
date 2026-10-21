import { useCallback, useEffect, useRef, useState } from 'react';
import {
	IconAlertCircle,
	IconCloudDownload,
	IconDownload,
	IconFile,
	IconFileText,
	IconLoader2,
	IconPhoto,
	IconRefresh,
} from '@tabler/icons-react';
import { useParams } from 'react-router-dom';

import { usePageTitle } from '@/shared/lib/hooks';
import { Button } from '@/shared/ui';
import { formatFileSize } from '@/widgets/cloud';

import { getSharedFile, getSharedFileDownloadUrl, getSharedFilePreviewUrl, SharedFileNotFoundError } from '../api';
import { getPreviewType } from '../lib';
import type { SharedFile } from '../model';

type Status = 'loading' | 'success' | 'not-found' | 'error';
type PreviewStatus = 'idle' | 'loading' | 'success' | 'error';

export const SharedFilePage = () => {
	usePageTitle('Общий файл');

	const { token } = useParams<{ token: string }>();

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

			const text = await response.text();

			if (controller.signal.aborted) return;

			setTextPreview(text);
			setPreviewStatus('success');
		} catch {
			if (!controller.signal.aborted) setPreviewStatus('error');
		} finally {
			if (previewController.current === controller) previewController.current = null;
		}
	};

	const handleRetry = () => {
		closePreview();
		setPreviewStatus('idle');
		setTextPreview('');
		setRetry((current) => current + 1);
	};

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
						<p className="text-center text-sm text-(--text-secondary)">Получаем информацию о файле...</p>
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
						<div className="flex w-full flex-col gap-2 sm:flex-row">
							<a
								className="flex h-8 w-full items-center justify-center gap-2 rounded-lg bg-(--accent-primary) px-4 font-medium text-(--text-on-accent) transition-opacity hover:opacity-90"
								href={downloadUrl}
							>
								<IconDownload className="size-4" />
								Скачать файл
							</a>
							{previewType && (
								<Button className="h-8 w-full" variant="ghost" onClick={() => void handlePreview()}>
									{showPreview ? 'Скрыть просмотр' : 'Предпросмотр'}
								</Button>
							)}
						</div>
						{showPreview && (
							<div className="relative w-full min-w-0 overflow-hidden rounded-xl bg-(--bg-tertiary)">
								{previewStatus === 'loading' && (
									<div className="flex h-48 flex-col items-center justify-center gap-3">
										<IconLoader2 className="size-7 animate-spin text-(--accent-primary)" />
										<span className="text-sm text-(--text-secondary)">
											Загружаем предпросмотр...
										</span>
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
									<pre className="max-h-96 overflow-auto p-4 text-xs whitespace-pre-wrap select-text">
										{textPreview}
									</pre>
								)}
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
};
