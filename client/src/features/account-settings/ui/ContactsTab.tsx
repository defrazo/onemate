import { IconMail, IconMapPin, IconPhone } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { LoadingState } from '@/shared/ui';

import { SectionHeader } from './components';
import { AdditionalEmails, LocationSection, PhonesSection, PrimaryEmail } from './components/contacts';

export const ContactsTab = observer(() => {
	const { userProfileStore } = useStore();

	return (
		<div className="flex flex-col gap-4 divide-y divide-(--border-color) xl:divide-y-0">
			<div className="core-base flex flex-col gap-2 pb-4 md:p-4 md:shadow-(--shadow) xl:min-h-37.5 xl:rounded-xl">
				<SectionHeader icon={IconMapPin} title="Местоположение" />
				{!userProfileStore.isLocationReady ? <LoadingState /> : <LocationSection />}
			</div>
			<div className="core-base flex flex-col gap-2 pb-4 md:p-4 md:shadow-(--shadow) xl:min-h-59 xl:rounded-xl">
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
			<div className="core-base flex flex-col gap-2 pb-4 md:p-4 md:shadow-(--shadow) xl:min-h-43 xl:rounded-xl">
				<SectionHeader icon={IconPhone} title="Телефоны" />
				{!userProfileStore.isReady ? <LoadingState /> : <PhonesSection />}
			</div>
		</div>
	);
});
