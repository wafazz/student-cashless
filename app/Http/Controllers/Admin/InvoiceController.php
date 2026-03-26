<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $query = Invoice::with('school')->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('school_id')) {
            $query->where('school_id', $request->school_id);
        }

        $invoices = $query->paginate(20)->withQueryString();

        $stats = [
            'total_unpaid' => Invoice::where('status', 'unpaid')->sum('amount'),
            'total_overdue' => Invoice::where('status', 'overdue')->sum('amount'),
            'total_paid' => Invoice::where('status', 'paid')->sum('amount'),
        ];

        return Inertia::render('admin/Invoices', [
            'invoices' => $invoices,
            'stats' => $stats,
            'filters' => $request->only(['status', 'school_id']),
        ]);
    }

    public function update(Request $request, Invoice $invoice)
    {
        $request->validate([
            'status' => 'required|in:paid,unpaid,overdue',
            'notes' => 'nullable|string|max:1000',
        ]);

        $data = ['status' => $request->status, 'notes' => $request->notes];

        if ($request->status === 'paid' && $invoice->status !== 'paid') {
            $data['paid_at'] = now();
        }

        $invoice->update($data);

        return back()->with('success', 'Invoice updated.');
    }
}
