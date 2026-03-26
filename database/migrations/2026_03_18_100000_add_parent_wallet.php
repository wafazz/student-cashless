<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('wallet_uuid')->nullable()->unique()->after('status');
            $table->decimal('wallet_balance', 10, 2)->default(0)->after('wallet_uuid');
        });

        // Generate wallet_uuid for existing parents
        $parents = \App\Models\User::where('role', 'parent')->get();
        foreach ($parents as $parent) {
            $parent->update(['wallet_uuid' => (string) \Illuminate\Support\Str::uuid()]);
        }

        // Allow topups to have null student_id (parent wallet topup)
        Schema::table('topups', function (Blueprint $table) {
            $table->foreignId('student_id')->nullable()->change();
        });

        // Allow transactions to have null student_id (parent wallet transaction)
        Schema::table('transactions', function (Blueprint $table) {
            $table->foreignId('parent_id')->nullable()->after('student_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['wallet_uuid', 'wallet_balance']);
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn('parent_id');
        });
    }
};
