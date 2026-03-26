<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscription_packages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->integer('duration_days');
            $table->enum('billing_cycle', ['trial', 'monthly', 'yearly']);
            $table->json('features')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // Add package_id to schools
        Schema::table('schools', function (Blueprint $table) {
            $table->foreignId('package_id')->nullable()->after('subscription_end')
                ->constrained('subscription_packages')->nullOnDelete();
        });

        // Seed default packages
        DB::table('subscription_packages')->insert([
            [
                'name' => 'Trial',
                'slug' => 'trial',
                'description' => 'Try Student Cashless free for 1 month. Full access to all features.',
                'price' => 0,
                'duration_days' => 30,
                'billing_cycle' => 'trial',
                'features' => json_encode([
                    'Unlimited students',
                    'Unlimited stores (canteen & koperasi)',
                    'QR scan & charge',
                    'PIBG & school fee collection',
                    'Reports & analytics',
                    'Parent mobile app access',
                ]),
                'is_active' => true,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Monthly',
                'slug' => 'monthly',
                'description' => 'Pay monthly. Cancel anytime. All features included.',
                'price' => 199,
                'duration_days' => 30,
                'billing_cycle' => 'monthly',
                'features' => json_encode([
                    'Everything in Trial',
                    'Priority support',
                    'Custom school branding',
                    'Advanced reports',
                    'SMS notifications',
                ]),
                'is_active' => true,
                'sort_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Yearly',
                'slug' => 'yearly',
                'description' => 'Pay yearly and save. Best value for schools.',
                'price' => 1990,
                'duration_days' => 365,
                'billing_cycle' => 'yearly',
                'features' => json_encode([
                    'Everything in Monthly',
                    '2 months FREE (save RM398)',
                    'Dedicated account manager',
                    'Data export & backup',
                    'API access',
                ]),
                'is_active' => true,
                'sort_order' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::table('schools', function (Blueprint $table) {
            $table->dropForeign(['package_id']);
            $table->dropColumn('package_id');
        });
        Schema::dropIfExists('subscription_packages');
    }
};
