import { useEffect, useRef, useState } from 'react';
import {
	IconCopy,
	IconExternalLink,
	IconEye,
	IconEyeOff,
	IconKey,
	IconLink,
	IconLockFilled,
	IconMessageFilled,
	IconPlus,
	IconUserFilled,
	IconWorldFilled,
} from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { useCopy, useOutsideClick } from '@/shared/lib/hooks';
import { BackButton, Button, ColorPicker, ConfirmDialog, Input, InputLabel, Textarea } from '@/shared/ui';

import { normalizeUrl } from '../../lib/utils';
import { FIELD_LIMITS } from '../../model/constants';

export const Editor = observer(() => {
	const copy = useCopy();

	const { credentialsStore: store, modalStore, notifyStore } = useStore();

	const [showPassword, setShowPassword] = useState(false);
	const [commentOpen, setCommentOpen] = useState(() => !!store.draft?.comment);

	const commentRef = useRef<HTMLTextAreaElement>(null);

	const ref = useOutsideClick<HTMLDivElement>(() => {
		if (!modalStore.modal && !store.error && !store.conflict) void store.closeEditor();
	}, '[data-widget]');

	const draft = store.draft;
	if (!draft) return null;

	const passwordTitle = showPassword ? 'Скрыть пароль' : 'Показать пароль на 60 секунд';

	const closeEditor = () => {
		if (store.isLoading || store.conflict) return;
		void store.closeEditor();
	};

	const removeAccount = () => {
		const id = store.editingId;
		if (!id) return;

		modalStore.setModal(
			<ConfirmDialog
				confirmLabel="Удалить"
				description="Это действие нельзя отменить"
				title="Удалить аккаунт?"
				variant="danger"
				onCancel={modalStore.closeModal}
				onConfirm={() => {
					if (store.isLoading) return;

					modalStore.closeModal();
					void store.closeEditor();
					void store.remove(id);
				}}
			/>
		);
	};

	const copyAll = () => {
		const text = [
			['Сервис', draft.service],
			['Логин', draft.login],
			['Пароль', draft.password],
			['URL', draft.url],
			['Комментарий', draft.comment],
		]
			.filter(([, value]) => value)
			.map(([label, value]) => `${label}: ${value}`)
			.join('\n');

		void copy(text, 'Аккаунт скопирован');
	};

	const openUrl = () => {
		try {
			const url = new URL(normalizeUrl(draft.url));
			if (!['http:', 'https:'].includes(url.protocol) || !url.hostname) throw new Error();

			window.open(url.href, '_blank', 'noopener,noreferrer');
		} catch {
			notifyStore.setNotice('Некорректный URL', 'error');
		}
	};

	useEffect(() => {
		if (commentOpen && !store.draft?.comment) commentRef.current?.focus();
	}, [commentOpen, store]);

	useEffect(() => {
		if (!showPassword) return;

		const timer = setTimeout(() => setShowPassword(false), 60_000);

		return () => clearTimeout(timer);
	}, [showPassword]);

	return (
		<div ref={ref} className="flex min-h-0 flex-1 flex-col gap-4">
			<div className="flex min-w-0 shrink-0 items-center justify-between gap-2">
				<BackButton title="Сохранить и вернуться к аккаунтам" onClick={closeEditor} />
				<div className="flex min-w-0 items-center gap-2">
					<ColorPicker
						color={draft.color}
						disabled={store.isLoading}
						size="sm"
						title="Цвет аккаунта"
						onChange={(color) => store.updateField('color', color)}
					/>
					<div className="flex items-center gap-1.5 rounded-md bg-(--accent-primary-muted) px-2 py-1 text-(--accent-primary)">
						<IconKey className="size-4 shrink-0" />
						<span className="trim text-sm text-(--accent-primary)">
							{store.editingId ? draft.service.trim() || 'Аккаунт' : 'Новый аккаунт'}
						</span>
					</div>
				</div>
			</div>
			<div className="flex min-h-0 flex-1 scrollbar-none flex-col gap-3 overflow-y-auto" inert={store.isLoading}>
				<Input
					autoFocus
					aria-label="Название сервиса"
					autoComplete="off"
					className="h-9 text-sm"
					id="service-name"
					leftIcon={
						<InputLabel className="border-(--border-tone)" htmlFor="service-name" icon={IconWorldFilled} />
					}
					maxLength={FIELD_LIMITS.service}
					placeholder="Название сервиса"
					value={draft.service}
					variant="toneStrong"
					onChange={(event) => store.updateField('service', event.target.value)}
				/>
				<Input
					aria-label="Логин"
					autoComplete="off"
					className="h-9 text-sm"
					id="login"
					leftIcon={<InputLabel className="border-(--border-tone)" htmlFor="login" icon={IconUserFilled} />}
					maxLength={FIELD_LIMITS.login}
					placeholder="Логин"
					value={draft.login}
					variant="toneStrong"
					onChange={(event) => store.updateField('login', event.target.value)}
				/>
				<Input
					aria-label="Пароль"
					autoComplete="new-password"
					className="h-9 text-sm"
					id="password"
					leftIcon={
						<InputLabel className="border-(--border-tone)" htmlFor="password" icon={IconLockFilled} />
					}
					maxLength={FIELD_LIMITS.password}
					placeholder="Пароль"
					rightIcon={
						<Button
							aria-label={passwordTitle}
							centerIcon={
								showPassword ? <IconEyeOff className="size-4" /> : <IconEye className="size-4" />
							}
							className="mr-0.5"
							disabled={!draft.password || store.isLoading}
							padding="none"
							title={passwordTitle}
							variant="icon"
							onClick={() => setShowPassword((value) => !value)}
						/>
					}
					type={showPassword ? 'text' : 'password'}
					value={draft.password}
					variant="toneStrong"
					onChange={(event) => store.updateField('password', event.target.value)}
				/>
				<Input
					aria-label="URL"
					autoComplete="off"
					className="h-9 text-sm"
					id="url"
					leftIcon={<InputLabel className="border-(--border-tone)" htmlFor="url" icon={IconLink} />}
					maxLength={FIELD_LIMITS.url}
					placeholder="https://"
					rightIcon={
						draft.url.trim() ? (
							<Button
								aria-label="Открыть ссылку"
								centerIcon={<IconExternalLink className="size-4" />}
								className="mr-0.5"
								padding="none"
								title="Открыть ссылку"
								variant="icon"
								onClick={openUrl}
							/>
						) : undefined
					}
					type="url"
					value={draft.url}
					variant="toneStrong"
					onChange={(event) => store.updateField('url', event.target.value)}
				/>
				{commentOpen ? (
					<Textarea
						ref={commentRef}
						autoResize
						aria-label="Комментарий"
						className="max-h-32 min-h-9 w-full overflow-y-auto pt-2 text-sm"
						id="comment"
						leftIcon={
							<InputLabel className="border-(--border-tone)" htmlFor="comment" icon={IconMessageFilled} />
						}
						maxLength={FIELD_LIMITS.comment}
						placeholder="Комментарий"
						rows={1}
						value={draft.comment}
						variant="toneStrong"
						onChange={(event) => store.updateField('comment', event.target.value)}
					/>
				) : (
					<Button
						className="h-6.5 shrink-0 justify-start rounded-md p-1 text-sm text-(--text-secondary) hover:text-(--accent-primary)"
						leftIcon={<IconPlus className="-mr-1 size-3.5" />}
						padding="none"
						variant="custom"
						onClick={() => setCommentOpen(true)}
					>
						<span className="trim">Добавить комментарий</span>
					</Button>
				)}
			</div>
			<div className="flex shrink-0 items-center justify-between gap-2">
				{store.editingId && (
					<Button
						className="h-7 text-xs"
						disabled={store.isLoading || store.conflict}
						variant="danger"
						onClick={removeAccount}
					>
						Удалить
					</Button>
				)}
				<div className="ml-auto flex items-center gap-2">
					<Button
						aria-label="Копировать всё"
						centerIcon={<IconCopy className="size-4" />}
						className="size-7"
						disabled={store.isLoading}
						padding="none"
						title="Копировать всё"
						variant="icon"
						onClick={copyAll}
					/>
					<Button className="h-7 text-xs" disabled={store.conflict} variant="accent" onClick={closeEditor}>
						Сохранить
					</Button>
				</div>
			</div>
		</div>
	);
});
