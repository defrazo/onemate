import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';

import { LoadingState } from '@/shared/ui';

import { NetworkStore } from '../model/network.store';
import {
	AddResource,
	MonitoringEmpty,
	ResourceDetails,
	ResourceList,
	ResourceSettings,
	Tools,
	ViewSwitch,
} from './components';

type NetworkView = 'monitoring' | 'tools';

export const Network = observer(() => {
	const [networkStore] = useState(() => new NetworkStore());
	const [view, setView] = useState<NetworkView>('monitoring');
	const [activeResourceId, setActiveResourceId] = useState<number | null>(null);
	const [isAddingResource, setIsAddingResource] = useState(false);
	const [isResourceSettingsOpen, setIsResourceSettingsOpen] = useState(false);

	const activeResource =
		activeResourceId !== null
			? (networkStore.services.find((resource) => resource.id === activeResourceId) ?? null)
			: null;

	useEffect(() => {
		void networkStore.loadServices();
	}, [networkStore]);

	if (isAddingResource) {
		return (
			<AddResource
				store={networkStore}
				onBack={() => setIsAddingResource(false)}
				onCreated={() => {
					setIsAddingResource(false);
					setView('monitoring');
				}}
			/>
		);
	}

	if (activeResource) {
		if (isResourceSettingsOpen) {
			return (
				<ResourceSettings
					resource={activeResource}
					store={networkStore}
					onBack={() => setIsResourceSettingsOpen(false)}
					onDeleted={() => {
						setIsResourceSettingsOpen(false);
						setActiveResourceId(null);
					}}
				/>
			);
		}

		return (
			<ResourceDetails
				resource={activeResource}
				store={networkStore}
				onBack={() => setActiveResourceId(null)}
				onSettings={() => setIsResourceSettingsOpen(true)}
			/>
		);
	}

	return (
		<div className="flex max-h-[40svh] min-h-0 flex-col gap-2 overflow-hidden xl:h-full">
			{view === 'monitoring' ? (
				networkStore.isLoading ? (
					<LoadingState />
				) : networkStore.services.length > 0 ? (
					<ResourceList
						resources={networkStore.services}
						onOpen={(resource) => setActiveResourceId(resource.id)}
					/>
				) : (
					<MonitoringEmpty onAdd={() => setIsAddingResource(true)} />
				)
			) : (
				<Tools onAddResource={() => setIsAddingResource(true)} />
			)}

			<ViewSwitch view={view} onChange={setView} />
		</div>
	);
});
