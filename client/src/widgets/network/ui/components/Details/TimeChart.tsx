import { useId, useState } from 'react';

import type { MonitoringCheck } from '../../../model';

type ChartPoint = { x: number; y: number; responseTime: number; checkedAt: string };
type TimelineSegment = { x1: number; x2: number; status: MonitoringCheck['status'] };

const WIDTH = 600;
const HEIGHT = 200;

const PADDING_X = 8;
const PADDING_TOP = 4;
const PADDING_BOTTOM = 20;

const PERIOD_HOURS = 24;
const PERIOD_MS = PERIOD_HOURS * 60 * 60 * 1000;

const CHECK_INTERVAL_MS = 15 * 60 * 1000;

const TIMELINE_Y = HEIGHT - 5;

export const TimeChart = ({ checks }: { checks: MonitoringCheck[] }) => {
	const gradientId = useId();

	const [hoveredPoint, setHoveredPoint] = useState<ChartPoint | null>(null);

	const availableChecks = checks.filter(
		(check): check is MonitoringCheck & { responseTime: number } =>
			check.status === 'up' && check.responseTime !== null
	);

	const chartWidth = WIDTH - PADDING_X * 2;
	const chartHeight = HEIGHT - PADDING_TOP - PADDING_BOTTOM;

	const now = Date.now();
	const periodStart = now - PERIOD_MS;

	const getXByTimestamp = (timestamp: number) => {
		const progress = Math.min(1, Math.max(0, (timestamp - periodStart) / PERIOD_MS));
		return PADDING_X + progress * chartWidth;
	};

	const getX = (checkedAt: string) => {
		return getXByTimestamp(new Date(checkedAt).getTime());
	};

	const maxResponseTime =
		availableChecks.length > 0 ? Math.max(...availableChecks.map((check) => check.responseTime)) : 0;

	const yMax = Math.max(100, Math.ceil((maxResponseTime * 1.2) / 50) * 50);

	const getY = (responseTime: number) => {
		const progress = Math.min(responseTime / yMax, 1);
		return PADDING_TOP + (1 - progress) * chartHeight;
	};

	const responseSegments: ChartPoint[][] = [];
	let currentSegment: ChartPoint[] = [];

	for (const check of checks) {
		if (check.status === 'up' && check.responseTime !== null) {
			currentSegment.push({
				x: getX(check.checkedAt),
				y: getY(check.responseTime),
				responseTime: check.responseTime,
				checkedAt: check.checkedAt,
			});

			continue;
		}

		if (currentSegment.length > 0) {
			responseSegments.push(currentSegment);
			currentSegment = [];
		}
	}

	if (currentSegment.length > 0) {
		responseSegments.push(currentSegment);
	}

	const points = responseSegments.flat();

	const timelineSegments: TimelineSegment[] = checks.map((check, index) => {
		const startedAt = new Date(check.checkedAt).getTime();
		const nextCheck = checks[index + 1];
		const nextCheckedAt = nextCheck ? new Date(nextCheck.checkedAt).getTime() : now;
		const endedAt = Math.min(nextCheckedAt, startedAt + CHECK_INTERVAL_MS, now);

		return { x1: getXByTimestamp(startedAt), x2: getXByTimestamp(endedAt), status: check.status };
	});

	const createLinePath = (points: ChartPoint[]) => {
		return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
	};

	const createAreaPath = (points: ChartPoint[]) => {
		if (points.length < 2) return '';

		const linePath = createLinePath(points);
		const firstPoint = points[0];
		const lastPoint = points[points.length - 1];
		const bottom = PADDING_TOP + chartHeight;

		return [linePath, `L ${lastPoint.x} ${bottom}`, `L ${firstPoint.x} ${bottom}`, 'Z'].join(' ');
	};

	const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
		if (points.length === 0) return;

		const rect = event.currentTarget.getBoundingClientRect();
		const mouseX = ((event.clientX - rect.left) / rect.width) * WIDTH;

		let closestPoint = points[0];
		let closestDistance = Math.abs(points[0].x - mouseX);

		for (const point of points.slice(1)) {
			const distance = Math.abs(point.x - mouseX);

			if (distance < closestDistance) {
				closestPoint = point;
				closestDistance = distance;
			}
		}

		setHoveredPoint(closestPoint);
	};

	return (
		<div className="flex flex-col">
			<div className="relative h-28">
				<svg
					className="size-full cursor-crosshair overflow-visible"
					preserveAspectRatio="none"
					viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
					onMouseLeave={() => setHoveredPoint(null)}
					onMouseMove={handleMouseMove}
				>
					<defs>
						<linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
							<stop offset="0%" stopColor="var(--accent-default)" stopOpacity="0.12" />
							<stop offset="100%" stopColor="var(--accent-default)" stopOpacity="0" />
						</linearGradient>
					</defs>

					{[0.25, 0.5, 0.75].map((position) => {
						const y = PADDING_TOP + chartHeight * position;

						return (
							<line
								key={position}
								className="text-white/20"
								stroke="currentColor"
								strokeDasharray="2 7"
								vectorEffect="non-scaling-stroke"
								x1={PADDING_X}
								x2={WIDTH - PADDING_X}
								y1={y}
								y2={y}
							/>
						);
					})}

					{responseSegments.map((segment, index) => {
						const linePath = createLinePath(segment);
						const areaPath = createAreaPath(segment);

						return (
							<g key={index}>
								{areaPath && <path d={areaPath} fill={`url(#${gradientId})`} />}
								<path
									d={linePath}
									fill="none"
									stroke="var(--accent-default)"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="1.75"
									vectorEffect="non-scaling-stroke"
								/>
							</g>
						);
					})}

					{timelineSegments.map((segment, index) => (
						<line
							key={index}
							stroke={segment.status === 'up' ? 'var(--status-success)' : 'var(--status-error)'}
							strokeLinecap="butt"
							strokeOpacity={segment.status === 'up' ? 0.55 : 0.95}
							strokeWidth="3"
							vectorEffect="non-scaling-stroke"
							x1={segment.x1}
							x2={segment.x2}
							y1={TIMELINE_Y}
							y2={TIMELINE_Y}
						/>
					))}
				</svg>
				{hoveredPoint && <ChartTooltip point={hoveredPoint} />}
			</div>
			<div className="flex items-center justify-between px-2 pt-1.5 text-[10px] text-(--color-disabled)">
				<span>24 ч</span>
				<span className="tabular-nums">{checks.length} проверок</span>
				<span>Сейчас</span>
			</div>
		</div>
	);
};

const ChartTooltip = ({ point }: { point: ChartPoint }) => {
	const left = (point.x / WIDTH) * 100;
	const top = (point.y / HEIGHT) * 100;

	const time = new Date(point.checkedAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

	return (
		<>
			<div
				className="pointer-events-none absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-(--bg-secondary) bg-(--accent-default)"
				style={{ left: `${left}%`, top: `${top}%` }}
			/>
			<div
				className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full pb-2"
				style={{ left: `${left}%`, top: `${top}%` }}
			>
				<div className="rounded-lg border border-(--border-color) bg-(--bg-secondary) px-2.5 py-1.5 whitespace-nowrap shadow-lg">
					<div className="text-xs font-semibold text-(--color-primary) tabular-nums">
						{point.responseTime} мс
					</div>
					<div className="text-[10px] text-(--color-secondary) tabular-nums">{time}</div>
				</div>
			</div>
		</>
	);
};
