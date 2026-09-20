import type { MonitoringCheck } from '../../../model';

interface ResponseTimeChartProps {
	checks: MonitoringCheck[];
}

interface ChartPoint {
	x: number;
	y: number;
}

interface TimelineSegment {
	x1: number;
	x2: number;
	status: MonitoringCheck['status'];
}

const WIDTH = 600;
const HEIGHT = 120;

const PADDING_X = 8;
const PADDING_TOP = 10;
const PADDING_BOTTOM = 14;

const PERIOD_HOURS = 24;
const PERIOD_MS = PERIOD_HOURS * 60 * 60 * 1000;

const CHECK_INTERVAL_MS = 15 * 60 * 1000;

const TIMELINE_Y = HEIGHT - 5;

export const ResponseTimeChart = ({ checks }: ResponseTimeChartProps) => {
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

	const timelineSegments: TimelineSegment[] = checks.map((check, index) => {
		const startedAt = new Date(check.checkedAt).getTime();

		const nextCheck = checks[index + 1];

		const nextCheckedAt = nextCheck ? new Date(nextCheck.checkedAt).getTime() : now;

		const endedAt = Math.min(nextCheckedAt, startedAt + CHECK_INTERVAL_MS, now);

		return {
			x1: getXByTimestamp(startedAt),
			x2: getXByTimestamp(endedAt),
			status: check.status,
		};
	});

	const createLinePath = (points: ChartPoint[]) => {
		return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
	};

	const createAreaPath = (points: ChartPoint[]) => {
		if (points.length < 2) {
			return '';
		}

		const linePath = createLinePath(points);
		const firstPoint = points[0];
		const lastPoint = points[points.length - 1];
		const bottom = PADDING_TOP + chartHeight;

		return [linePath, `L ${lastPoint.x} ${bottom}`, `L ${firstPoint.x} ${bottom}`, 'Z'].join(' ');
	};

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<div className="min-h-0 flex-1">
				<svg
					className="h-full w-full overflow-visible"
					preserveAspectRatio="none"
					viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
				>
					<defs>
						<linearGradient id="response-time-gradient" x1="0" x2="0" y1="0" y2="1">
							<stop offset="0%" stopColor="var(--accent-default)" stopOpacity="0.2" />

							<stop offset="100%" stopColor="var(--accent-default)" stopOpacity="0" />
						</linearGradient>
					</defs>

					{[0.25, 0.5, 0.75].map((position) => {
						const y = PADDING_TOP + chartHeight * position;

						return (
							<line
								key={position}
								className="text-white/5"
								stroke="currentColor"
								strokeDasharray="2 6"
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
								{areaPath && <path d={areaPath} fill="url(#response-time-gradient)" />}

								<path
									d={linePath}
									fill="none"
									stroke="var(--accent-default)"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
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
							strokeOpacity={segment.status === 'up' ? 0.5 : 0.9}
							strokeWidth="3"
							vectorEffect="non-scaling-stroke"
							x1={segment.x1}
							x2={segment.x2}
							y1={TIMELINE_Y}
							y2={TIMELINE_Y}
						/>
					))}
				</svg>
			</div>

			<div className="flex items-center justify-between pt-1 text-[10px] text-(--color-disabled)">
				<span>24ч назад</span>

				<span>{checks.length} проверок</span>

				<span>Сейчас</span>
			</div>
		</div>
	);
};
