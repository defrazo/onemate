import { IconMail, IconMapPin, IconPhone } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { Divider, LoadingState } from '@/shared/ui';

import { SectionHeader } from './components';
import { AdditionalEmails, LocationSection, PhonesSection, PrimaryEmail } from './components/contacts';

export const ContactsTab = observer(() => {
	const { userProfileStore } = useStore();

	return (
		<div className="core-gap flex flex-col">
			<div className="core-surface-contrast flex flex-col gap-2 bg-(--bg-secondary) md:p-3 md:shadow-(--shadow-contrast) xl:min-h-33">
				<SectionHeader icon={IconMapPin} title="Местоположение" />
				{!userProfileStore.isLocationReady ? <LoadingState /> : <LocationSection />}
			</div>
			<Divider className="mb-1 md:hidden" />
			<div className="core-surface-contrast flex flex-col gap-2 bg-(--bg-secondary) md:p-3 md:shadow-(--shadow-contrast) xl:min-h-59">
				<SectionHeader icon={IconMail} title="Почта" />
				{!userProfileStore.isReady ? (
					<LoadingState />
				) : (
					<>
						<PrimaryEmail />
						<AdditionalEmails />
					</>
				)}
			</div>
			<Divider className="mb-1 md:hidden" />
			<div className="core-surface-contrast flex flex-col gap-2 bg-(--bg-secondary) md:p-3 md:shadow-(--shadow-contrast) xl:min-h-10.5">
				<SectionHeader icon={IconPhone} title="Телефоны" />
				{!userProfileStore.isReady ? <LoadingState /> : <PhonesSection />}
			</div>
		</div>
	);
});
