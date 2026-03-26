<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ToyyibPayService
{
    private string $secretKey;
    private string $categoryCode;
    private string $baseUrl;

    public function __construct()
    {
        $sandbox = Setting::get('toyyibpay_sandbox', '1') === '1';
        $this->secretKey = trim(Setting::get('toyyibpay_key', '') ?? '');
        $this->categoryCode = trim(Setting::get('toyyibpay_category', '') ?? '');
        $this->baseUrl = $sandbox
            ? 'https://dev.toyyibpay.com'
            : 'https://toyyibpay.com';
    }

    public function createBill(array $data): string
    {
        $response = Http::asForm()->post($this->baseUrl . '/index.php/api/createBill', [
            'userSecretKey' => $this->secretKey,
            'categoryCode' => $this->categoryCode,
            'billName' => $data['bill_name'],
            'billDescription' => $data['bill_description'],
            'billPriceSetting' => 1, // fixed price
            'billPayorInfo' => 1, // required
            'billAmount' => round($data['amount'] * 100), // ToyyibPay uses cents
            'billReturnUrl' => $data['return_url'],
            'billCallbackUrl' => $data['callback_url'],
            'billExternalReferenceNo' => $data['reference'],
            'billTo' => $data['buyer_name'],
            'billEmail' => $data['buyer_email'],
            'billPhone' => $data['buyer_phone'] ?? '',
            'billPaymentChannel' => 0, // FPX only
        ]);

        if (!$response->successful()) {
            Log::error('ToyyibPay create bill failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new \Exception('Failed to create payment. Please try again.');
        }

        $result = $response->json();

        if (empty($result[0]['BillCode'])) {
            Log::error('ToyyibPay no BillCode', ['response' => $result]);
            throw new \Exception('Failed to create payment bill.');
        }

        return $this->baseUrl . '/' . $result[0]['BillCode'];
    }

    public function isConfigured(): bool
    {
        return !empty($this->secretKey) && !empty($this->categoryCode);
    }
}
