import { useEffect } from 'react';

import { useStore } from '@/app/providers';
import { notesChannel } from '@/shared/lib/broadcast';

export const useNotesChannel = () => {
	const { notesStore } = useStore();

	useEffect(() => {
		const handleMessage = () => notesStore.loadNotes();
		notesChannel.onMessage(handleMessage);

		return () => notesChannel.offMessage(handleMessage);
	}, []);
};
