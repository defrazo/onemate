import { useEffect, useRef, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconCopy, IconEye, IconEyeOff, IconGripHorizontal } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { COLOR_PALETTE } from '@/shared/config';
import { useCopy } from '@/shared/lib/hooks';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

import type { Credential } from '../../model/types';

interface CardProps {
	entry: Credential;
	disabled: boolean;
	sortingDisabled: boolean;
}

const ACTION_CLASS =
	'opacity-0 transition-[color,opacity] group-hover/credential:opacity-100 group-focus-within/credential:opacity-100 [@media(hover:none)]:opacity-100';

export const Card = observer(({ entry, disabled, sortingDisabled }: CardProps) => {
	const copy = useCopy();

	const { credentialsStore: store, notifyStore } = useStore();

	const [password, setPassword] = useState<string | null>(null);
	const [requesting, setRequesting] = useState(false);

	const request = useRef(0);
	const dragged = useRef(false);
	const disabledRef = useRef(disabled);

	disabledRef.current = disabled;

	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: entry.id,
		disabled: sortingDisabled,
	});

	const openAccount = () => {
		if (disabled || isDragging || dragged.current) return;

		request.current++;
		setPassword(null);
		setRequesting(false);

		void store.openAccount(entry.id);
	};

	const getPassword = async (reveal: boolean): Promise<void> => {
		if (disabled || requesting) return;

		if (reveal && password !== null) {
			request.current++;
			setPassword(null);
			return;
		}

		const version = ++request.current;

		setRequesting(true);

		try {
			const secret = await store.readPassword(entry.id);

			if (version !== request.current || disabledRef.current || store.isLoading || store.conflict) return;

			if (reveal) setPassword(secret);
			else await copy(secret, 'Пароль скопирован');
		} catch {
			if (version === request.current && !disabledRef.current)
				notifyStore.setNotice('Что-то пошло не так', 'error');
		} finally {
			if (version === request.current) setRequesting(false);
		}
	};

	useEffect(() => {
		const currentRequest = request;

		return () => {
			currentRequest.current++;
		};
	}, []);

	useEffect(() => {
		if (!disabled) return;

		request.current++;
		setPassword(null);
		setRequesting(false);
	}, [disabled]);

	useEffect(() => {
		if (isDragging) {
			dragged.current = true;
			return;
		}

		const timer = setTimeout(() => (dragged.current = false), 0);

		return () => clearTimeout(timer);
	}, [isDragging]);

	useEffect(() => {
		if (password === null) return;

		const timer = setTimeout(() => setPassword(null), 60_000);

		return () => clearTimeout(timer);
	}, [password]);

	return (
		<div
			ref={setNodeRef}
			className="core-tone group/credential flex shrink-0 cursor-pointer rounded-lg border border-(--border-contrast)/15 py-2 pl-2"
			style={{ transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 0 }}
			onClick={(event) => {
				if (!(event.target as Element).closest('button')) openAccount();
			}}
		>
			<Button
				className="min-w-0 flex-1 flex-col items-start gap-1 text-sm"
				disabled={disabled}
				padding="none"
				tabIndex={-1}
				variant="custom"
				onClick={(event) => {
					event.stopPropagation();
					openAccount();
				}}
			>
				<span className="mb-1 max-w-full min-w-0 truncate font-bold">{entry.service}</span>
				<span
					className={cn(
						'h-6 max-w-full min-w-0 truncate leading-7',
						entry.login ? 'text-(--text-secondary)' : 'text-(--text-disabled)'
					)}
				>
					{entry.login || '—'}
				</span>
				<span
					className={cn(
						'-mt-1 h-6 truncate leading-6',
						entry.has_password ? 'text-(--text-secondary)' : 'text-(--text-disabled)'
					)}
				>
					{entry.has_password ? (password ?? '••••••••••••') : '—'}
				</span>
			</Button>
			<div className="flex w-14 shrink-0 flex-col items-end justify-between px-2">
				<div className="relative flex size-5 items-center justify-center">
					<span
						aria-hidden="true"
						className={cn(
							'h-1 w-3 rounded-full transition-opacity',
							!sortingDisabled &&
								'group-focus-within/credential:opacity-0 group-hover/credential:opacity-0 [@media(hover:none)]:opacity-0',
							isDragging && 'opacity-0'
						)}
						style={{ backgroundColor: COLOR_PALETTE[entry.color].value }}
					/>
					{!sortingDisabled && (
						<Button
							centerIcon={<IconGripHorizontal className="size-4" />}
							className={cn(
								'absolute cursor-grab touch-none active:cursor-grabbing',
								ACTION_CLASS,
								isDragging && 'opacity-100'
							)}
							padding="none"
							title="Переместить"
							variant="icon"
							{...attributes}
							{...listeners}
							onClick={(event) => event.stopPropagation()}
						/>
					)}
				</div>
				<div className="flex h-5 items-center">
					{entry.login && (
						<Button
							centerIcon={<IconCopy className="size-4" />}
							className={ACTION_CLASS}
							disabled={disabled}
							padding="none"
							title="Копировать логин"
							variant="icon"
							onClick={(event) => {
								event.stopPropagation();
								void copy(entry.login, 'Логин скопирован');
							}}
						/>
					)}
				</div>
				<div className="flex h-5 items-center gap-3">
					{entry.has_password && (
						<>
							<Button
								centerIcon={
									password === null ? (
										<IconEye className="size-4" />
									) : (
										<IconEyeOff className="size-4" />
									)
								}
								className={ACTION_CLASS}
								disabled={disabled || requesting}
								padding="none"
								title={password === null ? 'Показать пароль на 60 секунд' : 'Скрыть пароль'}
								variant="icon"
								onClick={(event) => {
									event.stopPropagation();
									void getPassword(true);
								}}
							/>
							<Button
								centerIcon={<IconCopy className="size-4" />}
								className={ACTION_CLASS}
								disabled={disabled || requesting}
								padding="none"
								title="Копировать пароль"
								variant="icon"
								onClick={(event) => {
									event.stopPropagation();
									void getPassword(false);
								}}
							/>
						</>
					)}
				</div>
			</div>
		</div>
	);
});
