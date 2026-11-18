import { IconUser } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { LoadingError } from '@/shared/ui';

import { SectionHeader } from './components';
import { AvatarSection, PersonalDataSection } from './components/personal';

export const PersonalTab = observer(() => {
	const { userProfileStore } = useStore();

	return (
		<div className="core-surface-contrast core-gap flex cursor-default flex-col bg-(--bg-secondary) select-none md:p-3 md:shadow-(--shadow-contrast)">
			<SectionHeader icon={IconUser} title="Личные данные" />
			<div className="core-gap flex flex-col md:flex-row">
				{!userProfileStore.isReady ? (
					<div className="min-h-103 w-full">
						<LoadingError
							error={!!userProfileStore.loadError}
							message="Не удалось загрузить профиль"
							size="lg"
							onRetry={() => void userProfileStore.ensureLoaded().catch(() => {})}
						/>
					</div>
				) : (
					<>
						<AvatarSection />
						<PersonalDataSection />
					</>
				)}
			</div>
		</div>
	);
});
