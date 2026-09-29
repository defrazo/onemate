import type { City } from '@/entities/city';

interface SuggestionsProps {
	cities: City[];
	onSelect: (city: City) => void | Promise<void>;
}

export const Suggestions = ({ cities, onSelect }: SuggestionsProps) => {
	if (cities.length === 0) return null;

	return (
		<div className="hide-scrollbar absolute top-full left-0 z-30 mt-1.5 max-h-72 w-full overflow-y-auto rounded-xl border border-(--border-color) bg-(--bg-secondary) p-1 shadow-[0_12px_32px_rgba(0,0,0,0.35)]">
			{cities.map((city) => (
				<div
					key={`${city.lat}-${city.lon}`}
					className="cursor-pointer rounded-lg px-3 py-1 transition-colors hover:bg-white/6"
					onPointerDown={() => void onSelect(city)}
				>
					<div className="flex flex-col">
						<span className="font-bold">{city.name}</span>
						<div className="flex items-center gap-2 text-sm text-(--color-secondary) opacity-60">
							<span className="truncate">{city.region || 'Регион не указан'}</span>
							<div className="flex h-5 items-center rounded-md bg-(--accent-default)/12 px-1.5 text-[10px] font-bold text-(--accent-default)">
								<span className="trim">{city.country}</span>
							</div>
						</div>
					</div>
				</div>
			))}
		</div>
	);
};
