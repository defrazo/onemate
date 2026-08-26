export type LocationChannelEvents = { type: 'location_updated'; city: string };

class LocationBroadcast {
	private channel: BroadcastChannel;
	private listeners = new Set<(e: MessageEvent<LocationChannelEvents>) => void>();

	onMessage(callback: (e: MessageEvent<LocationChannelEvents>) => void) {
		this.listeners.add(callback);
	}

	offMessage(callback: (e: MessageEvent<LocationChannelEvents>) => void) {
		this.listeners.delete(callback);
	}

	emit(event: LocationChannelEvents) {
		if (event.type !== 'location_updated' || typeof event.city !== 'string') {
			throw new Error('Данное событие отсутствует в LocationBroadcast');
		}

		this.channel.postMessage(event);
	}
	constructor() {
		this.channel = new BroadcastChannel('location-sync');
		this.channel.onmessage = (event) => {
			if (event.data.type === 'location_updated') {
				this.listeners.forEach((listener) => listener(event as MessageEvent<LocationChannelEvents>));
			}
		};
	}
}

export const locationChannel = new LocationBroadcast();
