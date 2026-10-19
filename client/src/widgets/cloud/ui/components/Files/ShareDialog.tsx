import { useState } from 'react';
import { IconCopy, IconQrcode, IconShare } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';
import { QRCodeSVG } from 'qrcode.react';

import { useStore } from '@/app/providers';
import { cn } from '@/shared/lib/utils';
import { Button, Switch } from '@/shared/ui';

import { formatFileSize, getFileIcon } from '../../../lib';

export const ShareDialog = observer(({ fileId }: { fileId: string }) => {
	const { cloudStore, notifyStore } = useStore();

	const [isLoading, setIsLoading] = useState(false);
	const [showQr, setShowQr] = useState(false);
	const [copied, setCopied] = useState(false);

	const file = cloudStore.files.find((item) => item.id === fileId);

	const runAction = async (action: () => Promise<unknown>) => {
		if (isLoading) return;

		setIsLoading(true);

		try {
			await action();
		} catch (error) {
			notifyStore.setNotice(error instanceof Error ? error.message : 'Что-то пошло не так', 'error');
		} finally {
			setIsLoading(false);
		}
	};

	if (!file) return <p className="text-sm text-(--text-secondary)">Файл больше недоступен</p>;

	const FileIcon = getFileIcon(file.name);
	const publicUrl = file.publicUrl;

	const handleShare = () => {
		void runAction(async () => {
			await cloudStore.share(fileId);
			notifyStore.setNotice('Публичная ссылка создана', 'success');
		});
	};

	const handleUnshare = () => {
		void runAction(async () => {
			await cloudStore.unshare(fileId);
			setShowQr(false);
			setCopied(false);
			notifyStore.setNotice('Публичный доступ отключён', 'success');
		});
	};

	const handleCopy = () => {
		if (!publicUrl) return;

		void runAction(async () => {
			await navigator.clipboard.writeText(publicUrl);
			setCopied(true);
			notifyStore.setNotice('Ссылка скопирована', 'success');
		});
	};

	return (
		<div className="flex flex-col gap-3 md:-mt-4 md:w-md">
			<div className="flex items-center gap-3 select-none">
				<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-(--accent-primary)/12">
					<IconShare className="size-5 text-(--accent-primary)" />
				</div>
				<div className="flex flex-col gap-0.5">
					<h2 className="text-lg leading-tight font-semibold">Поделиться</h2>
					<p className="text-xs text-(--text-secondary)">Ссылка для доступа к файлу</p>
				</div>
			</div>
			<div className="flex min-w-0 cursor-default items-center gap-2 rounded-lg bg-(--tone-strong) px-2 py-1.5">
				<FileIcon className="size-8 shrink-0 text-(--accent-primary)" />
				<div className="-mt-px flex min-w-0 flex-1 flex-col gap-0.5">
					<span className="truncate text-sm font-medium" title={file.name}>
						{file.name}
					</span>
					<span className="trim text-xs text-(--text-secondary)">{formatFileSize(file.size)}</span>
				</div>
			</div>
			<div className="flex flex-col gap-3">
				<div className="flex items-center justify-between gap-3 select-none">
					<div className="flex min-w-0 flex-col gap-1">
						<span className="text-sm font-medium">Доступ по ссылке</span>
						<span className="trim text-xs text-(--text-disabled)">
							{publicUrl ? 'Скачивание по ссылке включено' : 'Скачивание по ссылке отключено'}
						</span>
					</div>
					<Switch
						checked={!!publicUrl}
						disabled={isLoading}
						onCheckedChange={(checked) => {
							if (checked) handleShare();
							else handleUnshare();
						}}
					/>
				</div>
				{publicUrl && (
					<>
						<div className="flex min-w-0 items-center gap-1 rounded-lg bg-(--tone) p-1">
							<span
								className="min-w-0 flex-1 truncate px-2 text-xs text-(--text-secondary)"
								title={publicUrl}
							>
								{publicUrl}
							</span>
							<Button
								centerIcon={<IconCopy className="size-4" />}
								className="size-8 shrink-0 rounded-md bg-(--tone-strong) hover:bg-(--tone-strong-hover) disabled:opacity-50"
								disabled={isLoading}
								title={copied ? 'Скопировано' : 'Копировать ссылку'}
								variant="iconSurface"
								onClick={handleCopy}
							/>
							<Button
								centerIcon={<IconQrcode className="size-4" />}
								className={cn(
									'size-8 shrink-0 rounded-md bg-(--tone-strong) disabled:opacity-50',
									showQr ? 'text-(--accent-primary)' : 'hover:bg-(--tone-strong-hover)'
								)}
								disabled={isLoading}
								title="Показать QR-код"
								variant="iconSurface"
								onClick={() => setShowQr((prev) => !prev)}
							/>
						</div>
						{showQr && (
							<div className="flex flex-col items-center gap-2 select-none">
								<div className="rounded-xl bg-white p-2">
									<QRCodeSVG size={160} value={publicUrl} />
								</div>
								<span className="text-xs text-(--text-secondary)">
									Отсканируйте, чтобы открыть ссылку
								</span>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
});
