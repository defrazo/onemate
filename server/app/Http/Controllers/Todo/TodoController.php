<?php

namespace App\Http\Controllers\Todo;

use App\Http\Controllers\Controller;
use App\Http\Requests\Todo\TodoRequest;
use App\Models\Todo\TodoCanvas;
use App\Models\Todo\TodoItem;
use App\Models\Todo\TodoList;
use App\Models\User\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class TodoController extends Controller
{
    // Serialize writes per owner, including initialization and capacity checks.
    private function transact(TodoRequest $request, callable $operation, int $status = 200): JsonResponse
    {
        $canvases = DB::transaction(function () use ($request, $operation) {
            User::whereKey($request->user()->getKey())->lockForUpdate()->firstOrFail();
            $operation();

            return $request->user()->todoCanvases()->with('lists.items')->orderBy('created_at')->orderBy('id')->get();
        }, 3);

        return response()->json(['canvases' => $canvases], $status);
    }

    private function canvas(TodoRequest $request, string $id): TodoCanvas
    {
        return $request->user()->todoCanvases()->findOrFail($id);
    }

    private function list(TodoRequest $request, string $id): TodoList
    {
        return TodoList::whereHas('canvas', fn ($query) => $query->where('user_id', $request->user()->getKey()))->findOrFail($id);
    }

    private function item(TodoRequest $request, string $id): TodoItem
    {
        return TodoItem::whereHas('list.canvas', fn ($query) => $query->where('user_id', $request->user()->getKey()))->findOrFail($id);
    }

    public function index(TodoRequest $request): JsonResponse
    {
        return $this->transact($request, function () use ($request) {
            if ($request->user()->todoCanvases()->exists()) {
                return;
            }
            $canvas = $request->user()->todoCanvases()->create(['title' => 'Общее']);

            foreach (['На сегодня' => ['Записать первую задачу', 'Отметить выполненный пункт'], 'Идеи' => ['Добавить свой список', 'Распланировать неделю']] as $title => $texts) {
                $list = $canvas->lists()->create(['title' => $title, 'color' => 'slate', 'slot' => $canvas->lists()->count()]);

                foreach ($texts as $position => $text) {
                    $list->items()->create(compact('text', 'position'));
                }
            }
        });
    }

    public function storeCanvas(TodoRequest $request): JsonResponse
    {
        return $this->transact($request, function () use ($request) {
            abort_if($request->user()->todoCanvases()->count() >= 5, 409, 'Максимум 5 холстов');
            $request->user()->todoCanvases()->create($request->validated());
        }, 201);
    }

    public function updateCanvas(TodoRequest $request, string $canvas): JsonResponse
    {
        return $this->transact($request, fn () => $this->canvas($request, $canvas)->update($request->validated()));
    }

    public function destroyCanvas(TodoRequest $request, string $canvas): JsonResponse
    {
        return $this->transact($request, function () use ($request, $canvas) {
            $model = $this->canvas($request, $canvas);
            abort_if($request->user()->todoCanvases()->count() <= 1, 409, 'Нельзя удалить последний холст');
            $model->delete();
        });
    }

    public function storeList(TodoRequest $request, string $canvas): JsonResponse
    {
        return $this->transact($request, function () use ($request, $canvas) {
            $model = $this->canvas($request, $canvas);
            $slots = $model->lists()->pluck('slot')->all();
            $free = array_values(array_diff(range(0, 15), $slots));
            abort_if($free === [], 409, 'Максимум 16 списков');
            $model->lists()->create([...$request->validated(), 'slot' => $free[0]]);
        }, 201);
    }

    public function updateList(TodoRequest $request, string $list): JsonResponse
    {
        return $this->transact($request, fn () => $this->list($request, $list)->update($request->validated()));
    }

    public function destroyList(TodoRequest $request, string $list): JsonResponse
    {
        return $this->transact($request, fn () => $this->list($request, $list)->delete());
    }

    public function moveList(TodoRequest $request, string $list): JsonResponse
    {
        return $this->transact($request, function () use ($request, $list) {
            $model = $this->list($request, $list);
            $slot = (int) $request->validated('slot');

            if ($model->slot === $slot) {
                return;
            }
            $other = TodoList::where('canvas_id', $model->canvas_id)->where('slot', $slot)->first();
            $oldSlot = $model->slot;
            $model->update(['slot' => null]);
            $other?->update(['slot' => $oldSlot]);
            $model->update(['slot' => $slot]);
        });
    }

    public function storeItem(TodoRequest $request, string $list): JsonResponse
    {
        return $this->transact($request, function () use ($request, $list) {
            $model = $this->list($request, $list);
            abort_if($model->items()->count() >= 25, 409, 'Максимум 25 пунктов');
            $model->items()->create([...$request->validated(), 'position' => ($model->items()->max('position') ?? -1) + 1]);
        }, 201);
    }

    public function updateItem(TodoRequest $request, string $item): JsonResponse
    {
        return $this->transact($request, fn () => $this->item($request, $item)->update($request->validated()));
    }

    public function destroyItem(TodoRequest $request, string $item): JsonResponse
    {
        return $this->transact($request, function () use ($request, $item) {
            $model = $this->item($request, $item);
            $list = $model->list;
            $model->delete();
            $this->positions($list->items()->pluck('id')->all());
        });
    }

    private function positions(array $ids): void
    {
        foreach ($ids as $position => $id) {
            TodoItem::whereKey($id)->update(['position' => $position]);
        }
    }

    public function reorderItems(TodoRequest $request, string $list): JsonResponse
    {
        return $this->transact($request, function () use ($request, $list) {
            $existing = $this->list($request, $list)->items()->pluck('id')->all();
            $ids = $request->validated('item_ids');
            abort_if(count($ids) !== count($existing) || array_diff($existing, $ids) !== [], 409, 'Состав списка изменился');
            $this->positions($ids);
        });
    }

    public function moveItem(TodoRequest $request, string $item): JsonResponse
    {
        return $this->transact($request, function () use ($request, $item) {
            $model = $this->item($request, $item);
            $source = $model->list;
            $target = $this->list($request, $request->validated('list_id'));
            $ids = $target->items()->where('id', '!=', $model->id)->pluck('id')->all();
            abort_if(count($ids) >= 25, 409, 'Максимум 25 пунктов');
            $position = (int) $request->validated('position');
            abort_if($position > count($ids), 409, 'Позиция больше размера списка');
            array_splice($ids, $position, 0, [$model->id]);
            $model->list()->associate($target);
            $model->save();
            $this->positions($ids);

            if ($source->id !== $target->id) {
                $this->positions($source->items()->pluck('id')->all());
            }
        });
    }
}
