<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DailySpendingSummary extends Notification
{
    use Queueable;

    public function __construct(private array $summary) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'title' => 'Daily Spending Summary',
            'message' => $this->summary['message'],
            'data' => $this->summary['students'],
        ];
    }
}
