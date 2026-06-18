<?php

namespace Database\Seeders;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        $users = [
            // ── Praticiens ──────────────────────────────────────────────
            [
                'first_name' => 'Koffi',
                'last_name' => 'Kouandete',
                'email' => 'koffi.kouandete@santebenin.bj',
                'password' => Hash::make('password123'),
                'role' => 'practitioner',
                'npi' => 'pract-kouandete',
                'gender' => 'homme',
                'birth_date' => '1975-04-10',
                'phone' => '+229 61 00 00 01',
                'city' => 'Cotonou',
                'address' => 'CNHU-HKM, Service Cardiologie',
                'matrimonial_status' => 'Marié(e)',
                'status_account' => 'verified',
                'email_verified_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'first_name' => 'Aïssatou',
                'last_name' => 'Soumanou',
                'email' => 'aissatou.soumanou@santebenin.bj',
                'password' => Hash::make('password123'),
                'role' => 'practitioner',
                'npi' => 'pract-soumanou',
                'gender' => 'femme',
                'birth_date' => '1982-09-22',
                'phone' => '+229 61 00 00 02',
                'city' => 'Cotonou',
                'address' => 'CNHU-HKM, Laboratoire',
                'matrimonial_status' => 'Marié(e)',
                'status_account' => 'verified',
                'email_verified_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'first_name' => 'Mireille',
                'last_name' => 'Dossou',
                'email' => 'mireille.dossou@santebenin.bj',
                'password' => Hash::make('password123'),
                'role' => 'practitioner',
                'npi' => 'pract-dossou',
                'gender' => 'femme',
                'birth_date' => '1979-12-05',
                'phone' => '+229 61 00 00 03',
                'city' => 'Cotonou',
                'address' => 'CNHU-HKM, Service Pédiatrie',
                'matrimonial_status' => 'Divorcé(e)',
                'status_account' => 'verified',
                'email_verified_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'first_name' => 'Sébastien',
                'last_name' => 'Hounkpé',
                'email' => 'sebastien.hounkpe@santebenin.bj',
                'password' => Hash::make('password123'),
                'role' => 'practitioner',
                'npi' => 'pract-hounkpe',
                'gender' => 'homme',
                'birth_date' => '1980-07-14',
                'phone' => '+229 61 00 00 04',
                'city' => 'Cotonou',
                'address' => 'CNHU-HKM, Service Gynécologie',
                'matrimonial_status' => 'Marié(e)',
                'status_account' => 'verified',
                'email_verified_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ],

            // ── Patients ────────────────────────────────────────────────
            [
                'first_name' => 'Kouassi',
                'last_name' => 'Adebayo',
                'email' => 'kouassi.adebayo@email.com',
                'password' => Hash::make('password123'),
                'role' => 'patient',
                'npi' => 'patient-adebayo',
                'gender' => 'homme',
                'birth_date' => '1966-05-12',
                'phone' => '+229 61 12 34 56',
                'city' => 'Cotonou',
                'address' => '12 Rue des Cocotiers, Akpakpa',
                'matrimonial_status' => 'Marié(e)',
                'status_account' => 'verified',
                'email_verified_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'first_name' => 'Aminata',
                'last_name' => 'Sow',
                'email' => 'aminata.sow@email.com',
                'password' => Hash::make('password123'),
                'role' => 'patient',
                'npi' => 'patient-sow',
                'gender' => 'femme',
                'birth_date' => '1989-11-24',
                'phone' => '+229 62 98 76 54',
                'city' => 'Cotonou',
                'address' => '45 Rue des Ambassades, Haie Vive',
                'matrimonial_status' => 'Marié(e)',
                'status_account' => 'verified',
                'email_verified_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'first_name' => 'Jean-Pierre',
                'last_name' => 'Dossou',
                'email' => 'jeanpierre.dossou@email.com',
                'password' => Hash::make('password123'),
                'role' => 'patient',
                'npi' => 'patient-dossou',
                'gender' => 'homme',
                'birth_date' => '1957-03-08',
                'phone' => '+229 63 45 67 89',
                'city' => 'Cotonou',
                'address' => '8 Avenue des Amazones, Gbégamey',
                'matrimonial_status' => 'Marié(e)',
                'status_account' => 'verified',
                'email_verified_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'first_name' => 'Martine',
                'last_name' => 'Agossou',
                'email' => 'martine.agossou@email.com',
                'password' => Hash::make('password123'),
                'role' => 'patient',
                'npi' => 'patient-agossou',
                'gender' => 'femme',
                'birth_date' => '1978-07-30',
                'phone' => '+229 64 00 11 22',
                'city' => 'Cotonou',
                'address' => '23 Rue du Marché, Dantokpa',
                'matrimonial_status' => 'Célibataire',
                'status_account' => 'verified',
                'email_verified_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        foreach ($users as $userData) {
            User::firstOrCreate(
                ['email' => $userData['email']],
                $userData
            );
        }

        $this->command->info(
            'Utilisateurs de seed créés : '
            . count($users) . ' comptes (patients + praticiens)'
        );
    }
}
