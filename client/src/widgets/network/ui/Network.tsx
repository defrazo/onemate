import { useState } from 'react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { LoadingState } from '@/shared/ui';

import type { NetworkView } from '../model';
import { AddService, Details, Empty, List, Settings, Tools, ViewSwitch } from './components';

export const Network = observer(() => {
	const { networkStore } = useStore();

	const [view, setView] = useState<NetworkView>('monitoring');
	const [activeId, setActiveId] = useState<number | null>(null);
	const [isAdding, setIsAdding] = useState(false);
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);

	const activeService =
		activeId !== null ? (networkStore.services.find((service) => service.id === activeId) ?? null) : null;

	if (isAdding) {
		return (
			<AddService
				onBack={() => setIsAdding(false)}
				onCreated={() => {
					setIsAdding(false);
					setView('monitoring');
				}}
			/>
		);
	}

	if (activeService) {
		if (isSettingsOpen) {
			return (
				<Settings
					service={activeService}
					onBack={() => setIsSettingsOpen(false)}
					onDeleted={() => {
						setIsSettingsOpen(false);
						setActiveId(null);
					}}
				/>
			);
		}

		return (
			<Details
				service={activeService}
				onBack={() => setActiveId(null)}
				onSettings={() => setIsSettingsOpen(true)}
			/>
		);
	}

	const renderContent = () => {
		if (view === 'tools') return <Tools onAddService={() => setIsAdding(true)} />;

		if (!networkStore.isReady && networkStore.isLoading) return <LoadingState />;

		if (networkStore.services.length > 0)
			return <List services={networkStore.services} onOpen={(service) => setActiveId(service.id)} />;

		return <Empty onAdd={() => setIsAdding(true)} />;
	};

	return (
		<div className="flex h-full min-h-0 flex-col gap-2 overflow-hidden">
			{renderContent()}
			<ViewSwitch view={view} onChange={setView} />
		</div>
	);
});
