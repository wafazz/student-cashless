<?php

namespace App\Notifications;

use App\Models\School;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SubscriptionExpiryNotification extends Notification
{
    use Queueable;

    public function __construct(private School $school, private string $type) {}

    public function via($notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toArray($notifiable): array
    {
        if ($this->type === 'expired') {
            return [
                'title' => 'Subscription Expired',
                'message' => "{$this->school->name}'s subscription has expired and been deactivated.",
                'school_id' => $this->school->id,
            ];
        }

        return [
            'title' => 'Subscription Expiring Soon',
            'message' => "{$this->school->name}'s subscription expires on {$this->school->subscription_end->format('d M Y')}. Please renew.",
            'school_id' => $this->school->id,
        ];
    }

    public function toMail($notifiable): MailMessage
    {
        if ($this->type === 'expired') {
            return (new MailMessage)
                ->subject("Subscription Expired - {$this->school->name}")
                ->line("{$this->school->name}'s subscription has expired.")
                ->line('The school has been automatically deactivated.')
                ->action('Manage Schools', url('/admin/schools'));
        }

        return (new MailMessage)
            ->subject("Subscription Expiring Soon - {$this->school->name}")
            ->line("{$this->school->name}'s subscription will expire on {$this->school->subscription_end->format('d M Y')}.")
            ->action('Renew Now', url('/admin/schools'))
            ->line('Please renew to avoid service interruption.');
    }
}
