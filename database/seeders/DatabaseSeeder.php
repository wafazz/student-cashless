<?php

namespace Database\Seeders;

use App\Models\Canteen;
use App\Models\MenuItem;
use App\Models\School;
use App\Models\Student;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        User::create([
            'name' => 'Admin',
            'email' => 'admin@ekantin.my',
            'password' => 'admin123',
            'role' => 'admin',
        ]);

        // Schools
        $school1 = School::create([
            'name' => 'SK Taman Melawati',
            'address' => 'Jalan Melawati, 53100 KL',
            'phone' => '03-41234567',
        ]);

        $school2 = School::create([
            'name' => 'SK Wangsa Maju',
            'address' => 'Jalan Wangsa, 53300 KL',
            'phone' => '03-41987654',
        ]);

        // School Users (PIBG)
        User::create([
            'name' => 'Pn. Noraini (PIBG)',
            'email' => 'pibg@skmelawati.my',
            'password' => 'password',
            'role' => 'school',
            'school_id' => $school1->id,
        ]);

        User::create([
            'name' => 'En. Razak (PIBG)',
            'email' => 'pibg@skwangsa.my',
            'password' => 'password',
            'role' => 'school',
            'school_id' => $school2->id,
        ]);

        // Operators
        $operator1 = User::create([
            'name' => 'Makcik Kiah',
            'email' => 'kiah@ekantin.my',
            'password' => 'password',
            'phone' => '0121234567',
            'role' => 'operator',
        ]);

        $operator2 = User::create([
            'name' => 'Pakcik Ahmad',
            'email' => 'ahmad@ekantin.my',
            'password' => 'password',
            'phone' => '0129876543',
            'role' => 'operator',
        ]);

        // Canteens
        $canteen1 = Canteen::create([
            'school_id' => $school1->id,
            'operator_id' => $operator1->id,
            'name' => 'Kantin Utama',
        ]);

        $canteen2 = Canteen::create([
            'school_id' => $school2->id,
            'operator_id' => $operator2->id,
            'name' => 'Kantin Blok A',
        ]);

        // Menu Items
        $menuItems = [
            ['name' => 'Nasi Lemak', 'price' => 2.50, 'category' => 'Nasi'],
            ['name' => 'Nasi Goreng', 'price' => 3.00, 'category' => 'Nasi'],
            ['name' => 'Mee Goreng', 'price' => 2.50, 'category' => 'Mee'],
            ['name' => 'Roti Canai', 'price' => 1.50, 'category' => 'Roti'],
            ['name' => 'Air Sirap', 'price' => 1.00, 'category' => 'Minuman'],
            ['name' => 'Milo', 'price' => 1.50, 'category' => 'Minuman'],
            ['name' => 'Kuih Lapis', 'price' => 0.50, 'category' => 'Kuih'],
            ['name' => 'Karipap', 'price' => 1.00, 'category' => 'Kuih'],
        ];

        foreach ($menuItems as $item) {
            MenuItem::create(['canteen_id' => $canteen1->id, ...$item]);
            MenuItem::create(['canteen_id' => $canteen2->id, ...$item]);
        }

        // Parents & Students
        $parent1 = User::create([
            'name' => 'Siti Aminah',
            'email' => 'siti@test.com',
            'password' => 'password',
            'phone' => '0191234567',
            'role' => 'parent',
        ]);

        $parent2 = User::create([
            'name' => 'Abu Bakar',
            'email' => 'abu@test.com',
            'password' => 'password',
            'phone' => '0199876543',
            'role' => 'parent',
        ]);

        $student1 = Student::create([
            'parent_id' => $parent1->id,
            'school_id' => $school1->id,
            'name' => 'Muhammad Aiman',
            'class_name' => '3 Bestari',
            'wallet_balance' => 50.00,
            'daily_limit_canteen' => 10.00,
            'daily_limit_koperasi' => 20.00,
        ]);

        $student2 = Student::create([
            'parent_id' => $parent1->id,
            'school_id' => $school1->id,
            'name' => 'Nur Aisyah',
            'class_name' => '5 Cemerlang',
            'wallet_balance' => 30.00,
            'daily_limit_canteen' => 15.00,
            'daily_limit_koperasi' => 30.00,
        ]);

        $student3 = Student::create([
            'parent_id' => $parent2->id,
            'school_id' => $school2->id,
            'name' => 'Ahmad Danial',
            'class_name' => '4 Jaya',
            'wallet_balance' => 25.00,
            'daily_limit_canteen' => 8.00,
            'daily_limit_koperasi' => 15.00,
        ]);

        // Sample Transactions
        $samples = [
            [$student1, $canteen1, $operator1, 'purchase', 2.50, 50.00, 47.50, 'Nasi Lemak'],
            [$student1, $canteen1, $operator1, 'purchase', 1.00, 47.50, 46.50, 'Air Sirap'],
            [$student2, $canteen1, $operator1, 'purchase', 3.00, 30.00, 27.00, 'Nasi Goreng'],
            [$student1, null, null, 'topup', 20.00, 46.50, 66.50, 'FPX Top Up'],
            [$student3, $canteen2, $operator2, 'purchase', 1.50, 25.00, 23.50, 'Roti Canai'],
        ];

        foreach ($samples as $i => $s) {
            Transaction::create([
                'student_id' => $s[0]->id,
                'canteen_id' => $s[1]?->id,
                'operator_id' => $s[2]?->id,
                'type' => $s[3],
                'amount' => $s[4],
                'balance_before' => $s[5],
                'balance_after' => $s[6],
                'description' => $s[7],
                'created_at' => now()->subHours(count($samples) - $i),
            ]);
        }
    }
}
