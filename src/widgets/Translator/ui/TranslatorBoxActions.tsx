import { IconClose, IconCopy } from '@/shared/assets/icons';
import { Button } from '@/shared/ui';

interface TranslatorBoxActionsProps {
	type?: string | undefined;
	disabled: boolean;
	onCopy: () => void;
	onClear?: () => void;
}

export const TranslatorBoxActions = ({ type, disabled, onClear, onCopy }: TranslatorBoxActionsProps) => {
	return (
		<div className="absolute top-0 flex w-full px-2 select-none">
			<div className="flex w-full justify-between border-b border-[var(--border-color)] py-2">
				<span className="text-sm leading-4 text-[var(--color-disabled)]">
					{type === 'source' ? 'Оригинал' : 'Перевод'}
				</span>
				<div className="flex justify-end gap-2">
					<Button
						centerIcon={<IconCopy className="size-4" />}
						className="bg-transparent opacity-20 transition hover:text-[var(--accent-hover)] hover:opacity-100"
						disabled={disabled}
						size="custom"
						title="Скопировать"
						variant="mobile"
						onClick={onCopy}
					/>
					{type === 'source' && (
						<Button
							centerIcon={<IconClose className="size-4" />}
							className="bg-transparent opacity-20 transition hover:text-[var(--status-error)] hover:opacity-100"
							disabled={disabled}
							size="custom"
							title="Очистить"
							variant="mobile"
							onClick={onClear}
						/>
					)}
				</div>
			</div>
		</div>
	);
};
