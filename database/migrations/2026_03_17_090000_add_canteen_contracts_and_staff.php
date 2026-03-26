<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add contract fields to canteens
        Schema::table('canteens', function (Blueprint $table) {
            $table->decimal('contract_fee', 10, 2)->default(0)->after('status');
            $table->enum('contract_status', ['active', 'expired', 'terminated'])->default('active')->after('contract_fee');
            $table->date('contract_start')->nullable()->after('contract_status');
            $table->date('contract_end')->nullable()->after('contract_start');
            $table->text('contract_notes')->nullable()->after('contract_end');
        });

        // Canteen staff (cashiers managed by canteen owner)
        Schema::create('canteen_staff', function (Blueprint $table) {
            $table->id();
            $table->foreignId('canteen_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('position', ['cashier', 'manager'])->default('cashier');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();

            $table->unique(['canteen_id', 'user_id']);
        });

        // Add cashier to users role enum
        // MySQL doesn't easily alter enum, so we'll modify the column
        Schema::table('users', function (Blueprint $table) {
            $table->string('role', 20)->default('parent')->change();
        });
    }

    public function down(): void
    {
        Schema::table('canteens', function (Blueprint $table) {
            $table->dropColumn(['contract_fee', 'contract_status', 'contract_start', 'contract_end', 'contract_notes']);
        });

        Schema::dropIfExists('canteen_staff');
    }
};
