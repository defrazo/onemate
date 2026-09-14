import { useState } from 'react';
import { IconHistory } from '@tabler/icons-react';

import { Input } from '@/shared/ui';

import { useCalculator } from '../model';
import { Buttons, Log } from './components';

export const Calculator = () => {
	const { display, handleButtonClick, result } = useCalculator();

	const [isLogVisible, setIsLogVisible] = useState<boolean>(false);

	return (
		<>
			<Input
				className="pointer-events-none pr-8 pl-2 text-right text-2xl font-bold tabular-nums"
				name="calc-output"
				readOnly
				rightIcon={
					<IconHistory
						className="mr-1 ml-2 size-4 cursor-pointer text-(--color-secondary) opacity-70 transition-[color,opacity] hover:bg-(--bg-hover) hover:text-(--accent-default) hover:opacity-100"
						title="История вычислений"
						onClick={() => setIsLogVisible((prev) => !prev)}
					/>
				}
				tabIndex={-1}
				type="text"
				value={display}
				variant="ghost"
			/>
			<div className="flex flex-1 flex-col xl:flex-row">
				<Buttons onClick={handleButtonClick} />
				<Log isVisible={isLogVisible} result={result} />
			</div>
		</>
	);
};
