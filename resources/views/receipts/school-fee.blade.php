<!DOCTYPE html>
<html>
<head>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 12px; color: #333; padding: 40px; }

        .receipt { max-width: 600px; margin: 0 auto; }

        /* Header with school branding */
        .header { text-align: center; padding-bottom: 20px; border-bottom: 3px solid #0d9488; margin-bottom: 25px; }
        .header .logo { max-height: 70px; margin-bottom: 10px; }
        .header .school-name { font-size: 22px; font-weight: bold; color: #0d9488; margin-bottom: 4px; }
        .header .school-info { font-size: 11px; color: #666; line-height: 1.6; }

        /* Receipt title */
        .receipt-title { text-align: center; margin-bottom: 25px; }
        .receipt-title h2 { font-size: 16px; color: #333; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; }
        .receipt-title .receipt-no { font-size: 11px; color: #888; margin-top: 4px; }

        /* Amount highlight */
        .amount-box {
            text-align: center;
            background: linear-gradient(135deg, #f0fdfa, #ccfbf1);
            border: 2px solid #99f6e4;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 25px;
        }
        .amount-box .label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
        .amount-box .value { font-size: 32px; font-weight: bold; color: #0d9488; margin-top: 4px; }
        .amount-box .status { display: inline-block; background: #0d9488; color: white; font-size: 10px; font-weight: bold; padding: 3px 12px; border-radius: 10px; margin-top: 8px; letter-spacing: 1px; }

        /* Details table */
        .details { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
        .details tr { border-bottom: 1px solid #f0f0f0; }
        .details tr:last-child { border-bottom: none; }
        .details td { padding: 10px 0; vertical-align: top; }
        .details td:first-child { font-weight: 600; color: #555; width: 40%; }
        .details td:last-child { color: #333; text-align: right; }

        /* Divider */
        .divider { border-top: 1px dashed #ccc; margin: 20px 0; }

        /* Footer */
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; }
        .footer .note { font-size: 10px; color: #999; line-height: 1.6; }
        .footer .powered { font-size: 9px; color: #bbb; margin-top: 12px; }

        /* Watermark */
        .watermark {
            position: fixed;
            top: 45%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-30deg);
            font-size: 60px;
            font-weight: bold;
            color: rgba(13, 148, 136, 0.06);
            letter-spacing: 8px;
            white-space: nowrap;
        }
    </style>
</head>
<body>
    <div class="watermark">PAID</div>

    <div class="receipt">
        <!-- School Header -->
        <div class="header">
            @if($school->logo)
                <img src="{{ public_path('storage/' . $school->logo) }}" class="logo" alt="{{ $school->name }}">
            @endif
            <div class="school-name">{{ $school->name }}</div>
            <div class="school-info">
                @if($school->address){{ $school->address }}<br>@endif
                @if($school->phone)Tel: {{ $school->phone }}@endif
                @if($school->phone && $school->email) &nbsp;|&nbsp; @endif
                @if($school->email)Email: {{ $school->email }}@endif
            </div>
        </div>

        <!-- Receipt Title -->
        <div class="receipt-title">
            <h2>{{ $type }} Receipt</h2>
            @if($referenceId)
                <div class="receipt-no">Ref: {{ $referenceId }}</div>
            @endif
        </div>

        <!-- Amount -->
        <div class="amount-box">
            <div class="label">Amount Paid</div>
            <div class="value">RM {{ number_format($amount, 2) }}</div>
            <div class="status">PAID</div>
        </div>

        <!-- Details -->
        <table class="details">
            <tr>
                <td>Fee Name</td>
                <td>{{ $feeName }}</td>
            </tr>
            <tr>
                <td>Academic Year</td>
                <td>{{ $academicYear }}</td>
            </tr>
            <tr>
                <td>Paid By</td>
                <td>{{ $payerName }} ({{ $payerType }})</td>
            </tr>
            @if($studentName)
            <tr>
                <td>Student</td>
                <td>{{ $studentName }}</td>
            </tr>
            @endif
            <tr>
                <td>Payment Method</td>
                <td>{{ ucfirst($paymentMethod ?? 'Wallet') }}</td>
            </tr>
            <tr>
                <td>Date & Time</td>
                <td>{{ $paidAt ? $paidAt->format('d/m/Y h:i A') : '-' }}</td>
            </tr>
        </table>

        <div class="divider"></div>

        <!-- Footer -->
        <div class="footer">
            <div class="note">
                This is a computer-generated receipt. No signature is required.<br>
                Please keep this receipt for your records.
            </div>
            <div class="powered">
                Powered by Student Cashless
            </div>
        </div>
    </div>
</body>
</html>
