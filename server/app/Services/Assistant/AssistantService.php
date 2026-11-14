<?php

namespace App\Services\Assistant;

use App\AI\GenerationResult;
use App\Jobs\GenerateAssistantResponse;
use App\Models\Assistant\AiConversation;
use App\Models\Assistant\AiGeneration;
use App\Models\Assistant\AiMessage;
use App\Models\User\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Str;

class AssistantService
{
    private const RECOVERY_GRACE_SECONDS = 60;

    public function newConversation(User $user): array
    {
        return DB::transaction(function () use ($user) {
            $owner = $this->lockOwner($user);
            $conversation = $owner->aiConversations()->whereNull('archived_at')->lockForUpdate()->first();

            $this->assertNoGenerationInProgress($owner);

            if (!$conversation || !$conversation->messages()->exists()) {
                return ['archived_conversation_id' => null];
            }

            $conversation->update(['archived_at' => now()]);

            return ['archived_conversation_id' => $conversation->id];
        });
    }

    public function resumeConversation(User $user, string $id, ?string $expectedActiveId): array
    {
        $id = strtolower($id);
        $expectedActiveId = $expectedActiveId !== null ? strtolower($expectedActiveId) : null;

        return DB::transaction(function () use ($user, $id, $expectedActiveId) {
            $owner = $this->lockOwner($user);
            $conversations = $owner->aiConversations()
                ->where(fn ($query) => $query->where('id', $id)->orWhereNull('archived_at'))
                ->orderBy('id')->lockForUpdate()->get();
            $selected = $conversations->firstWhere('id', $id);
            abort_unless($selected, 404);

            $this->assertNoGenerationInProgress($owner);

            $active = $conversations->first(fn ($conversation) => $conversation->archived_at === null);

            if ($active?->id === $selected->id) {
                return $this->messagePage($selected, null);
            }

            if ($active?->id !== $expectedActiveId) {
                $this->conflict('ACTIVE_CONVERSATION_CHANGED', 'Активный диалог изменился. Обновите данные');
            }

            $active?->update(['archived_at' => now()]);
            $selected->update(['archived_at' => null]);

            return $this->messagePage($selected, null);
        });
    }

    public function archive(User $user, ?string $search): LengthAwarePaginator
    {
        return $user->aiConversations()->whereNotNull('archived_at')
            ->when($search !== null && $search !== '', fn ($query) => $query->where('title', 'ilike', '%' . addcslashes($search, '\\%_') . '%'))
            ->orderByRaw('(pinned_at IS NOT NULL) DESC')
            ->orderByDesc('last_activity_at')->orderByDesc('id')
            ->paginate(30)->withQueryString();
    }

    public function pinConversation(User $user, string $id, bool $pinned): AiConversation
    {
        return DB::transaction(function () use ($user, $id, $pinned) {
            $owner = $this->lockOwner($user);
            $conversation = $owner->aiConversations()->whereKey($id)->lockForUpdate()->firstOrFail();
            $this->assertArchived($conversation);

            if (($conversation->pinned_at !== null) !== $pinned) {
                $conversation->update(['pinned_at' => $pinned ? now() : null]);
            }

            return $conversation;
        });
    }

    public function deleteConversation(User $user, string $id): void
    {
        DB::transaction(function () use ($user, $id) {
            $owner = $this->lockOwner($user);
            $conversation = $owner->aiConversations()->whereKey($id)->lockForUpdate()->firstOrFail();
            $this->assertArchived($conversation);

            if ($conversation->generations()->whereNull('execution_finished_at')->exists()) {
                $this->conflict('GENERATION_IN_PROGRESS', 'Дождитесь завершения текущей генерации');
            }

            $conversation->delete();
        });
    }

    public function cleanupArchives(): void
    {
        User::whereHas('aiConversations', fn ($query) => $query->whereNotNull('archived_at'))
            ->select('id')->chunkById(100, function ($users) {
                foreach ($users as $user) {
                    do {
                        $removed = $this->cleanupArchive($user);
                    } while ($removed === 100);
                }
            });
    }

    public function cleanupArchive(User $user): int
    {
        return DB::transaction(function () use ($user) {
            $owner = User::whereKey($user->getKey())->lockForUpdate()->first();

            if (!$owner) {
                return 0;
            }

            $excess = $owner->aiConversations()->whereNotNull('archived_at')->count() - 100;

            if ($excess <= 0) {
                return 0;
            }

            $candidates = $owner->aiConversations()->whereNotNull('archived_at')->whereNull('pinned_at')
                ->whereDoesntHave('generations', fn ($query) => $query->whereNull('execution_finished_at'))
                ->orderBy('last_activity_at')->orderBy('id')->limit(min(100, $excess))
                ->lockForUpdate()->get(['id']);

            return $owner->aiConversations()->whereIn('id', $candidates->modelKeys())->delete();
        });
    }

    private function assertArchived(AiConversation $conversation): void
    {
        if ($conversation->archived_at === null) {
            $this->conflict('CONVERSATION_NOT_ARCHIVED', 'Операция доступна только для архивного диалога');
        }
    }

    public function send(User $user, array $data): AiGeneration
    {
        $expected = isset($data['conversation_id']) ? strtolower($data['conversation_id']) : null;
        $requestId = strtolower($data['request_id']);
        $searchEnabled = (bool) ($data['search_enabled'] ?? false);
        $fingerprint = $this->fingerprint([
            'conversation_id' => $expected,
            'mode' => $data['mode'],
            'content' => $data['content'],
        ]);

        return DB::transaction(function () use ($user, $data, $expected, $requestId, $fingerprint, $searchEnabled) {
            $owner = $this->lockOwner($user);
            $existing = $owner->aiGenerations()->where('request_id', $requestId)->first();

            if ($existing) {
                $owner->aiConversations()->whereKey($existing->conversation_id)->lockForUpdate()->firstOrFail();
                $existing = $owner->aiGenerations()->whereKey($existing->id)->lockForUpdate()->firstOrFail();

                if (!hash_equals($existing->fingerprint, $fingerprint) || (bool) $existing->search_enabled !== $searchEnabled) {
                    $this->conflict('REQUEST_ID_CONFLICT', 'Этот request_id уже использован для другого запроса');
                }

                return $existing->load(['userMessage', 'responseMessage.answerGeneration']);
            }

            if ($expected !== null && !$owner->aiConversations()->whereKey($expected)->exists()) {
                abort(404);
            }

            $conversation = $owner->aiConversations()->whereNull('archived_at')->lockForUpdate()->first();

            if ($conversation?->id !== $expected) {
                $this->conflict('ACTIVE_CONVERSATION_CHANGED', 'Активный диалог изменился. Обновите данные');
            }

            $this->assertNoGenerationInProgress($owner);

            if (!$conversation) {
                $conversation = $owner->aiConversations()->create([
                    'title' => mb_substr(preg_replace('/\s+/u', ' ', $data['content']), 0, 255),
                    'last_activity_at' => now(),
                ]);
            }

            $question = $conversation->messages()->create([
                'sequence' => ($conversation->messages()->max('sequence') ?? 0) + 1,
                'role' => AiMessage::ROLE_USER,
                'content' => $data['content'],
            ]);

            return $this->enqueue($owner, $question, $requestId, $fingerprint, $data['mode'], config('ai.provider'), config('ai.model'), $searchEnabled);
        });
    }

    public function cancel(User $user, string $id): AiGeneration
    {
        return DB::transaction(function () use ($user, $id) {
            $generation = $this->lockGeneration($id, $user->getKey());
            abort_unless($generation, 404);

            if (in_array($generation->status, [AiGeneration::STATUS_QUEUED, AiGeneration::STATUS_RUNNING], true)) {
                $generation->update([
                    'status' => AiGeneration::STATUS_CANCELLED,
                    'cancelled_at' => now(),
                    'completed_at' => now(),
                    'execution_finished_at' => $generation->status === AiGeneration::STATUS_QUEUED ? now() : null,
                ]);
            }

            return $generation->load('responseMessage.answerGeneration');
        });
    }

    public function retry(User $user, string $id, string $requestId): AiGeneration
    {
        $requestId = strtolower($requestId);

        return DB::transaction(function () use ($user, $id, $requestId) {
            $source = $this->lockGeneration($id, $user->getKey());
            abort_unless($source, 404);
            $owner = $source->user;
            $conversation = $source->conversation;

            if ($conversation->archived_at !== null) {
                $this->conflict('CONVERSATION_ARCHIVED', 'Архивный диалог доступен только для чтения');
            }

            $question = $source->userMessage;
            abort_unless($question && $question->conversation_id === $conversation->id
                && $question->role === AiMessage::ROLE_USER, 409, 'Некорректный исходный вопрос');

            $fingerprint = $this->fingerprint([
                'operation' => 'retry',
                'generation_id' => $source->id,
                'conversation_id' => $conversation->id,
                'mode' => $source->mode,
                'content' => $question->content,
            ]);
            $existing = $owner->aiGenerations()->where('request_id', $requestId)->first();

            if ($existing) {
                if (!hash_equals($existing->fingerprint, $fingerprint) || (bool) $existing->search_enabled !== (bool) $source->search_enabled) {
                    $this->conflict('REQUEST_ID_CONFLICT', 'Этот request_id уже использован для другого запроса');
                }

                return $owner->aiGenerations()->whereKey($existing->id)->lockForUpdate()->firstOrFail()
                    ->load(['userMessage', 'responseMessage.answerGeneration']);
            }

            if (!in_array($source->status, [AiGeneration::STATUS_FAILED, AiGeneration::STATUS_CANCELLED], true)) {
                $this->conflict('GENERATION_NOT_RETRYABLE', 'Повтор доступен только для неуспешной или отменённой генерации');
            }

            $this->assertNoGenerationInProgress($owner);

            if ($owner->aiGenerations()->where('user_message_id', $question->id)
                ->where('status', AiGeneration::STATUS_SUCCEEDED)->exists()) {
                $this->conflict('QUESTION_ALREADY_ANSWERED', 'Для этого вопроса уже сохранён успешный ответ');
            }

            return $this->enqueue($owner, $question, $requestId, $fingerprint, $source->mode, $source->provider, $source->model, (bool) $source->search_enabled);
        });
    }

    public function regenerate(User $user, string $id, string $requestId, bool $searchEnabled = false): AiGeneration
    {
        $requestId = strtolower($requestId);

        return DB::transaction(function () use ($user, $id, $requestId, $searchEnabled) {
            $source = $this->lockGeneration($id, $user->getKey());
            abort_unless($source, 404);
            $owner = $source->user;
            $conversation = $source->conversation;

            if ($conversation->archived_at !== null) {
                $this->conflict('CONVERSATION_ARCHIVED', 'Архивный диалог доступен только для чтения');
            }

            $question = $source->userMessage;
            abort_unless($question && $question->conversation_id === $conversation->id
                && $question->role === AiMessage::ROLE_USER, 409, 'Некорректный исходный вопрос');

            $fingerprint = $this->fingerprint([
                'operation' => 'regenerate',
                'generation_id' => $source->id,
                'conversation_id' => $conversation->id,
                'mode' => $source->mode,
                'content' => $question->content,
            ]);
            $existing = $owner->aiGenerations()->where('request_id', $requestId)->first();

            if ($existing) {
                if (!hash_equals($existing->fingerprint, $fingerprint) || (bool) $existing->search_enabled !== $searchEnabled) {
                    $this->conflict('REQUEST_ID_CONFLICT', 'Этот request_id уже использован для другого запроса');
                }

                return $owner->aiGenerations()->whereKey($existing->id)->lockForUpdate()->firstOrFail()
                    ->load(['userMessage', 'responseMessage.answerGeneration']);
            }

            $this->assertNoGenerationInProgress($owner);

            $lastAnswer = $conversation->messages()->reorder()->where('role', AiMessage::ROLE_ASSISTANT)
                ->whereNotNull('reply_to_message_id')->orderByDesc('sequence')->first();
            $answered = $conversation->generations()->where('user_message_id', $question->id)
                ->where('status', AiGeneration::STATUS_SUCCEEDED)->whereNotNull('response_message_id')->exists();

            if (!$answered || !$lastAnswer || $lastAnswer->reply_to_message_id !== $question->id) {
                $this->conflict('GENERATION_NOT_REGENERATABLE', 'Можно заново сгенерировать только последний успешный ответ');
            }

            return $this->enqueue($owner, $question, $requestId, $fingerprint, $source->mode, $source->provider, $source->model, $searchEnabled);
        });
    }

    public function show(User $user, string $id): AiGeneration
    {
        return DB::transaction(function () use ($user, $id) {
            $owner = User::whereKey($user->getKey())->sharedLock()->firstOrFail();
            $locator = $owner->aiGenerations()->whereKey($id)->firstOrFail();
            $owner->aiConversations()->whereKey($locator->conversation_id)->sharedLock()->firstOrFail();

            return $owner->aiGenerations()->whereKey($id)->sharedLock()->firstOrFail()->load('responseMessage.answerGeneration');
        });
    }

    public function active(User $user): array
    {
        return DB::transaction(function () use ($user) {
            $owner = User::whereKey($user->getKey())->sharedLock()->firstOrFail();
            $conversation = $owner->aiConversations()->whereNull('archived_at')->sharedLock()->first();

            if (!$conversation) {
                return [
                    'conversation' => null,
                    'messages' => [],
                    'generations' => [],
                    'pending_generation' => null,
                    'pagination' => ['has_more' => false, 'before_sequence' => null],
                ];
            }

            return $this->messagePage($conversation, null);
        });
    }

    public function messages(User $user, string $id, ?int $before): array
    {
        return DB::transaction(function () use ($user, $id, $before) {
            $owner = User::whereKey($user->getKey())->sharedLock()->firstOrFail();
            $conversation = $owner->aiConversations()->whereKey($id)->sharedLock()->firstOrFail();

            return $this->messagePage($conversation, $before);
        });
    }

    private function messagePage(AiConversation $conversation, ?int $before): array
    {
        $batch = $conversation->messages()->reorder()
            ->when($before !== null, fn ($query) => $query->where('sequence', '<', $before))
            ->orderByDesc('sequence')->limit(31)->with('answerGeneration')->get();
        $hasMore = $batch->count() > 30;
        $messages = $batch->take(30)->reverse()->values();
        $questionIds = $messages->where('role', AiMessage::ROLE_USER)->pluck('id')
            ->merge($messages->pluck('reply_to_message_id')->filter())->unique()->values();
        $generations = $conversation->generations()->whereIn('user_message_id', $questionIds)
            ->distinct('user_message_id')->orderBy('user_message_id')->orderByDesc('created_at')->orderByDesc('id')
            ->with('responseMessage.answerGeneration')->get();
        $pending = $conversation->generations()->whereNull('execution_finished_at')
            ->orderByDesc('created_at')->orderByDesc('id')->with('responseMessage.answerGeneration')->first();

        return [
            'conversation' => $conversation,
            'messages' => $messages,
            'generations' => $generations,
            'pending_generation' => $pending,
            'pagination' => [
                'has_more' => $hasMore,
                'before_sequence' => $hasMore ? $messages->first()->sequence : null,
            ],
        ];
    }

    public function claim(string $id): ?AiGeneration
    {
        return DB::transaction(function () use ($id) {
            $generation = $this->lockGeneration($id);

            if (!$generation || $generation->status !== AiGeneration::STATUS_QUEUED
                || $generation->execution_finished_at !== null) {
                return null;
            }

            if ($generation->execution_deadline_at->isPast()) {
                $this->markFailed($generation, 'QUEUE_TIMEOUT');

                return null;
            }

            $question = $generation->userMessage;
            $conversation = $generation->conversation;

            if ($generation->user->role === 'demo' || $generation->user->deleted_at !== null
                || !$question || $question->role !== AiMessage::ROLE_USER
                || $question->conversation_id !== $conversation->id || $conversation->archived_at !== null) {
                $this->markFailed($generation, 'INVALID_CONTEXT');

                return null;
            }

            $generation->update([
                'status' => AiGeneration::STATUS_RUNNING,
                'execution_id' => (string) Str::uuid(),
                'started_at' => now(),
                'request_started_at' => now(),
                'execution_deadline_at' => now()->addSeconds(30),
            ]);

            return $generation;
        });
    }

    public function complete(AiGeneration $attempt, GenerationResult $result): void
    {
        DB::transaction(function () use ($attempt, $result) {
            $generation = $this->lockGeneration($attempt->id);

            if (!$this->isCurrent($generation, $attempt)) {
                return;
            }

            if ($generation->execution_deadline_at->isPast()) {
                $this->markFailed($generation, 'EXECUTION_TIMEOUT');

                return;
            }

            if (trim($result->text) === '') {
                $this->markFailed($generation, 'INVALID_RESPONSE');

                return;
            }

            $conversation = $generation->conversation;
            $answer = $conversation->messages()->where('role', AiMessage::ROLE_ASSISTANT)
                ->where('reply_to_message_id', $generation->user_message_id)->first();

            if ($answer) {
                $answer->update(['content' => $result->text]);
            } else {
                $answer = $conversation->messages()->create([
                    'sequence' => ($conversation->messages()->max('sequence') ?? 0) + 1,
                    'role' => AiMessage::ROLE_ASSISTANT,
                    'content' => $result->text,
                    'reply_to_message_id' => $generation->user_message_id,
                ]);
            }

            $generation->update([
                'response_message_id' => $answer->id,
                'actual_model' => $result->model,
                'search_executed' => $result->searchExecuted,
                'sources' => $result->sources,
                'input_tokens' => $result->inputTokens,
                'output_tokens' => $result->outputTokens,
                'total_tokens' => $result->totalTokens,
                'duration_ms' => $result->durationMs,
                'status' => AiGeneration::STATUS_SUCCEEDED,
                'completed_at' => now(),
                'execution_finished_at' => now(),
            ]);
            $conversation->update(['last_activity_at' => now()]);
        });
    }

    public function fail(AiGeneration $attempt, string $code): void
    {
        DB::transaction(function () use ($attempt, $code) {
            $generation = $this->lockGeneration($attempt->id);

            if ($this->isCurrent($generation, $attempt)) {
                $this->markFailed($generation, $code);
            }
        });
    }

    public function interrupted(string $id): void
    {
        $this->recover($id, true);
    }

    public function finishCancelled(AiGeneration $attempt): void
    {
        DB::transaction(function () use ($attempt) {
            $generation = $this->lockGeneration($attempt->id);

            if ($generation && $generation->status === AiGeneration::STATUS_CANCELLED
                && $generation->execution_finished_at === null && $generation->execution_id === $attempt->execution_id) {
                $generation->update(['execution_finished_at' => now()]);
            }
        });
    }

    public function recoverExpired(): void
    {
        AiGeneration::whereNull('execution_finished_at')
            ->whereIn('status', [AiGeneration::STATUS_QUEUED, AiGeneration::STATUS_RUNNING, AiGeneration::STATUS_CANCELLED])
            ->where('execution_deadline_at', '<=', now()->subSeconds(self::RECOVERY_GRACE_SECONDS))
            ->select('id')
            ->chunkById(100, function ($generations) {
                foreach ($generations as $generation) {
                    $this->recover($generation->id);
                }
            });
    }

    private function recover(string $id, bool $interrupted = false): void
    {
        DB::transaction(function () use ($id, $interrupted) {
            $generation = $this->lockGeneration($id);

            if (!$generation || $generation->execution_finished_at !== null) {
                return;
            }

            $expired = $generation->execution_deadline_at->lte(now()->subSeconds(self::RECOVERY_GRACE_SECONDS));

            if ($generation->status === AiGeneration::STATUS_QUEUED && ($expired || $interrupted)) {
                $this->markFailed($generation, $interrupted ? 'EXECUTION_INTERRUPTED' : 'QUEUE_TIMEOUT');
            } elseif ($expired && $generation->status === AiGeneration::STATUS_RUNNING) {
                $this->markFailed($generation, 'EXECUTION_INTERRUPTED');
            } elseif ($expired && $generation->status === AiGeneration::STATUS_CANCELLED) {
                $generation->update([
                    'execution_finished_at' => now(),
                    'error_code' => 'EXECUTION_INTERRUPTED',
                ]);
            }
        });
    }

    private function lockOwner(User $user): User
    {
        return User::whereKey($user->getKey())->lockForUpdate()->firstOrFail();
    }

    private function assertNoGenerationInProgress(User $owner): void
    {
        if ($owner->aiGenerations()->whereNull('execution_finished_at')->exists()) {
            $this->conflict('GENERATION_IN_PROGRESS', 'Дождитесь завершения текущей генерации');
        }
    }

    private function fingerprint(array $data): string
    {
        return hash('sha256', json_encode(
            $data,
            JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR,
        ));
    }

    private function enqueue(User $owner, AiMessage $question, string $requestId, string $fingerprint, string $mode, string $provider, string $model, bool $searchEnabled): AiGeneration
    {
        $queueDatabase = config('queue.connections.database.connection') ?? config('database.default');
        abort_unless(config('queue.connections.database.driver') === 'database'
            && $queueDatabase === DB::connection()->getName(), 503, 'Генерация временно недоступна');

        $conversation = $question->conversation;
        $generation = $conversation->generations()->make([
            'user_message_id' => $question->id,
            'request_id' => $requestId,
            'fingerprint' => $fingerprint,
            'mode' => $mode,
            'provider' => $provider,
            'model' => $model,
            'status' => AiGeneration::STATUS_QUEUED,
            'search_enabled' => $searchEnabled,
            'queued_at' => now(),
            'execution_deadline_at' => now()->addMinutes(5),
        ]);
        $generation->user_id = $owner->id;
        $generation->save();
        $conversation->update(['last_activity_at' => now()]);

        Queue::connection('database')->push((new GenerateAssistantResponse($generation->id))->beforeCommit());

        return $generation->load(['userMessage', 'responseMessage.answerGeneration']);
    }

    private function lockGeneration(string $id, ?string $userId = null): ?AiGeneration
    {
        $locator = AiGeneration::when($userId !== null, fn ($query) => $query->where('user_id', $userId))->find($id);

        if (!$locator) {
            return null;
        }

        $owner = User::whereKey($locator->user_id)->lockForUpdate()->first();

        if (!$owner) {
            return null;
        }

        $conversation = $owner->aiConversations()->whereKey($locator->conversation_id)->lockForUpdate()->first();

        if (!$conversation) {
            return null;
        }

        $generation = $owner->aiGenerations()->where('conversation_id', $conversation->id)->whereKey($id)->lockForUpdate()->first();

        return $generation?->setRelation('user', $owner)->setRelation('conversation', $conversation);
    }

    private function isCurrent(?AiGeneration $generation, AiGeneration $attempt): bool
    {
        return $generation !== null && $generation->status === AiGeneration::STATUS_RUNNING
            && $generation->execution_finished_at === null && $generation->execution_id === $attempt->execution_id;
    }

    private function markFailed(AiGeneration $generation, string $code): void
    {
        $generation->update([
            'status' => AiGeneration::STATUS_FAILED,
            'error_code' => $code,
            'completed_at' => now(),
            'execution_finished_at' => now(),
        ]);
    }

    private function conflict(string $code, string $message): never
    {
        abort(response()->json(['code' => $code, 'message' => $message], 409));
    }
}
