<?php

namespace App\Console\Commands;

use App\Models\School;
use Illuminate\Console\Command;

class ActivateSubscriptions extends Command
{
    protected $signature = 'subscriptions:activate';
    protected $description = 'Activate paid subscriptions that start today (flip trial → active on 1st of month)';

    public function handle(): int
    {
        // Find schools on trial that have a paid package and subscription_start is today or past
        $schools = School::where('subscription_status', 'trial')
            ->whereNotNull('package_id')
            ->whereHas('package', fn($q) => $q->where('billing_cycle', '!=', 'trial'))
            ->where('subscription_start', '<=', now()->startOfDay())
            ->get();

        $count = 0;
        foreach ($schools as $school) {
            $school->update(['subscription_status' => 'active']);
            $count++;
        }

        $this->info("Activated {$count} subscriptions.");
        return 0;
    }
}
