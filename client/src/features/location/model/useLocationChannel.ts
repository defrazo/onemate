import { useEffect } from 'react';

import { useStore } from '@/app/providers';
import type { LocationChannelEvents } from '@/shared/lib/broadcast';
import { locationChannel } from '@/shared/lib/broadcast';

export const useLocationChannel = () => {
	const { locationStore } = useStore();

	useEffect(() => {
		const handleLocationUpdate = (event: MessageEvent<LocationChannelEvents>) => {
			if (event.data.type === 'location_updated') locationStore.setQuery(event.data.city);
		};

		locationChannel.onMessage(handleLocationUpdate);
		return () => locationChannel.offMessage(handleLocationUpdate);
	}, []);
};
