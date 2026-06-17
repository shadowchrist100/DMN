<?php

namespace Database\Seeders;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        $admins = [
            [
                'first_name' => 'Super',
                'last_name' => 'Admin',
                'email' => 'super.admin@santebenin.bj',
                'password' => Hash::make('Admin@2026!'),
                'role' => 'admin',
                'npi' => 'ADMIN001',
                'gender' => 'homme',
                'birth_date' => '1990-01-01',
                'phone' => '+229 01 01 01 01',
                'city' => 'Cotonou',
                'address' => '01 BP 1234 Cotonou',
                'matrimonial_status' => 'Marié(e)',
                'status_account' => 'verified',
                'email_verified_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'first_name' => 'Admin',
                'last_name' => 'Médical',
                'email' => 'admin.medical@santebenin.bj',
                'password' => Hash::make('Medic@l2026!'),
                'role' => 'admin_medical',
                'npi' => 'ADMIN002',
                'gender' => 'femme',
                'birth_date' => '1988-05-15',
                'phone' => '+229 02 02 02 02',
                'city' => 'Cotonou',
                'address' => '02 BP 5678 Cotonou',
                'matrimonial_status' => 'Marié(e)',
                'status_account' => 'verified',
                'email_verified_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'first_name' => 'Admin',
                'last_name' => 'Organisation',
                'email' => 'admin.organisation@santebenin.bj',
                'password' => Hash::make('Orga@2026!'),
                'role' => 'admin_organisation',
                'npi' => 'ADMIN003',
                'gender' => 'homme',
                'birth_date' => '1992-11-20',
                'phone' => '+229 03 03 03 03',
                'city' => 'Porto-Novo',
                'address' => '03 BP 9012 Porto-Novo',
                'matrimonial_status' => 'Célibataire',
                'status_account' => 'verified',
                'email_verified_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        foreach ($admins as $admin) {
            User::firstOrCreate(
                ['email' => $admin['email']],
                $admin
            );
        }

        $this->command->info('Comptes administrateurs créés avec succès !');
    }
}
