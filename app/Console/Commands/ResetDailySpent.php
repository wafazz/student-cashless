<?php

namespace App\Console\Commands;

use App\Models\Student;
use Illuminate\Console\Command;

class ResetDailySpent extends Command
{
    protected $signature = 'students:reset-daily-spent';
    protected $description = 'Reset daily_spent to 0 for all students at midnight';

    public function handle(): int
    {
        $count = Student::where('daily_spent', '>', 0)->update(['daily_spent' => 0]);
        $this->info("Reset daily_spent for {$count} students.");
        return 0;
    }
}
