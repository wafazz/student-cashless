<?php

namespace App\Console\Commands;

use App\Models\School;
use App\Models\User;
use App\Notifications\SubscriptionExpiryNotification;
use Illuminate\Console\Command;

class CheckSubscriptionExpiry extends Command
{
    protected $signature = 'schools:check-subscription';
    protected $description = 'Auto-disable expired subscriptions and send renewal reminders';

    public function handle(): int
    {
        $today = now()->toDateString();
        $reminderDate = now()->addDays(7)->toDateString();

        // Auto-disable expired subscriptions
        $expired = School::where('subscription_status', 'active')
            ->whereNotNull('subscription_end')
            ->where('subscription_end', '<', $today)
            ->get();

        foreach ($expired as $school) {
            $school->update(['subscription_status' => 'inactive']);
            $this->notifyAdmins($school, 'expired');
        }

        $this->info("Disabled {$expired->count()} expired subscriptions.");

        // Send renewal reminders (7 days before expiry)
        $expiringSoon = School::where('subscription_status', 'active')
            ->whereNotNull('subscription_end')
            ->whereDate('subscription_end', $reminderDate)
            ->get();

        foreach ($expiringSoon as $school) {
            $this->notifyAdmins($school, 'expiring_soon');
        }

        $this->info("Sent {$expiringSoon->count()} renewal reminders.");

        return 0;
    }

    private function notifyAdmins(School $school, string $type): void
    {
        $admins = User::where('role', 'admin')->where('status', 'active')->get();
        foreach ($admins as $admin) {
            $admin->notify(new SubscriptionExpiryNotification($school, $type));
        }
    }
}
