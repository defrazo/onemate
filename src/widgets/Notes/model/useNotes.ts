import { useEffect, useRef, useState } from 'react';

import { storage } from '@/shared/lib/storage';
import { generateUUID } from '@/shared/lib/utils';

import { Note } from '.';

export const useNotes = () => {
	const [notes, setNotes] = useState<Note[]>(() => {
		const saved = storage.get('notes');
		return (
			saved ?? [
				{ id: generateUUID(), text: '' },
				{ id: generateUUID(), text: '' },
				{ id: generateUUID(), text: '' },
			]
		);
	});
	const [loading, setLoading] = useState<boolean>(true);
	const [focusedId, setFocusedId] = useState<string | null>(null);
	const didMount = useRef(false);

	const updateNotes = <K extends keyof Note>(id: string, key: K, value: Note[K]) => {
		setNotes((prev) => prev.map((item) => (item.id === id ? { ...item, [key]: value } : item)));
	};

	const addNote = () => {
		setNotes((prev) => [...prev, { id: generateUUID(), text: '' }]);
	};

	const removeNote = (id: string) => {
		if (notes.length > 3) setNotes((prev) => prev.filter((note) => note.id !== id));
	};

	useEffect(() => {
		if (didMount.current) {
			storage.set('notes', notes);
		} else {
			didMount.current = true;
			setLoading(false);
		}
	}, [notes]);

	return { notes, setNotes, focusedId, setFocusedId, loading, updateNotes, addNote, removeNote };
};
