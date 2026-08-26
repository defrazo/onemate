import type { Slide } from '../model';

interface SlideProps {
	slide: Slide;
}

export const SlideItem = ({ slide }: SlideProps) => {
	return (
		<div className="flex flex-col items-center gap-1.5 py-4 text-sm transition-transform duration-500 hover:scale-[1.3]">
			<div className="rounded-xl bg-(--accent-default)">
				<slide.image className="size-20 p-2 text-(--accent-text)" />
			</div>
			<span className="font-semibold">{slide.text}</span>
		</div>
	);
};
