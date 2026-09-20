<?php

namespace App\Http\Controllers\Network;

use App\Http\Controllers\Controller;
use App\Http\Requests\Network\StoreMonitoredServiceRequest;
use App\Http\Requests\Network\UpdateMonitoredServiceRequest;
use App\Http\Resources\MonitoredServiceResource;
use App\Models\MonitoredService;
use App\Services\Network\MonitoredServiceCheckService;
use App\Services\Network\PublicHostResolver;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

class MonitoredServiceController extends Controller
{
    public function index(Request $request)
    {
        $services = $request->user()
            ->monitoredServices()
            ->latest()
            ->get();

        return MonitoredServiceResource::collection($services);
    }

    public function store(StoreMonitoredServiceRequest $request, PublicHostResolver $hostResolver): JsonResponse
    {
        $data = $request->validated();

        $host = parse_url($data['url'], PHP_URL_HOST);

        if (!is_string($host) || $host === '') {
            return response()->json([
                'message' => 'Некорректный адрес.',
            ], 422);
        }

        try {
            $hostResolver->resolve($host);
        } catch (InvalidArgumentException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        } catch (ConnectionException) {
            // Ресурс может быть временно недоступен
        }

        $service = $request->user()
            ->monitoredServices()
            ->create([
                'name' => $data['name'],
                'url' => $data['url'],
            ]);

        return (new MonitoredServiceResource($service))
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

    public function update(UpdateMonitoredServiceRequest $request, MonitoredService $service, PublicHostResolver $hostResolver): MonitoredServiceResource
    {
        abort_unless(
            $service->user_id === $request->user()->id,
            404,
        );

        $data = $request->validated();

        if (isset($data['url'])) {
            $host = parse_url($data['url'], PHP_URL_HOST);

            if (!is_string($host) || $host === '') {
                abort(422, 'Некорректный адрес.');
            }

            try {
                $hostResolver->resolve($host);
            } catch (InvalidArgumentException $exception) {
                abort(422, $exception->getMessage());
            } catch (ConnectionException) {
                // Недоступный ресурс сохраняется
            }
        }

        $urlChanged =
            isset($data['url'])
            && $data['url'] !== $service->url;

        if (isset($data['name'])) {
            $service->name = $data['name'];
        }

        if (isset($data['url'])) {
            $service->url = $data['url'];
        }

        if (array_key_exists('isActive', $data)) {
            $service->is_active = $data['isActive'];
        }

        if ($urlChanged) {
            $service->last_status = null;
            $service->last_status_code = null;
            $service->last_response_time = null;
            $service->last_checked_at = null;
        }

        $service->save();

        if ($urlChanged) {
            $service->checks()->delete();
        }

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
}
