import type { Slide } from '../model';
import { SlideItem } from '.';

interface SliderProps {
	slides: Slide[];
}

const Slider = ({ slides }: SliderProps) => {
	const doubledSlides = [...slides, ...slides];

	return (
		<div className="relative overflow-hidden">
			<div className="animate-slider flex w-max gap-4">
				{doubledSlides.map((slide) => (
					<SlideItem key={slide.text} slide={slide} />
				))}
			</div>
		</div>
	);
};

export default Slider;
