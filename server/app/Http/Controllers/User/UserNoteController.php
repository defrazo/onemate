<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\User\User;
use App\Models\User\UserNote;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class UserNoteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return DB::transaction(function () use ($request): JsonResponse {
            $owner = User::query()->whereKey($request->user()->id)->sharedLock()->firstOrFail();

            return response()->json($this->snapshot($owner));
        });
    }

    public function initialize(Request $request): JsonResponse
    {
        $request->validate(['user_id' => ['required', 'uuid', Rule::in([$request->user()->id])]]);

        return DB::transaction(function () use ($request): JsonResponse {
            $owner = User::query()->whereKey($request->user()->id)->lockForUpdate()->firstOrFail();

            if (!$owner->notes()->exists() && (int) $owner->notes_revision === 0) {
                $texts = [
                    'Добро пожаловать! Это твоя первая заметка – можешь отредактировать или удалить ее.',
                    'Иногда полезно просто сесть и выписать мысли. Даже если они кажутся бессмысленными – в процессе часто приходит что-то дельное.',
                    'Хочу перечитать пару статей про привычки и планирование – кажется, я снова начинаю все откладывать.',
                    'Напоминание: выдохни. Сделай паузу, налей чай, и не забудь, что не все должно быть идеально.',
                ];

                $colors = ['slate', 'rose', 'amber', 'emerald', 'violet', 'lime', 'fuchsia', 'sky'];

                foreach ($texts as $index => $text) {
                    $owner->notes()->create(['text' => $text, 'color' => $colors[array_rand($colors)], 'order_idx' => $index]);
                }

                $this->incrementRevision($owner);
            }

            return response()->json($this->snapshot($owner));
        });
    }

    public function replace(Request $request): JsonResponse
    {
        $data = $request->validate([
            'user_id' => ['required', 'uuid', Rule::in([$request->user()->id])],
            'revision' => ['required', 'integer', 'min:0'],
            'notes' => ['required', 'array', 'min:1', 'max:50'],
            'notes.*.id' => ['required', 'uuid', 'distinct'],
            'notes.*.text' => ['present', 'nullable', 'string', 'max:2000'],
            'notes.*.color' => [
                'required',
                'string',
                Rule::in(['slate', 'rose', 'amber', 'emerald', 'violet', 'lime', 'fuchsia', 'sky']),
            ],
            'notes.*.order_idx' => ['required', 'integer', 'min:0'],
        ]);

        return DB::transaction(function () use ($request, $data): JsonResponse {
            $owner = User::query()->whereKey($request->user()->id)->lockForUpdate()->firstOrFail();

            if ((int) $data['revision'] !== (int) $owner->notes_revision) {
                return response()->json(['code' => 'NOTES_REVISION_CONFLICT', 'current_revision' => (int) $owner->notes_revision], 409);
            }

            $ids = array_column($data['notes'], 'id');

            if (UserNote::query()->whereIn('id', $ids)->where('user_id', '!=', $owner->id)->exists()) {
                throw ValidationException::withMessages(['notes' => 'Недопустимые идентификаторы заметок.']);
            }

            $existing = $owner->notes()->get()->keyBy('id');

            foreach (array_values($data['notes']) as $index => $input) {
                $note = $existing->get($input['id']) ?? $owner->notes()->make();
                $note->id = $input['id'];
                $note->fill(['text' => $input['text'] ?? '', 'color' => $input['color'], 'order_idx' => $index]);

                if (!$note->exists || $note->isDirty()) {
                    $note->save();
                }
            }

            $owner->notes()->whereNotIn('id', $ids)->delete();
            $this->incrementRevision($owner);

            return response()->json(['code' => 'NOTES_UPDATED', ...$this->snapshot($owner)]);
        });
    }

    private function incrementRevision(User $owner): void
    {
        DB::table('users')->where('id', $owner->id)->increment('notes_revision');
        $owner->notes_revision = (int) $owner->notes_revision + 1;
    }

    private function snapshot(User $owner): array
    {
        return [
            'user_id' => $owner->id,
            'revision' => (int) $owner->notes_revision,
            'notes' => $owner->notes()->orderBy('order_idx')->orderBy('id')->get(),
        ];
    }
}
