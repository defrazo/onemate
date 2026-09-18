import { IconPlus } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { type WidgetId, WIDGETS } from '@/shared/config';
import { Button } from '@/shared/ui';

import { ReplaceWidgetDialog } from '.';

export const WidgetsSection = observer(() => {
	const { modalStore, notifyStore, userProfileStore } = useStore();

	const selectedWidgets = userProfileStore.widgets;

	const activeWidgets = WIDGETS.filter(({ id }) => selectedWidgets.includes(id));
	const availableWidgets = WIDGETS.filter(({ id }) => !selectedWidgets.includes(id));

	const replaceWidget = async (replacedId: WidgetId, targetId: WidgetId): Promise<void> => {
		try {
			await userProfileStore.replaceWidget(replacedId, targetId);

			modalStore.closeModal();
			notifyStore.setNotice('Виджет успешно заменён', 'success');
		} catch {
			notifyStore.setNotice('Не удалось заменить виджет', 'error');
		}
	};

	const changeWidget = (targetId: WidgetId) => {
		modalStore.setModal(
			<ReplaceWidgetDialog
				selected={selectedWidgets}
				target={targetId}
				onCancel={() => modalStore.closeModal()}
				onReplace={(replacedId) => void replaceWidget(replacedId, targetId)}
			/>
		);
	};

	return (
		<section className="flex flex-col gap-3 select-none">
			<p className="text-sm text-(--color-secondary) opacity-70 xl:text-base">
				Выберите, какие виджеты отображать в Dashboard
			</p>
			<div className="flex flex-col gap-1">
				<p className="text-xs text-(--color-secondary)">Текущие</p>
				<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
					{activeWidgets.map(({ id, title, icon: Icon }) => (
						<div
							key={id}
							className="flex h-10 items-center gap-2 rounded-xl bg-(--bg-tertiary) px-3 text-sm"
						>
							<Icon className="size-5 text-(--accent-default)" />
							<span className="trim">{title}</span>
						</div>
					))}
				</div>
			</div>
			{availableWidgets.length > 0 && (
				<div className="flex flex-col gap-1">
					<p className="text-xs text-(--color-secondary)">Доступные</p>
					<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
						{availableWidgets.map(({ id, title, icon: Icon }) => (
							<Button
								key={id}
								className="h-10 rounded-xl bg-(--bg-tertiary) px-3 text-sm hover:border-(--accent-default)/30 hover:bg-(--accent-default)/10 hover:text-(--accent-default)"
								leftIcon={<Icon className="size-4 text-(--accent-default)" />}
								rightIcon={<IconPlus className="size-4" />}
								size="custom"
								title={title}
								type="button"
								variant="custom"
								onClick={() => changeWidget(id)}
							>
								<span className="trim mr-auto">{title}</span>
							</Button>
						))}
					</div>
				</div>
			)}
		</section>
	);
});
