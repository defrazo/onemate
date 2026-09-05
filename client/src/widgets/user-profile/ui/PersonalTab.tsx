import { IconUserFilled } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { useModalBack } from '@/shared/lib/hooks';
import { LoadFallback } from '@/shared/ui';
import { MobileUserMenu } from '@/widgets/user-menu';

import { SectionHeader } from './components';
import { AvatarSection, PersonalDataSection } from './components/personal';

export const PersonalTab = observer(() => {
	const { userProfileStore } = useStore();

	useModalBack(<MobileUserMenu />);

	return (
		<div className="core-base flex cursor-default flex-col gap-4 rounded-xl pb-4 select-none md:p-4 md:shadow-(--shadow)">
			<SectionHeader icon={IconUserFilled} title="Личные данные" />
			<div className="flex flex-col gap-4 md:flex-row">
				{!userProfileStore.isReady ? (
					<div className="min-h-103 w-full">
						<LoadFallback />
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
