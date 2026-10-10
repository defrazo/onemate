import { Calendar, Currency, Network, Notes, Translator, Weather } from '.';

export const Workspace = () => (
	<div
		className="pointer-events-none absolute -bottom-45 left-1/2 z-10 w-full -translate-x-1/2 md:bottom-0 lg:max-w-5xl xl:-bottom-20 2xl:bottom-0 md:landscape:-bottom-20 xl:landscape:-bottom-20"
		style={{
			maskImage:
				'linear-gradient(to bottom, black 0%, black 24%, rgba(0, 0, 0, 0.8) 48%, rgba(0, 0, 0, 0.35) 72%, transparent 100%)',
			WebkitMaskImage:
				'linear-gradient(to bottom, black 0%, black 24%, rgba(0, 0, 0, 0.8) 48%, rgba(0, 0, 0, 0.35) 72%, transparent 100%)',
		}}
	>
		<div className="relative overflow-hidden rounded-xl border border-(--tone-strong) bg-(--bg-secondary)/95 opacity-75 shadow-2xl shadow-black/30">
			<div className="pointer-events-none absolute inset-0 bg-violet-500/2" />
			<div className="relative flex h-10 items-center border-b border-(--tone-strong-hover)">
				<div className="mx-auto flex items-center gap-5 text-[10px] text-(--text-tertiary)">
					<span className="font-bold text-(--accent-primary)/70">Dashboard</span>
					<span>ToDo</span>
					<span>Kanban</span>
					<span>ToolBox</span>
				</div>
			</div>
			<div className="grid grid-cols-3 gap-3 p-3">
				<Network />
				<Calendar />
				<Notes />
				<Currency />
				<Weather />
				<Translator />
			</div>
			<div className="pointer-events-none absolute inset-x-0 top-10 h-20 bg-linear-to-b from-(--tone) to-transparent" />
		</div>
	</div>
);
