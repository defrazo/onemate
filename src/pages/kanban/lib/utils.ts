export const createSvg = (svgText: string, className = ''): SVGSVGElement | undefined => {
	const template = document.createElement('template');
	template.innerHTML = svgText.trim();

	const svg = template.content.firstElementChild;
	if (!(svg instanceof SVGSVGElement)) return;

	if (className) svg.classList.add(...className.split(' ').filter(Boolean));

	return svg;
};

export const insertSvg = (container: HTMLElement, svgText: string, className = ''): SVGSVGElement | undefined => {
	const svg = createSvg(svgText, className);
	if (!svg) return;

	container.append(svg);
	return svg;
};
