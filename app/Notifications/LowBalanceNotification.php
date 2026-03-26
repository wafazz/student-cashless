<?php

namespace App\Notifications;

use App\Models\Student;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LowBalanceNotification extends Notification
{
    use Queueable;

    public function __construct(private Student $student) {}

    public function via($notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toArray($notifiable): array
    {
        return [
            'title' => 'Low Balance Alert',
            'message' => $this->student->name . "'s wallet balance is low: RM" . number_format($this->student->wallet_balance, 2),
            'student_id' => $this->student->id,
        ];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Low Balance - ' . $this->student->name)
            ->line($this->student->name . "'s e-Kantin wallet balance is running low.")
            ->line('Current balance: RM' . number_format($this->student->wallet_balance, 2))
            ->action('Top Up Now', url('/parent/topup'))
            ->line('Please top up to avoid any inconvenience at the canteen.');
    }
}
