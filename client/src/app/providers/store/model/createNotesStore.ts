import { createElement } from 'react';

import type { UserStore } from '@/entities/user';
import type { AuthStore } from '@/features/auth';
import type { ModalStore } from '@/features/modal';
import type { NotifyStore } from '@/features/toast';
import { ConfirmDialog } from '@/shared/ui';
import { NotesRepoRouting, NotesStore } from '@/widgets/notes';

interface Dependencies {
	userStore: UserStore;
	authStore: AuthStore;
	modalStore: ModalStore;
	notifyStore: NotifyStore;
}

export const createNotesStore = ({ userStore, authStore, modalStore, notifyStore }: Dependencies): NotesStore => {
	const notesStore = new NotesStore(userStore, new NotesRepoRouting(userStore), undefined, () => {
		authStore.endSession();
		notifyStore.setNotice(
			'Сессия завершена. Несохранённые заметки сохранены локально для повторного входа.',
			'warning'
		);
	});

	authStore.setLogoutGuard(
		async (userId) => {
			if (notesStore.hasUnsavedNotes()) {
				try {
					await notesStore.flushForLogout();
				} catch {
					if (userStore.id !== userId) return false;

					const discard = await new Promise<boolean>((resolve) => {
						const finish = (value: boolean) => {
							modalStore.closeModal();
							resolve(value);
						};

						modalStore.setModal(
							createElement(ConfirmDialog, {
								title: 'Есть несохранённые заметки',
								description: 'Не удалось сохранить изменения. При выходе они будут потеряны.',
								confirmLabel: 'Выйти без сохранения',
								cancelLabel: 'Остаться',
								variant: 'danger',
								onConfirm: () => finish(userStore.id === userId),
								onCancel: () => finish(false),
							}),
							'auto',
							{ onClose: () => resolve(false) }
						);
					});

					return discard ? 'discard' : false;
				}
			}

			if (userStore.id !== userId) return false;

			return 'saved';
		},
		(userId) => notesStore.discardForLogout(userId)
	);

	return notesStore;
};
