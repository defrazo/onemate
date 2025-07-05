import { IconClose, IconCopy } from '@/shared/assets/icons';
import { Button } from '@/shared/ui';

interface TranslatorBoxActionsProps {
	type?: string | undefined;
	disabled: boolean;
	onCopy: () => void;
	onClear: () => void;
}

export const TranslatorBoxActions = ({ type, disabled, onClear, onCopy }: TranslatorBoxActionsProps) => {
	return (
		<div className="absolute top-0 flex w-full justify-between px-2 pt-2 select-none">
			<span className="text-[var(--color-disabled)]">{type === 'source' ? 'Оригинал' : 'Перевод'}</span>
			<div className="flex justify-end gap-2">
				<Button
					centerIcon={<IconCopy className="size-5" />}
					className="opacity-20 transition hover:text-[var(--accent-hover)] hover:opacity-100"
					disabled={disabled}
					size="custom"
					title="Скопировать"
					variant="mobile"
					onClick={onCopy}
				/>
				<Button
					centerIcon={<IconClose className="size-5" />}
					className="opacity-20 transition hover:text-[var(--status-error)] hover:opacity-100"
					disabled={disabled}
					size="custom"
					title="Очистить"
					variant="mobile"
					onClick={onClear}
				/>
			</div>
		</div>
	);
};
