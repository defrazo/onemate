import { IconCheckbox, IconRefresh, IconSearch, IconStar, IconStarFilled } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

import { SortMenu } from '.';

interface FilesToolbarProps {
	searchOpen: boolean;
	selectionMode: boolean;
	onSearchToggle: () => void;
	onSelectionToggle: () => void;
	onRefresh: () => void;
}

export const FilesToolbar = observer(
	({ searchOpen, selectionMode, onSearchToggle, onSelectionToggle, onRefresh }: FilesToolbarProps) => {
		const { cloudStore } = useStore();

		return (
			<>
				<SortMenu />
				<Button
					active={cloudStore.favoritesOnly}
					centerIcon={
						cloudStore.favoritesOnly ? (
							<IconStarFilled className="size-4 text-(--accent-primary)" />
						) : (
							<IconStar className="size-4" />
						)
					}
					className="p-1 aria-pressed:bg-(--tone-strong) aria-pressed:text-(--accent-primary)"
					title={cloudStore.favoritesOnly ? 'Показать все файлы' : 'Только избранные'}
					variant="iconSurface"
					onClick={() => cloudStore.setFavoritesOnly(!cloudStore.favoritesOnly)}
				/>
				<Button
					active={searchOpen}
					centerIcon={<IconSearch className="size-4" />}
					className="p-1"
					title={searchOpen ? 'Закрыть поиск' : 'Поиск файлов'}
					variant="iconSurface"
					onClick={onSearchToggle}
				/>
				<Button
					active={selectionMode}
					centerIcon={<IconCheckbox className={cn('size-4', selectionMode && 'text-(--accent-primary)')} />}
					className="p-1 aria-pressed:bg-(--tone-strong) aria-pressed:text-(--accent-primary)"
					disabled={!cloudStore.files.length}
					title={selectionMode ? 'Отменить выбор' : 'Выбрать файлы'}
					variant="iconSurface"
					onClick={onSelectionToggle}
				/>
				<Button
					centerIcon={<IconRefresh className={cn('size-4', cloudStore.isLoading && 'animate-spin')} />}
					className="p-1"
					disabled={cloudStore.isLoading}
					title="Обновить файлы"
					variant="iconSurface"
					onClick={onRefresh}
				/>
			</>
		);
	}
);
