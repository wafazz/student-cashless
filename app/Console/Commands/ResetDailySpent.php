<?php

namespace App\Console\Commands;

use App\Models\Student;
use Illuminate\Console\Command;

class ResetDailySpent extends Command
{
    protected $signature = 'students:reset-daily-spent';
    protected $description = 'Reset daily spent counters for all students at midnight';

    public function handle(): int
    {
        $count = Student::where('daily_spent_canteen', '>', 0)
            ->orWhere('daily_spent_koperasi', '>', 0)
            ->update(['daily_spent_canteen' => 0, 'daily_spent_koperasi' => 0]);
        $this->info("Reset daily spent for {$count} students.");
        return 0;
    }
}
