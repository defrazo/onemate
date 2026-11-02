import { useEffect, useRef, useState } from 'react';
import { IconCheck, IconPlus } from '@tabler/icons-react';

import { Button, Input } from '@/shared/ui';

interface AddItemProps {
	active: boolean;
	disabled?: boolean;
	limit?: number;
	limitReached?: boolean;
	maxLength?: number;
	showTrigger?: boolean;
	onActivate: () => void;
	onAdd: (text: string) => boolean | void | Promise<boolean | void>;
	onAdded?: () => void;
	onDeactivate: () => void;
}

export const AddItem = ({
	active,
	disabled = false,
	limit,
	limitReached = false,
	maxLength,
	showTrigger = true,
	onActivate,
	onAdd,
	onAdded,
	onDeactivate,
}: AddItemProps) => {
	const [text, setText] = useState('');
	const [submitting, setSubmitting] = useState(false);

	const inputRef = useRef<HTMLInputElement>(null);
	const activeRef = useRef(active);
	activeRef.current = active;

	const isDisabled = disabled || submitting;

	const handleAdd = async () => {
		const trimmed = text.trim();
		const value = trimmed.charAt(0).toLocaleUpperCase('ru-RU') + trimmed.slice(1);

		if (!value || isDisabled || limitReached) return;

		setSubmitting(true);

		try {
			const result = await onAdd(value);

			if (result !== false) {
				setText('');
				onAdded?.();
			}
		} finally {
			setSubmitting(false);
			if (activeRef.current) inputRef.current?.focus();
		}
	};

	useEffect(() => {
		if (active && !limitReached) inputRef.current?.focus();
	}, [active, limitReached]);

	if (limitReached) {
		return (
			<p className="text-xs text-(--text-disabled) select-none">
				{limit !== undefined ? `Максимум ${limit} пунктов` : 'Достигнут лимит пунктов'}
			</p>
		);
	}

	if (!active) {
		if (!showTrigger) return null;

		return (
			<Button
				className="h-6.5 rounded-md p-1 text-sm text-(--text-disabled) not-xl:min-h-7.5 hover:text-(--text-primary)"
				disabled={isDisabled}
				leftIcon={<IconPlus className="size-4 shrink-0" />}
				padding="none"
				variant="custom"
				onClick={onActivate}
			>
				<span className="trim">Добавить пункт</span>
			</Button>
		);
	}

	return (
		<form
			className="flex min-w-0 items-center gap-1"
			onSubmit={(event) => {
				event.preventDefault();
				void handleAdd();
			}}
		>
			<Input
				ref={inputRef}
				aria-label="Новый пункт"
				className="min-w-0 flex-1 py-0.5 text-sm"
				id="new-point"
				maxLength={maxLength}
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
						onDeactivate();
						setText('');
					}
				}}
			/>
		</form>
	);
};
