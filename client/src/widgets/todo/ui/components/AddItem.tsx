import { useEffect, useRef, useState } from 'react';
import { IconCheck, IconPlus } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { TODO_LIMITS, type TodoList } from '@/entities/todo';
import { Button, Input } from '@/shared/ui';

export const AddItem = observer(({ list, onAdded }: { list: TodoList; onAdded?: () => void }) => {
	const { todoStore } = useStore();

	const [adding, setAdding] = useState(false);
	const [text, setText] = useState('');
	const [submitting, setSubmitting] = useState(false);

	const containerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const limitReached = list.items.length >= TODO_LIMITS.ITEMS;
	const isDisabled = todoStore.isLoading || submitting;

	const handleAdd = async () => {
		const trimmed = text.trim();
		const value = trimmed.charAt(0).toLocaleUpperCase('ru-RU') + trimmed.slice(1);

		if (!value || isDisabled || limitReached) return;

		setSubmitting(true);

		try {
			const success = await todoStore.createItem(list.id, value);

			if (success) {
				setText('');
				onAdded?.();
			}
		} finally {
			setSubmitting(false);
			inputRef.current?.focus();
		}
	};

	const handleClose = (): void => {
		setAdding(false);
		setText('');
	};

	const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>): void => {
		event.preventDefault();
		void handleAdd();
	};

	useEffect(() => {
		if (adding && !limitReached) inputRef.current?.focus();
	}, [adding, limitReached]);

	useEffect(() => {
		if (!adding || submitting) return;

		const handlePointerDown = (event: PointerEvent): void => {
			if (containerRef.current?.contains(event.target as Node)) return;
			handleClose();
		};

		document.addEventListener('pointerdown', handlePointerDown);

		return () => {
			document.removeEventListener('pointerdown', handlePointerDown);
		};
	}, [adding, submitting]);

	if (limitReached)
		return <p className="shrink-0 text-xs text-(--text-disabled)">Максимум {TODO_LIMITS.ITEMS} пунктов</p>;

	if (!adding) {
		return (
			<Button
				className="h-6.5 justify-start rounded-md p-1 text-sm text-(--text-disabled) not-xl:min-h-7.5 hover:text-(--text-primary)"
				disabled={isDisabled}
				leftIcon={<IconPlus className="size-4 shrink-0" />}
				padding="none"
				variant="custom"
				onClick={() => setAdding(true)}
			>
				<span className="trim">Добавить пункт</span>
			</Button>
		);
	}

	return (
		<div ref={containerRef} className="shrink-0">
			<form className="flex min-w-0 shrink-0 items-center gap-1" onSubmit={handleSubmit}>
				<Input
					ref={inputRef}
					aria-label="Новый пункт"
					className="min-w-0 flex-1 py-0.5 text-sm"
					id="new-point"
					maxLength={TODO_LIMITS.ITEM_TEXT}
					placeholder="Добавить пункт…"
					readOnly={isDisabled}
					rightIcon={
						text.trim() && (
							<Button
								aria-label="Добавить пункт"
								centerIcon={<IconCheck className="size-4" />}
								disabled={isDisabled || !text.trim()}
								padding="none"
								title="Добавить пункт"
								type="submit"
								variant="icon"
							/>
						)
					}
					value={text}
					onChange={(event) => setText(event.target.value)}
					onKeyDown={(event) => {
						if (event.key === 'Enter' && event.nativeEvent.isComposing) event.preventDefault();

						if (event.key === 'Escape') {
							event.preventDefault();
							handleClose();
						}
					}}
				/>
			</form>
		</div>
	);
});
