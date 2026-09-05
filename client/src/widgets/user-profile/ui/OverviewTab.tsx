import { observer } from 'mobx-react-lite';

import { ContactsOverview, PersonalOverview, SecurityOverview } from './components/overview';

export const OverviewTab = observer(() => {
	return (
		<div className="flex flex-col gap-4">
			<PersonalOverview />
			<ContactsOverview />
			<SecurityOverview />
		</div>
	);
});
