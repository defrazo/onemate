import { Construction } from '@/shared/assets/images';
import { usePageTitle } from '@/shared/lib/hooks';

const TodoPage = () => {
	usePageTitle('To Do');

	return (
		<div className="flex size-full flex-col justify-evenly text-center">
			<h1 className="text-6xl">Страница в разработке</h1>
			<img alt="" className="max-h-[60vh] w-auto object-contain" src={Construction} />
		</div>
	);
};

export default TodoPage;
