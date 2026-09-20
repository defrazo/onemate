import type { MonitoredService } from '../../../model';
import { ResourceCard } from '.';

interface ResourceListProps {
	resources: MonitoredService[];
	onOpen: (resource: MonitoredService) => void;
}

export const ResourceList = ({ resources, onOpen }: ResourceListProps) => {
	return (
		<div className="hide-scrollbar flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
			{resources.map((resource) => (
				<ResourceCard key={resource.id} resource={resource} onClick={() => onOpen(resource)} />
			))}
		</div>
	);
};
