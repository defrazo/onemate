import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { cn } from '@/shared/lib/utils';

type SortableWidgetProps = {
	id: string;
	children: React.ReactElement<any>; // Указываем, что props могут быть любого типа
	disabled?: boolean;
};

const SortableWidget = ({ id, children, disabled }: SortableWidgetProps) => {
	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id, disabled });

	// Приводим props к нужному типу
	const childProps = children.props as {
		style?: React.CSSProperties;
		className?: string;
		[key: string]: any;
	};

	const style: React.CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
		...(childProps.style || {}), // Сохраняем существующие стили
	};

	// Клонируем дочерний элемент и добавляем к нему sortable атрибуты
	return React.cloneElement(children, {
		ref: setNodeRef,
		style,
		...(disabled ? {} : { ...attributes, ...listeners }),
		// className: cn(childProps.className, !disabled && '!cursor-move rounded-xl border border-dashed'),
		className: cn(!disabled && 'cursor-move rounded-xl border border-dashed'),
	});
};

export default SortableWidget;
