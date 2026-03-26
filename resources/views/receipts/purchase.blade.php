<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; font-size: 12px; color: #333; padding: 30px; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #2563eb; font-size: 24px; margin: 0; }
        .header p { color: #666; margin: 5px 0 0; }
        .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .info-table td { padding: 8px 12px; border-bottom: 1px solid #eee; }
        .info-table td:first-child { font-weight: bold; color: #555; width: 40%; }
        .amount { text-align: center; margin: 30px 0; }
        .amount .value { font-size: 28px; font-weight: bold; color: #dc2626; }
        .footer { text-align: center; margin-top: 30px; font-size: 10px; color: #999; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Student Cashless</h1>
        <p>Purchase Receipt</p>
    </div>

    <div class="amount">
        <p style="color: #666; margin: 0;">Amount</p>
        <p class="value">- RM {{ number_format($transaction->amount, 2) }}</p>
    </div>

    <table class="info-table">
        <tr><td>Transaction ID</td><td>#{{ $transaction->id }}</td></tr>
        <tr><td>Student</td><td>{{ $transaction->student->name }}</td></tr>
        <tr><td>School</td><td>{{ $transaction->student->school->name ?? '-' }}</td></tr>
        <tr><td>Canteen</td><td>{{ $transaction->canteen->name ?? '-' }}</td></tr>
        <tr><td>Description</td><td>{{ $transaction->description ?? '-' }}</td></tr>
        <tr><td>Date</td><td>{{ $transaction->created_at->format('d/m/Y h:i A') }}</td></tr>
        <tr><td>Balance Before</td><td>RM {{ number_format($transaction->balance_before, 2) }}</td></tr>
        <tr><td>Balance After</td><td>RM {{ number_format($transaction->balance_after, 2) }}</td></tr>
    </table>

    <div class="footer">
        <p>This is a computer-generated receipt. No signature required.</p>
        <p>Student Cashless - Cashless School Payment System</p>
    </div>
</body>
</html>
