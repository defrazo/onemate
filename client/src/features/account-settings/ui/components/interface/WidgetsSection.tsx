import { useState } from 'react';
import { IconInfoCircle, IconPlus } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { createDefaultDashboardLayout, type WidgetId, WIDGETS } from '@/shared/config';
import { useResponsive } from '@/shared/lib/hooks';
import { cn } from '@/shared/lib/utils';
import { Button, Collapse, ConfirmDialog, Select, Tooltip } from '@/shared/ui';

type WidgetDraft = { primary: WidgetId; secondary: WidgetId | '' };

const widgetOptions = WIDGETS.map(({ id, icon: Icon, title }) => ({
	value: id,
	label: title,
	icon: <Icon className="size-4 shrink-0 text-(--accent-primary)" />,
}));

const getDraft = (slot: readonly WidgetId[]): WidgetDraft => ({ primary: slot[0], secondary: slot[1] ?? '' });

const tip = <p>Дополнительным можно назначить только виджет, который не используется в качестве основного</p>;

export const WidgetsSection = observer(() => {
	const { isMobile } = useResponsive();

	const { modalStore, notifyStore, userProfileStore } = useStore();

	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
	const [lastSelectedIndex, setLastSelectedIndex] = useState(0);
	const [draft, setDraft] = useState<WidgetDraft | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	const layout = userProfileStore.widgets;
	const selectedSlot = layout[lastSelectedIndex];
	const currentDraft = draft ?? getDraft(selectedSlot);

	const primaryIds = new Set(layout.map((slot) => slot[0]));

	const secondaryOptions = [
		{ value: '', label: 'Не задан' },
		...widgetOptions.filter(({ value }) => !primaryIds.has(value) || value === currentDraft.secondary),
	];

	const isDirty = currentDraft.primary !== selectedSlot[0] || currentDraft.secondary !== (selectedSlot[1] ?? '');

	const handleSelectPosition = (index: number) => {
		if (isSaving) return;

		if (selectedIndex === index) {
			setSelectedIndex(null);
			return;
		}

		setLastSelectedIndex(index);
		setSelectedIndex(index);
		setDraft(getDraft(layout[index]));
	};

	const handlePrimaryChange = (value: string) => {
		const primary = value as WidgetId;

		setDraft((current) => {
			const next = current ?? getDraft(selectedSlot);
			return { primary, secondary: next.secondary === primary ? '' : next.secondary };
		});
	};

	const handleSecondaryChange = (value: string) => {
		setDraft((current) => ({ ...(current ?? getDraft(selectedSlot)), secondary: value as WidgetId | '' }));
	};

	const handleSave = async () => {
		if (!isDirty || isSaving) return;

		setIsSaving(true);

		try {
			await userProfileStore.setSlotWidgets(lastSelectedIndex, currentDraft.primary, currentDraft.secondary);

			notifyStore.setNotice('Виджеты сохранены', 'success');
		} catch {
			notifyStore.setNotice('Что-то пошло не так', 'error');
		} finally {
			setIsSaving(false);
		}
	};

	const resetLayout = () => {
		const close = () => (isMobile ? modalStore.goBack() : modalStore.closeModal());

		const dialog = (
			<ConfirmDialog
				confirmLabel="Восстановить"
				description="Будут восстановлены исходные шесть виджетов без дополнительных вкладок"
				title="Восстановить виджеты?"
				onCancel={close}
				onConfirm={async () => {
					try {
						await userProfileStore.updateWidgetSequence(createDefaultDashboardLayout());

						setSelectedIndex(null);
						setDraft(null);

						notifyStore.setNotice('Раскладка восстановлена', 'success');
					} catch {
						notifyStore.setNotice('Что-то пошло не так', 'error');
					} finally {
						close();
					}
				}}
			/>
		);

		isMobile ? modalStore.pushModal(dialog) : modalStore.setModal(dialog);
	};

	return (
		<section className="flex flex-col gap-2 select-none">
			<p className="text-sm text-(--text-secondary) opacity-70">
				Выберите позицию на схеме Dashboard, чтобы настроить её инструменты
			</p>
			<div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
				{layout.map((slot, idx) => {
					const primary = WIDGETS.find(({ id }) => id === slot[0]);
					const secondary = WIDGETS.find(({ id }) => id === slot[1]);
					const isSelected = selectedIndex === idx;

					return (
						<Button
							key={idx}
							aria-pressed={isSelected}
							className={cn(
								'group min-h-14 min-w-0 flex-col items-start gap-1.5 border px-2.5 py-2',
								isSelected
									? 'border-(--accent-primary)/50 bg-(--accent-primary-muted)'
									: 'border-(--border-contrast)/15 bg-(--tone-strong) hover:border-(--accent-primary)/30 hover:bg-(--tone-strong-hover)'
							)}
							disabled={isSaving}
							padding="none"
							variant="custom"
							onClick={() => handleSelectPosition(idx)}
						>
							<div className="flex min-w-0 items-center gap-2">
								{primary && <primary.icon className="size-4 shrink-0 text-(--accent-primary)" />}
								<span className="trim text-sm font-semibold">{primary?.title}</span>
							</div>
							{secondary ? (
								<div className="flex min-w-0 items-center gap-2">
									<secondary.icon className="size-4 shrink-0 text-(--accent-primary)" />
									<span className="trim text-sm text-(--text-secondary)">{secondary.title}</span>
								</div>
							) : isSelected ? (
								<div className="flex min-w-0 items-center gap-2">
									<IconPlus className="size-4 shrink-0 text-(--accent-primary)/70" />
									<span className="trim text-sm text-(--accent-primary)/70">Добавить виджет</span>
								</div>
							) : (
								<div className="flex min-w-0 items-center gap-2">
									<IconPlus className="size-4 shrink-0 text-(--text-secondary) transition-colors group-hover:text-(--accent-primary)/70" />
									<span className="trim text-sm text-(--accent-primary)/70 opacity-0 transition-opacity group-hover:opacity-100">
										Добавить виджет
									</span>
								</div>
							)}
						</Button>
					);
				})}
			</div>
			<Collapse className="-mt-2 min-w-0" open={selectedIndex !== null}>
				<div className="flex flex-col gap-3 border-t border-(--border-contrast)/15 pt-3">
					<div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
						<div className="flex min-w-0 flex-1 flex-col gap-1">
							<p className="text-sm text-(--text-secondary)">Основной виджет</p>
							<Select
								align="start"
								className="h-8"
								disabled={isSaving}
								options={widgetOptions}
								padding="sm"
								value={currentDraft.primary}
								variant="toneStrong"
								onChange={handlePrimaryChange}
							/>
						</div>
						<div className="flex min-w-0 flex-1 flex-col gap-1">
							<p className="text-sm text-(--text-secondary)">Дополнительный виджет</p>
							<Select
								align="start"
								className="h-8"
								disabled={isSaving}
								options={secondaryOptions}
								padding="sm"
								value={currentDraft.secondary}
								variant="toneStrong"
								onChange={handleSecondaryChange}
							/>
						</div>
						<Button
							className="h-8 max-w-35 flex-1 not-lg:ml-auto"
							disabled={!isDirty || isSaving}
							padding="sm"
							variant="accent"
							onClick={() => void handleSave()}
						>
							{isSaving ? 'Сохранение...' : 'Сохранить'}
						</Button>
					</div>
					<div className="flex items-center justify-between gap-3">
						<div className="flex items-center gap-1.5 text-(--text-tertiary)">
							<span className="text-xs">
								Выбрано {layout.reduce((count, slot) => count + slot.length, 0)} из {WIDGETS.length}{' '}
								инструментов
							</span>
							<Tooltip content={tip}>
								<IconInfoCircle className="hidden size-4 xl:block" />
							</Tooltip>
						</div>
						<Button
							className="text-xs text-(--text-tertiary) transition-colors hover:text-(--danger)"
							disabled={isSaving}
							padding="none"
							variant="custom"
							onClick={resetLayout}
						>
							По умолчанию
						</Button>
					</div>
				</div>
			</Collapse>
		</section>
	);
});
