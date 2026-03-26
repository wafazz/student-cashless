<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('schools', function (Blueprint $table) {
            $table->decimal('subscription_fee', 10, 2)->default(0)->after('status');
            $table->enum('subscription_status', ['active', 'inactive', 'trial'])->default('trial')->after('subscription_fee');
            $table->date('subscription_start')->nullable()->after('subscription_status');
            $table->date('subscription_end')->nullable()->after('subscription_start');
        });

        Schema::table('topups', function (Blueprint $table) {
            $table->decimal('service_fee', 10, 2)->default(0)->after('amount');
        });
    }

    public function down(): void
    {
        Schema::table('schools', function (Blueprint $table) {
            $table->dropColumn(['subscription_fee', 'subscription_status', 'subscription_start', 'subscription_end']);
        });

        Schema::table('topups', function (Blueprint $table) {
            $table->dropColumn('service_fee');
        });
    }
};
