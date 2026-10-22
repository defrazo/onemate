import { useEffect, useRef, useState } from 'react';
import { IconAlertHexagon, IconCloudPlus, IconRefresh } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

import { ConflictDialog } from '.';

const SAVED_STATUS_DURATION = 4000;

export const ClipboardToolbar = observer(() => {
	const { cloudStore, modalStore, notifyStore } = useStore();

	const [showSaved, setShowSaved] = useState(false);
	const wasSaving = useRef(cloudStore.isSavingText);

	const { isSavingText, isTextDirty, isResolvingTextConflict, textSaveError, textConflict } = cloudStore;

	const saveStatus = textSaveError
		? textSaveError
		: isResolvingTextConflict
			? 'Разрешение конфликта...'
			: isSavingText
				? 'Сохранение...'
				: isTextDirty
					? 'Не сохранено'
					: showSaved
						? 'Сохранено'
						: null;

	const handleExport = async (): Promise<void> => {
		try {
			await cloudStore.saveTextAsFile();
			notifyStore.setNotice('Текст сохранён в облако', 'success');
		} catch (error) {
			notifyStore.setNotice(error instanceof Error ? error.message : 'Что-то пошло не так', 'error');
		}
	};

	useEffect(() => {
		if (isSavingText) {
			wasSaving.current = true;
			return;
		}

		if (!wasSaving.current) return;

		wasSaving.current = false;

		if (!isTextDirty && !textSaveError && !textConflict) setShowSaved(true);
	}, [isSavingText, isTextDirty, textSaveError, textConflict]);

	useEffect(() => {
		if (!showSaved) return;

		const timeout = window.setTimeout(() => setShowSaved(false), SAVED_STATUS_DURATION);

		return () => window.clearTimeout(timeout);
	}, [showSaved]);

	return (
		<>
			<Button
				centerIcon={<IconCloudPlus className="size-4" />}
				className="p-1"
				disabled={!cloudStore.text.trim() || cloudStore.isUploading}
				title="Сохранить TXT в облако"
				variant="iconSurface"
				onClick={() => void handleExport()}
			/>
			<Button
				centerIcon={<IconRefresh className={cn('size-4', cloudStore.isLoading && 'animate-spin')} />}
				className="p-1"
				disabled={cloudStore.isLoading || isTextDirty || isSavingText || !!textConflict}
				title="Обновить с сервера"
				variant="iconSurface"
				onClick={() => void cloudStore.refreshText()}
			/>
			{textConflict ? (
				<Button
					centerIcon={<IconAlertHexagon className="size-3.5 animate-pulse text-(--status-error)" />}
					className="p-1"
					title="Разрешить конфликт"
					variant="iconSurface"
					onClick={() => modalStore.setModal(<ConflictDialog />)}
				/>
			) : (
				saveStatus && (
					<span
						className={cn(
							'min-w-0 truncate text-xs',
							textSaveError ? 'text-(--status-error)' : 'text-(--text-secondary)'
						)}
						title={saveStatus}
					>
						{saveStatus}
					</span>
				)
			)}
		</>
	);
});
