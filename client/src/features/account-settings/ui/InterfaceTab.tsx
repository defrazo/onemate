import { IconAdjustmentsHorizontal, IconCategory, IconNotification } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { Divider, LoadingState } from '@/shared/ui';

import { SectionHeader } from './components';
import { AppearanceSection, LanguageSection, NotificationsSection, WidgetsSection } from './components/interface';

export const InterfaceTab = observer(() => {
	const { userProfileStore } = useStore();

	return (
		<div className="core-gap flex flex-col">
			<div className="core-surface-contrast flex flex-col gap-2 bg-(--bg-secondary) md:p-3 md:shadow-(--shadow-contrast)">
				<SectionHeader icon={IconCategory} title="Виджеты" />
				<WidgetsSection />
			</div>
			<Divider className="mb-1 md:hidden" />
			<div className="core-surface-contrast flex flex-col gap-2 bg-(--bg-secondary) md:p-3 md:shadow-(--shadow-contrast)">
				<SectionHeader icon={IconAdjustmentsHorizontal} title="Внешний вид" />
				<AppearanceSection />
				<LanguageSection />
			</div>
			<Divider className="mb-1 md:hidden" />
			<div className="core-surface-contrast flex flex-col gap-2 bg-(--bg-secondary) md:p-3 md:shadow-(--shadow-contrast)">
				<SectionHeader icon={IconNotification} title="Уведомления" />
				{!userProfileStore.isReady ? <LoadingState /> : <NotificationsSection />}
			</div>
		</div>
	);
});
