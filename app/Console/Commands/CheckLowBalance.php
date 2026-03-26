<?php

namespace App\Console\Commands;

use App\Models\Student;
use App\Notifications\LowBalanceNotification;
use Illuminate\Console\Command;

class CheckLowBalance extends Command
{
    protected $signature = 'students:check-low-balance {--threshold=5}';
    protected $description = 'Notify parents when student wallet balance is below threshold';

    public function handle(): int
    {
        $threshold = (float) $this->option('threshold');

        $students = Student::where('wallet_balance', '<', $threshold)
            ->where('wallet_balance', '>', 0)
            ->where('status', 'active')
            ->with('parent')
            ->get();

        $count = 0;
        foreach ($students as $student) {
            if ($student->parent) {
                $student->parent->notify(new LowBalanceNotification($student));
                $count++;
            }
        }

        $this->info("Sent low balance notifications to {$count} parents.");
        return 0;
    }
}
