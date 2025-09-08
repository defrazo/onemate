import type { ReactNode } from 'react';

export type WidgetTipKey = 'calculator' | 'calendar' | 'currency' | 'notes' | 'translator' | 'weather';

export const WIDGET_TIPS: Record<WidgetTipKey, ReactNode> = {
	calculator: (
		<div className="space-y-2">
			<p>В этом виджете можно:</p>
			<ul className="list-disc pl-4">
				<li>Открывать журнал операций</li>
			</ul>
			<p className="text-[var(--color-disabled)]">
				Нажмите «Развернуть журнал» (значок «&lt;»), чтобы увидеть историю.
			</p>
		</div>
	),
	calendar: (
		<div className="space-y-2">
			<p>В этом виджете можно:</p>
			<ul className="list-disc pl-4">
				<li>Выбирать период для подсчета дней</li>
				<li>Копировать выбранный период</li>
			</ul>
			<p className="text-[var(--color-disabled)]">
				Сначала кликните по начальной дате, потом по конечной. Кнопка «Выходные» включает или выключает их в
				расчете.
			</p>
		</div>
	),
	currency: (
		<div className="space-y-2">
			<p>В этом виджете можно:</p>
			<ul className="list-disc pl-4">
				<li>Копировать валютный курс</li>
				<li>Копировать результат конвертации</li>
			</ul>
			<p className="text-[var(--color-disabled)]">Щелкните по значению, чтобы скопировать его.</p>
		</div>
	),
	notes: (
		<div className="space-y-2">
			<p>В этом виджете можно:</p>
			<ul className="list-disc pl-4">
				<li>Копировать заметку</li>
				<li>Менять порядок заметок</li>
				<li>Добавлять и удалять заметки</li>
			</ul>
			<p className="text-[var(--color-disabled)]">Потяните заметку за значок с точками, чтобы переместить ее.</p>
		</div>
	),
	translator: (
		<div className="space-y-2">
			<p>В этом виджете можно:</p>
			<ul className="list-disc pl-4">
				<li>Копировать оригинал или перевод текста</li>
			</ul>
			<p className="text-[var(--color-disabled)]">Нажмите «Скопировать» в соответствующем окне.</p>
		</div>
	),
	weather: (
		<div className="space-y-2">
			<p>В этом виджете можно:</p>
			<ul className="list-disc pl-4">
				<li>Определять местоположение автоматически</li>
				<li>Узнать направление ветра</li>
			</ul>
			<p className="text-[var(--color-disabled)]">
				Наведите курсор на «Ветер» или скорость, чтобы увидеть направление.
			</p>
		</div>
	),
};
