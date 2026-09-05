import { IconBookFilled } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { useModalBack } from '@/shared/lib/hooks';
import { PreloaderMini } from '@/shared/ui';
import { MobileUserMenu } from '@/widgets/user-menu';

import { SectionHeader } from './components';
import { AdditionalEmails, LocationSection, PhonesSection, PrimaryEmail } from './components/contacts';

export const ContactsTab = observer(() => {
	const { userProfileStore } = useStore();

	useModalBack(<MobileUserMenu />);

	return (
		<div className="core-base flex cursor-default flex-col gap-4 rounded-xl pb-4 select-none md:p-4 md:shadow-(--shadow)">
			<SectionHeader icon={IconBookFilled} title="Контакты и адреса" />
			<div className="flex min-h-27.5 flex-col gap-2">
				<h2 className="mr-auto text-xl font-semibold">Местоположение</h2>
				{!userProfileStore.isLocationReady ? <PreloaderMini /> : <LocationSection />}
			</div>
			<div className="flex min-h-49 flex-col gap-2">
				<h2 className="mr-auto text-xl font-semibold">Почта</h2>
				{!userProfileStore.isReady ? (
					<PreloaderMini />
				) : (
					<>
						<PrimaryEmail />
						<AdditionalEmails />
					</>
				)}
			</div>
			<div className="flex min-h-40 flex-col gap-2">
				<h2 className="mr-auto text-xl font-semibold">Телефон</h2>
				{!userProfileStore.isReady ? <PreloaderMini /> : <PhonesSection />}
			</div>
		</div>
	);
});
