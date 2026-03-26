<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('students:reset-daily-spent')->dailyAt('00:00');
Schedule::command('students:check-low-balance --threshold=5')->dailyAt('08:00');
Schedule::command('schools:check-subscription')->dailyAt('01:00');
Schedule::command('invoices:generate')->monthlyOn(1, '02:00');
