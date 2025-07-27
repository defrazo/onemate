type NotesChannelEvents = 'note_added' | 'note_removed' | 'notes_updated' | 'notes_reordered';

class NotesBroadcast {
	private channel: BroadcastChannel;
	private listeners = new Set<(e: MessageEvent<NotesChannelEvents>) => void>();

	onMessage(callback: (e: MessageEvent<NotesChannelEvents>) => void) {
		this.listeners.add(callback);
	}

	offMessage(callback: (e: MessageEvent<NotesChannelEvents>) => void) {
		this.listeners.delete(callback);
	}

	emit(event: NotesChannelEvents) {
		this.channel.postMessage(event);
	}

	constructor() {
		this.channel = new BroadcastChannel('notes-sync');
		this.channel.onmessage = (event) => {
			this.listeners.forEach((listener) => listener(event as MessageEvent<NotesChannelEvents>));
		};
	}
}

export const notesChannel = new NotesBroadcast();
