import { Dashboard } from '@/features/dashboard';
import Calculator from '@/widgets/Calculator';
import Calendar from '@/widgets/Calendar';
import Currency from '@/widgets/Currency';
import Notes from '@/widgets/Notes';
import Translator from '@/widgets/Translator';
import Weather from '@/widgets/Weather';

const MainPage = () => {
	const widgets = [
		{ id: 'calculator', content: <Calculator /> },
		{ id: 'calendar', content: <Calendar /> },
		{ id: 'weather', content: <Weather /> },
		{ id: 'notes', content: <Notes /> },
		{ id: 'currency', content: <Currency /> },
		{ id: 'translator', content: <Translator /> },
	];

	return <Dashboard widgets={widgets} />;
};

export default MainPage;
