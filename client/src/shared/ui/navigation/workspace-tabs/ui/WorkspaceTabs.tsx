import { IconPlus } from '@tabler/icons-react';

import { cn } from '@/shared/lib/utils';
import { Button, ConfirmActions, Input } from '@/shared/ui';

import { TabActions } from './components';

interface WorkspaceTabsProps {
	items: { id: string; title: string }[];
	activeId?: string;
	onSelect: (id: string) => void;
	onCreate: () => void;
	onRename: (id: string) => void;
	onDelete: (id: string) => void;
	canCreate: boolean;
	canDelete: boolean;
	disabled?: boolean;
	label: string;
	editingId?: string;
	editValue: string;
	onEditChange: (value: string) => void;
	onEditConfirm: () => void;
	onEditCancel: () => void;
	maxTitleLength?: number;
	saving?: boolean;
	createLabel?: string;
}

export const WorkspaceTabs = ({
	items,
	activeId,
	onSelect,
	onCreate,
	onRename,
	onDelete,
	canCreate,
	canDelete,
	disabled = false,
	label,
	editingId,
	editValue,
	onEditChange,
	onEditConfirm,
	onEditCancel,
	maxTitleLength,
	saving = false,
	createLabel = 'Добавить',
}: WorkspaceTabsProps) => {
	const editDisabled = disabled || saving;

	const handleEditKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.nativeEvent.isComposing) return;

		if (event.key === 'Enter' || event.key === 'Escape') {
			event.preventDefault();
			event.stopPropagation();

			if (editDisabled) return;

			if (event.key === 'Enter') {
				if (editValue.trim()) onEditConfirm();
			} else {
				onEditCancel();
			}
		}
	};

	return (
		<nav aria-label={label} className="flex min-w-0 items-center gap-3 overflow-x-auto">
			{items.map((item) => {
				const active = activeId === item.id;
				const editing = editingId === item.id;

				return (
					<div
						key={item.id}
						className={cn(
							'core-tone group/tab flex h-8 max-w-60 min-w-24 shrink-0 items-center justify-between gap-2 rounded-lg px-3 py-1',
							active && 'bg-(--tone-strong)',
							editing && 'py-0 pr-1.5 pl-0'
						)}
					>
						{editing ? (
							<>
								<Input
									key={item.id}
									autoFocus
									aria-label={`Переименовать «${item.title}»`}
									className="min-w-0 bg-transparent py-1 pl-3 text-sm"
									disabled={editDisabled}
									maxLength={maxTitleLength}
									value={editValue}
									onChange={(event) => onEditChange(event.target.value)}
									onKeyDown={handleEditKeyDown}
								/>
								<ConfirmActions
									confirmDisabled={!editValue.trim()}
									confirmLabel="Сохранить"
									disabled={editDisabled}
									size="sm"
									onCancel={onEditCancel}
									onConfirm={onEditConfirm}
								/>
							</>
						) : (
							<>
								<Button
									active={active}
									aria-current={active ? 'page' : undefined}
									className={cn(
										'min-w-0 flex-1 justify-start truncate text-sm font-semibold',
										!active && 'text-(--text-secondary) group-hover/tab:text-(--text-primary)'
									)}
									disabled={disabled}
									padding="none"
									variant="custom"
									onClick={() => onSelect(item.id)}
								>
									{item.title}
								</Button>
								<TabActions
									canDelete={canDelete}
									className={cn(
										'transition-opacity',
										active
											? 'opacity-100'
											: 'opacity-100 xl:opacity-0 xl:group-focus-within/tab:opacity-100 xl:group-hover/tab:opacity-100'
									)}
									disabled={disabled}
									title={item.title}
									onDelete={() => onDelete(item.id)}
									onRename={() => onRename(item.id)}
								/>
							</>
						)}
					</div>
				);
			})}
			{canCreate && (
				<Button
					aria-label={createLabel}
					centerIcon={<IconPlus className="size-4 shrink-0" />}
					className="h-8 w-5.5 shrink-0 border border-dashed border-(--border-primary) hover:border-transparent hover:bg-(--accent-primary-hover) hover:text-(--text-on-accent)"
					disabled={disabled}
					padding="none"
					title={createLabel}
					variant="custom"
					onClick={onCreate}
				/>
			)}
		</nav>
	);
};
