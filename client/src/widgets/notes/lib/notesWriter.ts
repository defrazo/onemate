import { LS_PREFIX } from '@/shared/config';
import { generateUUID } from '@/shared/lib/utils';

const SESSION_KEY = `${LS_PREFIX}notes_writer`;

interface WriterOwner {
	stop: () => void;
	done: Promise<void>;
}

const state: { current: WriterOwner | null } = import.meta.hot?.data.notesWriterState ?? { current: null };
if (import.meta.hot) import.meta.hot.data.notesWriterState = state;

export const acquireNotesWriter = (stop: () => void, preferred?: string) => {
	const previous = state.current;

	let released = false;
	let held = false;
	let approved = false;
	let writer = preferred ?? generateUUID();

	let release!: () => void;
	let finish!: () => void;

	const lifetime = new Promise<void>((resolve) => (release = resolve));
	const owner: WriterOwner = { stop, done: new Promise<void>((resolve) => (finish = resolve)) };

	state.current = owner;
	previous?.stop();

	const ready = (async () => {
		try {
			await previous?.done;

			if (released) return false;

			if (!preferred) {
				const saved = sessionStorage.getItem(SESSION_KEY);
				if (saved) writer = saved;
			}

			if (!navigator.locks) return false;

			for (let attempt = 0; attempt < 2; attempt++) {
				let granted!: (value: boolean) => void;

				const acquired = new Promise<boolean>((resolve) => (granted = resolve));

				const request = navigator.locks.request(
					`${LS_PREFIX}notes_writer_${writer}`,
					{ ifAvailable: true },
					async (lock) => {
						if (!lock || released) {
							granted(false);
							return;
						}

						held = true;
						granted(true);

						await lifetime;

						held = false;
					}
				);

				void request.catch(() => granted(false));

				if (await acquired) {
					try {
						sessionStorage.setItem(SESSION_KEY, writer);
						approved = true;

						return !released;
					} finally {
						void request.finally(finish).catch(() => {});
					}
				}

				await request;

				if (released) return false;

				writer = generateUUID();
			}
			return false;
		} catch {
			return false;
		} finally {
			if (!held) finish();
		}
	})();

	void ready.then((owned) => {
		if (!owned) release();
	});

	return {
		get writer() {
			return writer;
		},
		get owns() {
			return approved && held && !released && state.current === owner;
		},
		ready,
		release(pending: Promise<unknown> = Promise.resolve()) {
			released = true;
			owner.stop = () => {};
			void pending.finally(release).catch(() => {});
		},
	};
};
