<?php

namespace App\Http\Controllers\Network;

use App\Http\Controllers\Controller;
use App\Http\Requests\Network\ReorderMonitoredServicesRequest;
use App\Http\Requests\Network\StoreMonitoredServiceRequest;
use App\Http\Requests\Network\UpdateMonitoredServiceRequest;
use App\Http\Resources\MonitoredServiceResource;
use App\Models\Network\MonitoredService;
use App\Services\Network\MonitoredServiceCheckService;
use App\Services\Network\Support\HostNormalizer;
use App\Services\Network\Support\PublicHostResolver;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class MonitoredServiceController extends Controller
{
    public function index(Request $request)
    {
        $services = $request->user()
            ->monitoredServices()
            ->orderBy('order_idx')
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get();

        return MonitoredServiceResource::collection($services);
    }

    public function store(StoreMonitoredServiceRequest $request, PublicHostResolver $hostResolver, HostNormalizer $hostNormalizer): JsonResponse
    {
        $data = $request->validated();

        try {
            if ($data['type'] === 'http') {
                $host = parse_url($data['url'], PHP_URL_HOST);

                if (!is_string($host) || $host === '') {
                    throw new InvalidArgumentException('Некорректный адрес');
                }

                $hostResolver->resolve($host);
            } else {
                $host = $hostNormalizer->normalize($data['host']);
                $hostResolver->resolve($host);

                $data['host'] = $host;
            }
        } catch (InvalidArgumentException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        } catch (ConnectionException) {
            // Сервис может быть временно недоступен
        }

        $attributes = [
            'type' => $data['type'],
            'name' => $data['name'],
            'check_via' => $data['checkVia'] ?? 'direct',
        ];

        if ($data['type'] === 'http') {
            $attributes['url'] = $data['url'];
        } else {
            $attributes['host'] = $data['host'];
            $attributes['port'] = $data['port'];
        }

        $service = DB::transaction(function () use ($request, $attributes) {
            $user = $request->user();

            $user->newQuery()
                ->whereKey($user->id)
                ->lockForUpdate()
                ->firstOrFail();

            $user->monitoredServices()->increment('order_idx');

            return $user->monitoredServices()->create([
                ...$attributes,
                'order_idx' => 0,
            ]);
        });

        return (new MonitoredServiceResource($service->refresh()))
            ->response()
            ->setStatusCode(201);
    }

    public function check(Request $request, MonitoredService $service, MonitoredServiceCheckService $checkService): MonitoredServiceResource
    {
        abort_unless(
            $service->user_id === $request->user()->id,
            404,
        );

        $service = $checkService->check($service);

        return new MonitoredServiceResource($service);
    }

    public function history(Request $request, MonitoredService $service): JsonResponse
    {
        abort_unless(
            $service->user_id === $request->user()->id,
            404,
        );

        $checks = $service->checks()
            ->where('checked_at', '>=', now()->subDay())
            ->orderBy('checked_at')
            ->get();

        $total = $checks->count();
        $successful = $checks->where('status', 'up')->count();

        $uptime = $total > 0
            ? round(($successful / $total) * 100, 2)
            : null;

        $incidents = 0;
        $previousStatus = null;

        foreach ($checks as $check) {
            if ($check->status === 'down' && $previousStatus !== 'down') {
                $incidents++;
            }

            $previousStatus = $check->status;
        }

        return response()->json([
            'checks' => $checks->map(fn ($check) => [
                'status' => $check->status,
                'statusCode' => $check->status_code,
                'responseTime' => $check->response_time,
                'checkedAt' => $check->checked_at->toISOString(),
            ]),
            'uptime' => $uptime,
            'incidents' => $incidents,
        ]);
    }

    public function update(
        UpdateMonitoredServiceRequest $request,
        MonitoredService $service,
        PublicHostResolver $hostResolver,
        HostNormalizer $hostNormalizer,
    ): MonitoredServiceResource {
        abort_unless(
            $service->user_id === $request->user()->id,
            404,
        );

        $data = $request->validated();

        if ($data['type'] !== $service->type) {
            abort(422, 'Тип мониторинга нельзя изменить');
        }

        $checkConfigChanged = false;

        if ($service->type === 'http' && isset($data['url'])) {
            $host = parse_url($data['url'], PHP_URL_HOST);

            if (!is_string($host) || $host === '') {
                abort(422, 'Некорректный адрес');
            }

            try {
                $hostResolver->resolve($host);
            } catch (InvalidArgumentException $exception) {
                abort(422, $exception->getMessage());
            } catch (ConnectionException) {
                // Недоступный сервис сохраняется
            }

            $checkConfigChanged = $data['url'] !== $service->url;
            $service->url = $data['url'];
        }

        if ($service->type === 'tcp') {
            $host = $data['host'] ?? $service->host;
            $port = $data['port'] ?? $service->port;

            try {
                $host = $hostNormalizer->normalize($host);
                $hostResolver->resolve($host);
            } catch (InvalidArgumentException $exception) {
                abort(422, $exception->getMessage());
            } catch (ConnectionException) {
                // Недоступный сервис сохраняется
            }

            $checkConfigChanged =
                $host !== $service->host
                || $port !== $service->port;

            $service->host = $host;
            $service->port = $port;
        }

        if (isset($data['checkVia'])) {
            $checkConfigChanged = $checkConfigChanged
                || $data['checkVia'] !== $service->check_via;

            $service->check_via = $data['checkVia'];
        }

        if (isset($data['name'])) {
            $service->name = $data['name'];
        }

        if (array_key_exists('isActive', $data)) {
            $service->is_active = $data['isActive'];
        }

        if ($checkConfigChanged) {
            $service->last_status = null;
            $service->last_status_code = null;
            $service->last_response_time = null;
            $service->last_checked_at = null;
        }

        DB::transaction(function () use ($service, $checkConfigChanged) {
            $service->save();

            if ($checkConfigChanged) {
                $service->checks()->delete();
            }
        });

        return new MonitoredServiceResource($service->refresh());
    }

    public function destroy(Request $request, MonitoredService $service): JsonResponse
    {
        abort_unless(
            $service->user_id === $request->user()->id,
            404,
        );

        $service->delete();

        return response()->json(null, 204);
    }

    public function reorder(ReorderMonitoredServicesRequest $request): JsonResponse
    {
        $ids = $request->validated('ids');

        DB::transaction(function () use ($request, $ids) {
            $services = $request->user()
                ->monitoredServices()
                ->lockForUpdate()
                ->pluck('id');

            abort_unless(
                $services->sort()->values()->all() === collect($ids)->sort()->values()->all(),
                422,
                'Некорректный список сервисов',
            );

            foreach ($ids as $index => $id) {
                DB::table('monitored_services')
                    ->where('user_id', $request->user()->id)
                    ->where('id', $id)
                    ->update(['order_idx' => $index]);
            }
        });

        return response()->json(['message' => 'Порядок сохранён']);
    }
}
