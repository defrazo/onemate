<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\User\User;
use App\Models\User\UserCredential;
use Closure;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class UserCredentialController extends Controller
{
    private const MAX_ENTRIES = 50;

    private const COLORS = ['slate', 'rose', 'amber', 'emerald', 'violet', 'lime', 'fuchsia', 'sky'];

    public function index(Request $request): JsonResponse
    {
        return $this->read($request);
    }

    public function show(Request $request, string $credential): JsonResponse
    {
        return $this->read($request, $credential);
    }

    public function password(Request $request, string $credential): JsonResponse
    {
        return $this->read($request, $credential, true);
    }

    public function initialize(Request $request): JsonResponse
    {
        return $this->write($request, function (User $owner): bool {
            if ((int) $owner->credentials_revision !== 0 || $this->rows($owner)->exists()) {
                return false;
            }

            $entry = new UserCredential([
                'service' => 'Пример учётки',
                'login' => 'demo@example.com',
                'password' => 'demo-password',
                'comment' => 'Это пример записи. Измени или удали её',
                'color' => 'sky',
                'order_idx' => 0,
            ]);

            $entry->user_id = $owner->id;
            $entry->save();

            return true;
        }, true);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->fields($request, true);

        return $this->write($request, function (User $owner) use ($data): bool {
            $count = $this->rows($owner)->count();

            if ($count >= self::MAX_ENTRIES) {
                throw ValidationException::withMessages([
                    'entries' => 'Не более 50 аккаунтов',
                ]);
            }

            $entry = new UserCredential([
                ...$data,
                'login' => $data['login'] ?? '',
                'password' => $data['password'] ?: null,
                'order_idx' => $count,
            ]);

            $entry->user_id = $owner->id;
            $entry->save();

            return true;
        });
    }

    public function update(Request $request, string $credential): JsonResponse
    {
        $data = $this->fields($request, false);

        return $this->write($request, function (User $owner) use ($credential, $data): bool {
            $entry = $this->rows($owner)->whereKey($credential)->firstOrFail();

            if (array_key_exists('password', $data)) {
                $data['password'] = $data['password'] ?: null;
            }

            if (array_key_exists('login', $data)) {
                $data['login'] ??= '';
            }

            $entry->fill($data);

            if (!$entry->isDirty()) {
                return false;
            }

            $entry->save();

            return true;
        });
    }

    public function destroy(Request $request, string $credential): JsonResponse
    {
        return $this->write($request, function (User $owner) use ($credential): bool {
            $this->rows($owner)->whereKey($credential)->firstOrFail()->delete();

            $this->rows($owner)
                ->orderBy('order_idx')
                ->orderBy('id')
                ->get()
                ->each(function (UserCredential $entry, int $index): void {
                    if ((int) $entry->order_idx !== $index) {
                        $entry->update(['order_idx' => $index]);
                    }
                });

            return true;
        });
    }

    public function reorder(Request $request): JsonResponse
    {
        $ids = $request->validate([
            'ids' => ['present', 'array', 'max:' . self::MAX_ENTRIES],
            'ids.*' => ['required', 'uuid', 'distinct'],
        ])['ids'];

        return $this->write($request, function (User $owner) use ($ids): bool {
            $existing = $this->rows($owner)->pluck('id')->all();

            if (count($ids) !== count($existing) || array_diff($existing, $ids)) {
                throw ValidationException::withMessages([
                    'ids' => 'Передайте полный порядок собственных аккаунтов без повторов',
                ]);
            }

            $changed = false;

            foreach ($ids as $index => $id) {
                $updated = $this->rows($owner)
                    ->whereKey($id)
                    ->where('order_idx', '!=', $index)
                    ->update(['order_idx' => $index]);

                if ($updated > 0) {
                    $changed = true;
                }
            }

            return $changed;
        });
    }

    private function rows(User $owner): HasMany
    {
        return $owner->credentials();
    }

    private function metadata(UserCredential $entry): array
    {
        return [
            ...$entry->only([
                'id',
                'service',
                'login',
                'comment',
                'url',
                'color',
                'order_idx',
                'created_at',
                'updated_at',
            ]),
            'has_password' => $entry->getRawOriginal('password') !== null,
        ];
    }

    private function snapshot(User $owner): array
    {
        return [
            'revision' => (int) $owner->credentials_revision,
            'entries' => $this->rows($owner)
                ->orderBy('order_idx')
                ->orderBy('id')
                ->get()
                ->map(fn (UserCredential $entry): array => $this->metadata($entry))
                ->all(),
        ];
    }

    private function read(Request $request, ?string $id = null, bool $secret = false): JsonResponse
    {
        return DB::transaction(function () use ($request, $id, $secret): JsonResponse {
            $owner = User::query()
                ->whereKey($request->user()->id)
                ->sharedLock()
                ->firstOrFail();

            if ($id === null) {
                return $this->response($this->snapshot($owner));
            }

            $entry = $this->rows($owner)->whereKey($id)->firstOrFail();

            return $this->response([
                'revision' => (int) $owner->credentials_revision,
                ...($secret
                    ? ['password' => $entry->password ?? '']
                    : ['entry' => $this->metadata($entry)]),
            ]);
        });
    }

    private function write(Request $request, Closure $operation, bool $initialize = false): JsonResponse
    {
        $request->validate([
            'user_id' => ['prohibited'],
        ]);

        $revision = $initialize
            ? null
            : $request->validate([
                'revision' => ['required', 'integer', 'min:0'],
            ])['revision'];

        return DB::transaction(function () use ($request, $operation, $revision, $initialize): JsonResponse {
            $owner = User::query()
                ->whereKey($request->user()->id)
                ->lockForUpdate()
                ->firstOrFail();

            if (!$initialize && (int) $revision !== (int) $owner->credentials_revision) {
                return $this->response([
                    'code' => 'CREDENTIALS_REVISION_CONFLICT',
                    'current_revision' => (int) $owner->credentials_revision,
                ], 409);
            }

            if ($operation($owner) !== false) {
                DB::table('users')
                    ->where('id', $owner->id)
                    ->increment('credentials_revision');

                $owner->credentials_revision = (int) $owner->credentials_revision + 1;
            }

            return $this->response($this->snapshot($owner));
        });
    }

    private function fields(Request $request, bool $create): array
    {
        if (is_string($request->input('service'))) {
            $request->merge([
                'service' => trim($request->input('service')),
            ]);
        }

        return $request->validate([
            'user_id' => ['prohibited'],
            'service' => [$create ? 'required' : 'sometimes', 'required', 'string', 'max:100'],
            'login' => ['sometimes', 'nullable', 'string', 'max:255'],
            'password' => ['sometimes', 'nullable', 'string', 'max:1024'],
            'comment' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'url' => ['sometimes', 'nullable', 'url:http,https', 'max:2048'],
            'color' => ['sometimes', Rule::in(self::COLORS)],
        ]);
    }

    private function response(array $data, int $status = 200): JsonResponse
    {
        return response()
            ->json($data, $status)
            ->header('Cache-Control', 'no-store');
    }
}
