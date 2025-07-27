import { Stock } from '@/shared/assets/images';
import { SLIDES } from '@/shared/lib/constants';
import { Slider } from '@/shared/ui';

const HomePage = () => {
	return (
		<div className="grid w-full grid-cols-1 gap-4 select-none md:grid-cols-2">
			<div className="flex flex-col items-center justify-center gap-4">
				<h1 className="text-center text-5xl font-medium md:text-8xl">
					Work Smarter <br />
					Not Harder
				</h1>
				<div className="hidden w-xl md:block">
					<Slider slides={SLIDES} />
				</div>
			</div>

			<img alt="" className="self-center" src={Stock} />
		</div>
	);
};

export default HomePage;
