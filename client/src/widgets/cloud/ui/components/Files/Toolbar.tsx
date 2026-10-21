import { IconRefresh, IconSearch, IconStar } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

import { SortMenu } from '.';

export const FilesToolbar = observer(
	({ searchOpen, onSearchToggle }: { searchOpen: boolean; onSearchToggle: () => void }) => {
		const { cloudStore } = useStore();

		return (
			<>
				<SortMenu />
				<Button
					active={cloudStore.favoritesOnly}
					centerIcon={<IconStar className="size-4" />}
					className="p-1"
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
					centerIcon={<IconRefresh className={cn('size-4', cloudStore.isLoading && 'animate-spin')} />}
					className="p-1"
					disabled={cloudStore.isLoading}
					title="Обновить файлы"
					variant="iconSurface"
					onClick={() => void cloudStore.refresh()}
				/>
			</>
		);
	}
);
