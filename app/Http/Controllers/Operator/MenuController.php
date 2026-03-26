<?php

namespace App\Http\Controllers\Operator;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MenuController extends Controller
{
    public function index()
    {
        $canteen = auth()->user()->getCanteenForWork();

        if (!$canteen) {
            return Inertia::render('operator/Menu', [
                'canteen' => null,
                'menuItems' => [],
            ]);
        }

        $menuItems = $canteen->menuItems()->orderBy('category')->orderBy('name')->get();

        return Inertia::render('operator/Menu', [
            'canteen' => $canteen,
            'menuItems' => $menuItems,
        ]);
    }

    public function store(Request $request)
    {
        $canteen = auth()->user()->getCanteenForWork();
        if (!$canteen) {
            return back()->with('error', 'No store assigned.');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0.10',
            'category' => 'nullable|string|max:100',
        ]);

        $canteen->menuItems()->create($request->only(['name', 'price', 'category']));

        return back()->with('success', 'Menu item added.');
    }

    public function update(Request $request, MenuItem $menuItem)
    {
        $canteen = auth()->user()->getCanteenForWork();
        if (!$canteen || $menuItem->canteen_id !== $canteen->id) {
            abort(403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0.10',
            'category' => 'nullable|string|max:100',
            'is_available' => 'boolean',
        ]);

        $menuItem->update($request->only(['name', 'price', 'category', 'is_available']));

        return back()->with('success', 'Menu item updated.');
    }

    public function destroy(MenuItem $menuItem)
    {
        $canteen = auth()->user()->getCanteenForWork();
        if (!$canteen || $menuItem->canteen_id !== $canteen->id) {
            abort(403);
        }

        $menuItem->delete();

        return back()->with('success', 'Menu item deleted.');
    }
}
