<?php

namespace App\Http\Controllers\Monitoring;

use App\Http\Controllers\Controller;
use App\Models\Cloud\CloudFile;
use App\Models\User\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MonitoringController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $users = User::query()->whereNull('users.deleted_at')
            ->select(['users.id', 'username', 'email', 'role', 'users.created_at', 'last_login_at']);

        // Each subquery produces at most one row per owner, so joins cannot multiply counts.
        $groups = [
            'cloud' => [DB::table('cloud_files'), 'user_id', [
                'cloud_files' => 'COUNT(*)', 'cloud_bytes' => 'SUM(size)',
            ]],
            'notes' => [DB::table('user_notes'), 'user_id', ['notes' => 'COUNT(*)']],
            'activity' => [DB::table('user_auth_logs'), 'user_id', ['auth_logs' => 'COUNT(*)']],
            'locations' => [DB::table('user_locations'), 'user_id', ['locations' => 'COUNT(*)']],
            'canvases' => [DB::table('todo_canvases'), 'user_id', ['todo_canvases' => 'COUNT(*)']],
            'lists' => [DB::table('todo_lists')->join('todo_canvases', 'todo_canvases.id', '=', 'canvas_id'),
                'todo_canvases.user_id', ['todo_lists' => 'COUNT(*)']],
            'items' => [DB::table('todo_items')
                ->join('todo_lists', 'todo_lists.id', '=', 'list_id')
                ->join('todo_canvases', 'todo_canvases.id', '=', 'canvas_id'),
                'todo_canvases.user_id', [
                    'todo_items' => 'COUNT(*)',
                    'todo_completed' => 'SUM(CASE WHEN is_completed THEN 1 ELSE 0 END)',
                ]],
            'boards' => [DB::table('kanban_boards'), 'owner_id', ['kanban_boards' => 'COUNT(*)']],
            'columns' => [DB::table('kanban_columns')
                ->leftJoin('kanban_boards', 'kanban_boards.id', '=', 'board_id'),
                'COALESCE(kanban_boards.owner_id, kanban_columns.user_id)', ['kanban_columns' => 'COUNT(*)']],
            'tasks' => [DB::table('kanban_tasks')
                ->join('kanban_columns', 'kanban_columns.id', '=', 'column_id')
                ->leftJoin('kanban_boards', 'kanban_boards.id', '=', 'kanban_columns.board_id'),
                'COALESCE(kanban_boards.owner_id, kanban_columns.user_id)', [
                    'kanban_tasks' => 'COUNT(*)',
                    'kanban_completed' => 'SUM(CASE WHEN completed THEN 1 ELSE 0 END)',
                ]],
            'network' => [DB::table('monitored_services'), 'user_id', ['network_services' => 'COUNT(*)']],
            'checks' => [DB::table('monitoring_checks')
                ->join('monitored_services', 'monitored_services.id', '=', 'monitored_service_id'),
                'monitored_services.user_id', ['network_checks' => 'COUNT(*)']],
            'notifications' => [DB::table('notifications')->where('notifiable_type', (new User)->getMorphClass()),
                'notifiable_id', ['notifications' => 'COUNT(*)']],
        ];

        $metrics = [];

        foreach ($groups as $alias => [$query, $owner, $aggregates]) {
            $query->selectRaw("$owner as owner_id")->groupByRaw($owner);

            foreach ($aggregates as $metric => $expression) {
                $query->selectRaw("$expression as $metric");
                $users->selectRaw("COALESCE($alias.$metric, 0) as $metric");
                $metrics[] = $metric;
            }
            $users->leftJoinSub($query, $alias, "$alias.owner_id", '=', 'users.id');
        }

        $totals = DB::query()->fromSub((clone $users)->toBase(), 'metrics')
            ->selectRaw('COUNT(*) as users')
            ->selectRaw('SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) as new_users_7', [now()->subDays(7)])
            ->selectRaw('SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) as new_users', [now()->subDays(30)]);

        foreach ($metrics as $metric) {
            $totals->selectRaw("COALESCE(SUM($metric), 0) as $metric");
        }
        $stats = collect((array) $totals->first())
            ->mapWithKeys(fn ($value, $key) => [Str::camel($key) => (int) $value]);

        $sizes = CloudFile::query()
            ->whereHas('user', fn ($query) => $query->whereNull('deleted_at'))
            ->selectRaw('COALESCE(AVG(size), 0) as average, COALESCE(MAX(size), 0) as maximum')
            ->first();
        $stats->put('cloudAverageBytes', (float) $sizes->average);
        $stats->put('cloudMaxBytes', (int) $sizes->maximum);

        return response()->json([
            'stats' => $stats,
            'users' => $users->orderByDesc('users.created_at')->orderBy('users.id')->get()
                ->map(function (User $user) use ($metrics) {
                    $row = [
                        'id' => $user->id,
                        'username' => $user->username,
                        'email' => $user->email,
                        'role' => $user->role,
                        'createdAt' => $user->created_at?->toISOString(),
                        'lastLoginAt' => $user->last_login_at?->toISOString(),
                    ];

                    foreach ($metrics as $metric) {
                        $row[Str::camel($metric)] = (int) $user->getAttribute($metric);
                    }

                    return $row;
                }),
        ]);
    }
}
