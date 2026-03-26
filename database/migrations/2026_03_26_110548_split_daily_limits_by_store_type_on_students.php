<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->decimal('daily_limit_canteen', 8, 2)->nullable()->after('daily_limit');
            $table->decimal('daily_limit_koperasi', 8, 2)->nullable()->after('daily_limit_canteen');
            $table->decimal('daily_spent_canteen', 8, 2)->default(0)->after('daily_spent');
            $table->decimal('daily_spent_koperasi', 8, 2)->default(0)->after('daily_spent_canteen');
        });

        // Migrate existing data
        DB::table('students')->whereNotNull('daily_limit')->update([
            'daily_limit_canteen' => DB::raw('daily_limit'),
        ]);
        DB::table('students')->where('daily_spent', '>', 0)->update([
            'daily_spent_canteen' => DB::raw('daily_spent'),
        ]);

        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn(['daily_limit', 'daily_spent']);
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->decimal('daily_limit', 8, 2)->nullable()->after('wallet_balance');
            $table->decimal('daily_spent', 8, 2)->default(0)->after('daily_limit');
        });

        DB::table('students')->update([
            'daily_limit' => DB::raw('daily_limit_canteen'),
            'daily_spent' => DB::raw('COALESCE(daily_spent_canteen, 0) + COALESCE(daily_spent_koperasi, 0)'),
        ]);

        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn(['daily_limit_canteen', 'daily_limit_koperasi', 'daily_spent_canteen', 'daily_spent_koperasi']);
        });
    }
};
