import type { MonitoredService } from '../../../model';
import { Card } from '.';

interface ListProps {
	services: MonitoredService[];
	onOpen: (services: MonitoredService) => void;
}

export const List = ({ services, onOpen }: ListProps) => {
	return (
		<div className="hide-scrollbar flex max-h-[40svh] min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
			{services.map((services) => (
				<Card key={services.id} service={services} onClick={() => onOpen(services)} />
			))}
		</div>
	);
};
