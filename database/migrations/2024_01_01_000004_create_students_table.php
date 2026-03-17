<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('ic_number')->nullable();
            $table->string('class_name')->nullable();
            $table->uuid('wallet_uuid')->unique();
            $table->decimal('wallet_balance', 10, 2)->default(0);
            $table->decimal('daily_limit', 10, 2)->nullable();
            $table->decimal('daily_spent', 10, 2)->default(0);
            $table->string('photo')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
