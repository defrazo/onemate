import { Home } from '@/shared/assets/images';
import { usePageTitle } from '@/shared/lib/hooks';
import { Slider } from '@/shared/ui';

import { slides } from '../lib';

const HomePage = () => {
	usePageTitle('Главная');

	return (
		<div className="flex flex-1 flex-col justify-evenly select-none xl:flex-row xl:justify-between">
			<div className="flex flex-col items-center justify-center xl:flex-1 xl:gap-4">
				<h1 className="text-center text-[40px] leading-tight font-medium md:text-8xl">
					Work Smarter <br /> Not Harder
				</h1>
				<div className="hidden w-xl lg:block">
					<Slider slides={slides} />
				</div>
			</div>
			<div className="flex items-center justify-center xl:flex-1">
				<img
					alt="Иллюстрация: главная страница"
					className="no-touch-callout max-h-[45vh] md:max-h-[35vh] lg:max-h-[45vh] xl:max-h-[65vh]"
					src={Home}
					onContextMenu={(e) => e.preventDefault()}
				/>
			</div>
		</div>
	);
};

export default HomePage;
