<?php

namespace App\Console\Commands;

use App\Models\Invoice;
use App\Models\School;
use Illuminate\Console\Command;

class GenerateMonthlyInvoices extends Command
{
    protected $signature = 'invoices:generate';
    protected $description = 'Generate monthly invoices for all active subscriptions';

    public function handle(): int
    {
        $schools = School::where('subscription_status', 'active')
            ->where('subscription_fee', '>', 0)
            ->get();

        $count = 0;
        $periodStart = now()->startOfMonth()->toDateString();
        $periodEnd = now()->endOfMonth()->toDateString();

        foreach ($schools as $school) {
            // Skip if invoice already exists for this period
            $exists = Invoice::where('school_id', $school->id)
                ->where('period_start', $periodStart)
                ->exists();

            if ($exists) {
                continue;
            }

            $invoiceNumber = 'INV-' . now()->format('Ym') . '-' . str_pad($school->id, 4, '0', STR_PAD_LEFT);

            Invoice::create([
                'school_id' => $school->id,
                'invoice_number' => $invoiceNumber,
                'amount' => $school->subscription_fee,
                'period_start' => $periodStart,
                'period_end' => $periodEnd,
                'due_date' => now()->endOfMonth()->addDays(14)->toDateString(),
                'status' => 'unpaid',
            ]);

            $count++;
        }

        $this->info("Generated {$count} invoices.");

        // Mark overdue invoices
        $overdue = Invoice::where('status', 'unpaid')
            ->where('due_date', '<', now()->toDateString())
            ->update(['status' => 'overdue']);

        $this->info("Marked {$overdue} invoices as overdue.");

        return 0;
    }
}
