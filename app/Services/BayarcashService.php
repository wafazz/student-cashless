<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BayarcashService
{
    private string $portalKey;
    private string $token;
    private string $secretKey;
    private string $baseUrl;

    public function __construct()
    {
        $sandbox = Setting::get('bayarcash_sandbox', '1') === '1';
        $this->portalKey = trim(Setting::get('bayarcash_portal_key', '') ?? '');
        $this->token = trim(Setting::get('bayarcash_token', '') ?? '');
        $this->secretKey = trim(Setting::get('bayarcash_secret', '') ?? '');
        $this->baseUrl = $sandbox
            ? 'https://console.bayarcash-sandbox.com/api'
            : 'https://console.bayar.cash/api';
    }

    public function createPaymentIntent(array $data): array
    {
        $amountFormatted = number_format($data['amount'], 2, '.', '');
        $payerName = $data['buyer_name'];
        $payerEmail = $data['buyer_email'];
        $payerPhone = $data['buyer_phone'] ?? '';
        $orderNumber = $data['order_number'];
        $paymentChannel = is_array($data['payment_channel'] ?? 1)
            ? implode(',', $data['payment_channel'])
            : (string) ($data['payment_channel'] ?? 1);

        // Bayarcash checksum: 5 fields sorted alphabetically (ksort), pipe-separated
        $payload = [
            'amount' => $amountFormatted,
            'order_number' => $orderNumber,
            'payer_email' => $payerEmail,
            'payer_name' => $payerName,
            'payment_channel' => $paymentChannel,
        ];
        ksort($payload);
        $checksumString = implode('|', $payload);
        $checksum = hash_hmac('sha256', $checksumString, $this->secretKey);

        // Bayarcash expects form-urlencoded, NOT JSON
        $response = Http::asForm()
            ->withToken($this->token)
            ->post($this->baseUrl . '/v2/payment-intents', [
                'portal_key' => $this->portalKey,
                'order_number' => $orderNumber,
                'amount' => $amountFormatted,
                'payer_name' => $payerName,
                'payer_email' => $payerEmail,
                'payer_telephone_number' => $payerPhone,
                'payment_channel' => $paymentChannel,
                'checksum' => $checksum,
                'return_url' => $data['return_url'],
                'callback_url' => $data['callback_url'],
            ]);

        if (!$response->successful()) {
            Log::error('Bayarcash create payment intent failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new \Exception('Failed to create payment. Please try again.');
        }

        return $response->json();
    }

    public function verifyCallback(array $data): bool
    {
        if (empty($data['checksum']) || empty($this->secretKey)) {
            return false;
        }

        // Bayarcash callback checksum uses 13 specific fields
        $fields = [
            'record_type',
            'transaction_id',
            'exchange_reference_number',
            'exchange_transaction_id',
            'order_number',
            'currency',
            'amount',
            'payer_name',
            'payer_email',
            'payer_telephone_number',
            'datetime',
            'status_id',
            'payment_channel',
        ];

        $checksumString = implode('|', array_map(fn($f) => $data[$f] ?? '', $fields));
        $computed = hash_hmac('sha256', $checksumString, $this->secretKey);

        return hash_equals($computed, $data['checksum']);
    }

    public function isConfigured(): bool
    {
        return !empty($this->portalKey) && !empty($this->token) && !empty($this->secretKey);
    }
}
