import { Fragment, type KeyboardEvent } from 'react';
import { IconPlus } from '@tabler/icons-react';

import { cn } from '@/shared/lib/utils';
import { Button, ConfirmActions, Input } from '@/shared/ui';

import { TabActions } from './components';

interface WorkspaceTabsProps {
	items: { id: string; title: string }[];
	activeId?: string;
	editingId?: string;
	editValue: string;
	label: string;
	canCreate: boolean;
	canDelete: boolean;
	disabled?: boolean;
	saving?: boolean;
	maxTitleLength?: number;
	maxItems: number;
	createLabel?: string;
	onSelect: (id: string) => void;
	onCreate: () => void;
	onRename: (id: string) => void;
	onDelete: (id: string) => void;
	onEditChange: (value: string) => void;
	onEditConfirm: () => void;
	onEditCancel: () => void;
}

export const WorkspaceTabs = ({
	items,
	activeId,
	editingId,
	editValue,
	label,
	canCreate,
	canDelete,
	disabled = false,
	saving = false,
	maxTitleLength,
	maxItems,
	createLabel = 'Добавить',
	onSelect,
	onCreate,
	onRename,
	onDelete,
	onEditChange,
	onEditConfirm,
	onEditCancel,
}: WorkspaceTabsProps) => {
	const editDisabled = disabled || saving;

	const handleEditKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
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
		<nav aria-label={label} className="flex h-10 min-w-0 scrollbar-none items-center gap-3 overflow-x-auto">
			{items.map(({ id, title }, idx) => {
				const active = activeId === id;
				const editing = editingId === id;

				return (
					<Fragment key={id}>
						<div
							key={id}
							className={cn(
								'group/tab relative ml-1 flex h-8 max-w-60 shrink-0 items-center gap-2',
								active && 'text-(--text-primary)',
								!active && 'text-(--text-secondary) hover:text-(--text-primary)',
								editing && 'pr-1.5 pl-0'
							)}
						>
							{editing ? (
								<>
									<Input
										key={id}
										autoFocus
										aria-label={`Переименовать «${title}»`}
										className="min-w-0 py-1 pl-3 text-sm"
										disabled={editDisabled}
										id={`Переименовать «${title}»`}
										maxLength={maxTitleLength}
										value={editValue}
										onChange={(event) => onEditChange(event.target.value)}
										onKeyDown={handleEditKeyDown}
									/>
									<ConfirmActions
										confirmDisabled={!editValue.trim()}
										confirmLabel="Сохранить"
										disabled={editDisabled}
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
											active ? 'text-(--text-primary)' : 'text-(--text-secondary)'
										)}
										disabled={disabled}
										padding="none"
										variant="custom"
										onClick={() => onSelect(id)}
									>
										{title}
									</Button>
									<TabActions
										canDelete={canDelete}
										className={cn(
											'transition-opacity',
											active
												? 'opacity-70 group-hover/tab:opacity-100'
												: 'opacity-35 group-hover/tab:opacity-100'
										)}
										disabled={disabled}
										title={title}
										onDelete={() => onDelete(id)}
										onRename={() => onRename(id)}
									/>
								</>
							)}
							{active && !editing && (
								<span
									aria-hidden="true"
									className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-(--accent-primary)"
								/>
							)}
						</div>
						{idx < maxItems - 1 && <div className="h-5 w-px shrink-0 bg-(--border-tone)/70" />}
					</Fragment>
				);
			})}
			{canCreate && (
				<Button
					aria-label={createLabel}
					centerIcon={<IconPlus className="size-4" />}
					className="size-6 shrink-0 rounded-lg bg-(--tone) text-(--text-secondary) hover:bg-(--tone-strong) hover:text-(--text-primary)"
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
