<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('school_classes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('level')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
            $table->unique(['school_id', 'name']);
        });

        // Migrate existing class_name data to school_classes, then add class_id FK
        Schema::table('students', function (Blueprint $table) {
            $table->foreignId('class_id')->nullable()->after('school_id');
        });

        // Auto-create classes from existing class_name data
        $students = DB::table('students')->whereNotNull('class_name')->select('school_id', 'class_name')->distinct()->get();
        foreach ($students as $s) {
            $classId = DB::table('school_classes')->insertGetId([
                'school_id' => $s->school_id,
                'name' => $s->class_name,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            DB::table('students')
                ->where('school_id', $s->school_id)
                ->where('class_name', $s->class_name)
                ->update(['class_id' => $classId]);
        }

        Schema::create('school_fees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->foreignId('class_id')->nullable()->constrained('school_classes')->cascadeOnDelete();
            $table->string('name');
            $table->decimal('amount', 10, 2);
            $table->string('academic_year', 20);
            $table->date('due_date');
            $table->text('description')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });

        Schema::create('school_fee_students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_fee_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount_paid', 10, 2)->default(0);
            $table->enum('status', ['unpaid', 'paid'])->default('unpaid');
            $table->timestamp('paid_at')->nullable();
            $table->string('payment_method')->nullable();
            $table->string('reference_id')->nullable();
            $table->timestamps();
            $table->unique(['school_fee_id', 'student_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('school_fee_students');
        Schema::dropIfExists('school_fees');
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn('class_id');
        });
        Schema::dropIfExists('school_classes');
    }
};
