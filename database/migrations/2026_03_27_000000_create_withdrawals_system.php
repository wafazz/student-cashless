<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Bank details for store operators (on canteens table)
        Schema::table('canteens', function (Blueprint $table) {
            $table->string('bank_name')->nullable()->after('contract_notes');
            $table->string('bank_account')->nullable()->after('bank_name');
            $table->string('bank_holder')->nullable()->after('bank_account');
        });

        // Bank details for school users
        Schema::table('users', function (Blueprint $table) {
            $table->string('bank_name')->nullable()->after('wallet_balance');
            $table->string('bank_account')->nullable()->after('bank_name');
            $table->string('bank_holder')->nullable()->after('bank_account');
        });

        Schema::create('withdrawals', function (Blueprint $table) {
            $table->id();
            $table->string('entity_type'); // store, school
            $table->unsignedBigInteger('entity_id');
            $table->string('entity_name'); // store/school name for quick reference
            $table->decimal('amount', 12, 2);
            $table->decimal('platform_fee', 10, 2)->default(0);
            $table->decimal('net_amount', 12, 2);
            $table->string('bank_name');
            $table->string('bank_account');
            $table->string('bank_holder');
            $table->enum('status', ['pending', 'approved', 'paid', 'rejected'])->default('pending');
            $table->timestamp('requested_at');
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->string('payment_reference')->nullable();
            $table->text('admin_notes')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['entity_type', 'entity_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('withdrawals');
        Schema::table('canteens', function (Blueprint $table) {
            $table->dropColumn(['bank_name', 'bank_account', 'bank_holder']);
        });
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['bank_name', 'bank_account', 'bank_holder']);
        });
    }
};
