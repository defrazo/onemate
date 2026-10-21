import { observer } from 'mobx-react-lite';

import { ContactsOverview, PersonalOverview, SecurityOverview } from './components/overview';

export const OverviewTab = observer(() => {
	return (
		<div className="core-gap flex flex-col">
			<PersonalOverview />
			<ContactsOverview />
			<SecurityOverview />
		</div>
	);
});
