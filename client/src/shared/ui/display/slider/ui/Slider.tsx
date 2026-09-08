import type { Slide } from '../model';
import { SlideItem } from '.';

export const Slider = ({ slides }: { slides: Slide[] }) => {
	const doubledSlides = [...slides, ...slides];

	return (
		<div className="relative overflow-hidden">
			<div className="animate-slider flex w-max gap-4">
				{doubledSlides.map((slide, idx) => (
					<SlideItem key={`${slide.text}-${idx}`} slide={slide} />
				))}
			</div>
		</div>
	);
};
