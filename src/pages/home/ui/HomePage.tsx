import { observer } from 'mobx-react-lite';

import { Stock } from '@/shared/assets/images';
import { SLIDER_CONTENT } from '@/shared/lib/constants';
import { notifyStore } from '@/shared/stores';
import { Slider } from '@/shared/ui';

const HomePage = () => {
	const check = () => {
		notifyStore.setSuccess(`Work Smarter Not Harder`);
		notifyStore.setError(`Work Smarter Not Harder`);
		notifyStore.setWarning(`Work Smarter Not Harder`);
		// appStore.setInfo(`Work Smarter Not Harder`);
	};
	return (
		<div className="grid w-full grid-cols-1 gap-4 select-none md:grid-cols-2">
			<div className="flex flex-col items-center justify-center">
				<h2 className="text-center text-5xl font-medium md:text-8xl" onClick={() => check()}>
					Work Smarter <br />
					Not Harder
				</h2>
				<div className="hidden md:block">
					<Slider slides={SLIDER_CONTENT} />
				</div>
			</div>
			<div className="flex w-full items-center justify-center">
				<img alt="stock" className="max-h-[60vh] w-auto object-contain" src={Stock} />
			</div>
		</div>
	);
};

export default observer(HomePage);
