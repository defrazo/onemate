import { IconMail, IconMapPin, IconPhone } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { Divider, LoadingError } from '@/shared/ui';

import { SectionHeader } from './components';
import { AdditionalEmails, LocationSection, PhonesSection, PrimaryEmail } from './components/contacts';

export const ContactsTab = observer(() => {
	const { userProfileStore } = useStore();

	return (
		<div className="core-gap flex flex-col">
			<div className="core-surface-contrast flex flex-col gap-2 bg-(--bg-secondary) md:p-3 md:shadow-(--shadow-contrast) xl:min-h-33">
				<SectionHeader icon={IconMapPin} title="Местоположение" />
				{!userProfileStore.isLocationReady ? (
					<LoadingError
						error={!!userProfileStore.loadError}
						message="Не удалось загрузить местоположение"
						onRetry={() => void userProfileStore.ensureLoaded().catch(() => {})}
					/>
				) : (
					<LocationSection />
				)}
			</div>
			<Divider className="mb-1 md:hidden" />
			<div className="core-surface-contrast flex flex-col gap-2 bg-(--bg-secondary) md:p-3 md:shadow-(--shadow-contrast) xl:min-h-52.5">
				<SectionHeader icon={IconMail} title="Почта" />
				{!userProfileStore.isReady ? (
					<LoadingError
						error={!!userProfileStore.loadError}
						message="Не удалось загрузить профиль"
						onRetry={() => void userProfileStore.ensureLoaded().catch(() => {})}
					/>
				) : (
					<>
						<PrimaryEmail />
						<AdditionalEmails />
					</>
				)}
			</div>
			<Divider className="mb-1 md:hidden" />
			<div className="core-surface-contrast flex flex-col gap-2 bg-(--bg-secondary) md:p-3 md:shadow-(--shadow-contrast)">
				<SectionHeader icon={IconPhone} title="Телефоны" />
				<PhonesSection />
			</div>
		</div>
	);
});
