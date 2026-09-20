import { IconAdjustmentsHorizontal, IconCategory, IconNotification } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { LoadingState } from '@/shared/ui';

import { SectionHeader } from './components';
import { AppearanceSection, LanguageSection, NotificationsSection, WidgetsSection } from './components/interface';

export const InterfaceTab = observer(() => {
	const { userProfileStore } = useStore();

	return (
		<div className="flex flex-col gap-4 divide-y divide-(--border-color) xl:divide-y-0">
			<div className="core-base flex flex-col gap-2 pb-4 md:p-4 md:shadow-(--shadow) xl:rounded-xl">
				<SectionHeader icon={IconCategory} title="Виджеты" />
				<WidgetsSection />
			</div>
			<div className="core-base flex flex-col gap-2 pb-4 md:p-4 md:shadow-(--shadow) xl:rounded-xl">
				<SectionHeader icon={IconAdjustmentsHorizontal} title="Внешний вид" />
				<AppearanceSection />
				<LanguageSection />
			</div>
			<div className="core-base flex flex-col gap-2 pb-4 md:p-4 md:shadow-(--shadow) xl:rounded-xl">
				<SectionHeader icon={IconNotification} title="Уведомления" />
				{!userProfileStore.isReady ? <LoadingState /> : <NotificationsSection />}
			</div>
		</div>
	);
});
