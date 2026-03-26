<?php

namespace App\Notifications;

use App\Models\Student;
use App\Models\Topup;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class TopupSuccessNotification extends Notification
{
    use Queueable;

    public function __construct(private Topup $topup, private Student $student) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'title' => 'Top Up Successful',
            'message' => 'RM' . number_format($this->topup->amount, 2) . ' topped up to ' . $this->student->name . '. New balance: RM' . number_format($this->student->wallet_balance, 2),
            'student_id' => $this->student->id,
            'topup_id' => $this->topup->id,
        ];
    }
}
