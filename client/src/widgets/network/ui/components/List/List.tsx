import type { MonitoredService } from '../../../model';
import { Card } from '.';

interface ListProps {
	services: MonitoredService[];
	onOpen: (services: MonitoredService) => void;
}

export const List = ({ services, onOpen }: ListProps) => {
	return (
		<div className="flex max-h-[55svh] min-h-0 flex-1 snap-y snap-mandatory scrollbar-none flex-col gap-2 overflow-y-auto md:gap-3">
			{services.map((services) => (
				<Card key={services.id} service={services} onClick={() => onOpen(services)} />
			))}
		</div>
	);
};
