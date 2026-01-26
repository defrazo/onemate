export const insertSvg = async (container: HTMLElement, path: string, classes: string = '') => {
	const response = await fetch(path);
	const svgText = await response.text();

	container.innerHTML = svgText;
	const svgEl = container.querySelector('svg');
	if (svgEl) {
		svgEl.className.baseVal = classes; // добавляем Tailwind классы
	}
};
