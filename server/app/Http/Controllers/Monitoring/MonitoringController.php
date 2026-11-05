<?php

namespace App\Http\Controllers\Monitoring;

use App\Http\Controllers\Controller;
use App\Models\Cloud\CloudFile;
use App\Models\User\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MonitoringController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $users = $this->buildUsersQuery();
        $metrics = $this->getMetricNames();

        return response()->json([
            'stats' => $this->getStats($users, $metrics),
            'users' => $this->getUsers($users, $metrics),
        ]);
    }

    private function buildUsersQuery(): Builder
    {
        $users = User::query()
            ->whereNull('users.deleted_at')
            ->select([
                'users.id',
                'users.username',
                'users.email',
                'users.role',
                'users.created_at',
                'users.last_login_at',
            ]);

        foreach ($this->getMetricGroups() as $alias => [$query, $owner, $aggregates]) {
            $query->selectRaw("$owner AS owner_id")
                ->groupByRaw($owner);

            foreach ($aggregates as $metric => $expression) {
                $query->selectRaw("$expression AS $metric");
                $users->selectRaw("COALESCE($alias.$metric, 0) AS $metric");
            }

            $users->leftJoinSub($query, $alias, "$alias.owner_id", '=', 'users.id');
        }

        return $users;
    }

    private function getStats(Builder $users, array $metrics): array
    {
        $now = now();

        $query = DB::query()
            ->fromSub((clone $users)->toBase(), 'metrics')
            ->selectRaw('COUNT(*) AS users')
            ->selectRaw(
                'SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) AS new_users_7',
                [$now->copy()->subDays(7)],
            )
            ->selectRaw(
                'SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) AS new_users',
                [$now->copy()->subDays(30)],
            );

        foreach ($metrics as $metric) {
            $query->selectRaw("COALESCE(SUM($metric), 0) AS $metric");
        }

        $stats = collect((array) $query->first())
            ->mapWithKeys(fn ($value, $key) => [
                Str::camel($key) => (int) $value,
            ])
            ->all();

        $sizes = CloudFile::query()
            ->whereHas('user', fn ($query) => $query->whereNull('deleted_at'))
            ->selectRaw('COALESCE(AVG(size), 0) AS average')
            ->selectRaw('COALESCE(MAX(size), 0) AS maximum')
            ->first();

        $stats['cloudAverageBytes'] = (float) $sizes->average;
        $stats['cloudMaxBytes'] = (int) $sizes->maximum;

        return $stats;
    }

    private function getUsers(Builder $users, array $metrics): array
    {
        return $users
            ->orderByDesc('users.created_at')
            ->orderBy('users.id')
            ->get()
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
            })
            ->all();
    }

    private function getMetricNames(): array
    {
        $metrics = [];

        foreach ($this->getMetricGroups() as [, , $aggregates]) {
            array_push($metrics, ...array_keys($aggregates));
        }

        return $metrics;
    }

    private function getMetricGroups(): array
    {
        return [
            'cloud' => [
                DB::table('cloud_files'),
                'user_id',
                [
                    'cloud_files' => 'COUNT(*)',
                    'cloud_bytes' => 'SUM(size)',
                ],
            ],
            'notes' => [
                DB::table('user_notes'),
                'user_id',
                [
                    'notes' => 'COUNT(*)',
                ],
            ],
            'activity' => [
                DB::table('user_auth_logs'),
                'user_id',
                [
                    'auth_logs' => 'COUNT(*)',
                ],
            ],
            'locations' => [
                DB::table('user_locations'),
                'user_id',
                [
                    'locations' => 'COUNT(*)',
                ],
            ],
            'canvases' => [
                DB::table('todo_canvases'),
                'user_id',
                [
                    'todo_canvases' => 'COUNT(*)',
                ],
            ],
            'lists' => [
                DB::table('todo_lists')
                    ->join('todo_canvases', 'todo_canvases.id', '=', 'todo_lists.canvas_id'),
                'todo_canvases.user_id',
                [
                    'todo_lists' => 'COUNT(*)',
                ],
            ],
            'items' => [
                DB::table('todo_items')
                    ->join('todo_lists', 'todo_lists.id', '=', 'todo_items.list_id')
                    ->join('todo_canvases', 'todo_canvases.id', '=', 'todo_lists.canvas_id'),
                'todo_canvases.user_id',
                [
                    'todo_items' => 'COUNT(*)',
                    'todo_completed' => 'SUM(CASE WHEN todo_items.is_completed THEN 1 ELSE 0 END)',
                ],
            ],
            'boards' => [
                DB::table('kanban_boards'),
                'owner_id',
                [
                    'kanban_boards' => 'COUNT(*)',
                ],
            ],
            'columns' => [
                DB::table('kanban_columns')
                    ->leftJoin('kanban_boards', 'kanban_boards.id', '=', 'kanban_columns.board_id'),
                'COALESCE(kanban_boards.owner_id, kanban_columns.user_id)',
                [
                    'kanban_columns' => 'COUNT(*)',
                ],
            ],
            'tasks' => [
                DB::table('kanban_tasks')
                    ->join('kanban_columns', 'kanban_columns.id', '=', 'kanban_tasks.column_id')
                    ->leftJoin('kanban_boards', 'kanban_boards.id', '=', 'kanban_columns.board_id'),
                'COALESCE(kanban_boards.owner_id, kanban_columns.user_id)',
                [
                    'kanban_tasks' => 'COUNT(*)',
                    'kanban_completed' => 'SUM(CASE WHEN kanban_tasks.completed THEN 1 ELSE 0 END)',
                ],
            ],
            'network' => [
                DB::table('monitored_services'),
                'user_id',
                [
                    'network_services' => 'COUNT(*)',
                ],
            ],
            'checks' => [
                DB::table('monitoring_checks')
                    ->join(
                        'monitored_services',
                        'monitored_services.id',
                        '=',
                        'monitoring_checks.monitored_service_id',
                    ),
                'monitored_services.user_id',
                [
                    'network_checks' => 'COUNT(*)',
                ],
            ],
            'notifications' => [
                DB::table('notifications')
                    ->where('notifiable_type', (new User)->getMorphClass()),
                'notifiable_id',
                [
                    'notifications' => 'COUNT(*)',
                ],
            ],
        ];
    }
}
