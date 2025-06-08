import { cn } from '@/shared/lib/utils';

interface Slide {
	image: string;
	text: string;
}

interface SliderProps {
	slides: Slide[];
}

const Slider = ({ slides }: SliderProps) => {
	const doubledSlides = [...slides, ...slides];

	return (
		<div className="relative w-lg overflow-hidden">
			<div className="animate-slider flex w-max">
				{doubledSlides.map((slide, index) => (
					<div
						key={index}
						className={cn(
							'mx-2.5 flex w-20 flex-col items-center py-4 text-sm transition-transform duration-500 hover:scale-[1.3]'
						)}
					>
						<div className="mb-2 flex w-20 items-center justify-center rounded-lg bg-[#242426]">
							<img alt={slide.text} className="p-2" src={slide.image} />
						</div>
						<span>{slide.text}</span>
					</div>
				))}
			</div>
		</div>
	);
};

export default Slider;
