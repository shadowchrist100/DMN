<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\EmergencyContact;
use App\Models\EmergencySession;
use App\Models\EmergencyContactToken;
use App\Notifications\EmergencyContactNotification;
use App\Services\MedicalServiceClient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Carbon\Carbon;

class UrgenceController extends Controller
{
    public function __construct(
        private MedicalServiceClient $medicalClient,
    ) {}

    /**
     * POST /api/urgence/initier
     * Le praticien initie le protocole d'urgence pour un patient.
     */
    public function initier(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'patient_user_id' => 'required|string|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $practitioner = $request->user();
        $patientUserId = $request->input('patient_user_id');

        // Vérifier que le patient a des contacts d'urgence
        $contacts = EmergencyContact::where('patient_user_id', $patientUserId)->get();
        if ($contacts->isEmpty()) {
            return response()->json([
                'error' => 'Aucun contact d\'urgence enregistré pour ce patient.',
            ], 400);
        }

        // Créer la session d'urgence (expire dans 3 minutes)
        $session = EmergencySession::create([
            'patient_user_id' => $patientUserId,
            'practitioner_user_id' => $practitioner->id,
            'expires_at' => Carbon::now()->addMinutes(3),
            'status' => 'en_attente',
        ]);

        $practitionerName = "{$practitioner->first_name} {$practitioner->last_name}";

        // Pour chaque contact, générer un token + code unique et envoyer un email
        foreach ($contacts as $contact) {
            $token = Str::random(64);
            $code = strtoupper(Str::random(8));

            EmergencyContactToken::create([
                'emergency_session_id' => $session->id,
                'emergency_contact_id' => $contact->id,
                'token' => $token,
                'code' => $code,
            ]);

            // Envoyer la notification
            $contactUser = new User();
            $contactUser->email = $contact->email;
            $contactUser->notify(new EmergencyContactNotification(
                $contact,
                $token,
                $code,
                $practitionerName,
            ));
        }

        return response()->json([
            'session_id' => $session->id,
            'expires_at' => $session->expires_at,
            'status' => $session->status,
            'contacts_count' => $contacts->count(),
        ]);
    }

    /**
     * GET /api/urgence/statut/{session_id}
     * Vérifier le statut d'une session d'urgence (pour le polling frontend).
     */
    public function statut(string $sessionId, Request $request)
    {
        $session = EmergencySession::find($sessionId);
        if (!$session) {
            return response()->json(['error' => 'Session introuvable.'], 404);
        }

        // Vérifier que le praticien est bien le propriétaire
        if ($session->practitioner_user_id !== $request->user()->id) {
            return response()->json(['error' => 'Non autorisé.'], 403);
        }

        // Si la session est expirée et toujours en attente, la marquer comme expirée
        if ($session->status === 'en_attente' && Carbon::now()->greaterThan($session->expires_at)) {
            $session->update(['status' => 'expire']);
        }

        return response()->json([
            'session_id' => $session->id,
            'status' => $session->status,
            'expires_at' => $session->expires_at,
            'remaining_seconds' => Carbon::now()->diffInSeconds($session->expires_at, false),
        ]);
    }

    /**
     * POST /api/urgence/approuver (public)
     * Un contact d'urgence valide son code pour autoriser l'accès.
     */
    public function approuver(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required|string',
            'code' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $contactToken = EmergencyContactToken::where('token', $request->input('token'))
            ->where('code', $request->input('code'))
            ->where('used', false)
            ->first();

        if (!$contactToken) {
            return response()->json(['error' => 'Token ou code invalide, ou déjà utilisé.'], 400);
        }

        $session = EmergencySession::find($contactToken->emergency_session_id);
        if (!$session || $session->status !== 'en_attente') {
            return response()->json(['error' => 'Session invalide ou déjà traitée.'], 400);
        }

        // Marquer le token comme utilisé
        $contactToken->update(['used' => true]);

        // Mettre à jour la session
        $session->update(['status' => 'approuve_contact']);

        // Appel B2B vers FastAPI pour créer l'autorisation d'urgence
        try {
            $this->medicalClient->createEmergencyAuthorization(
                $session->patient_user_id,
                $session->practitioner_user_id,
                'contact_urgence',
                $contactToken->emergency_contact_id,
            );
        } catch (\Exception $e) {
            // L'autorisation a échoué côté médical
            return response()->json(['error' => 'Erreur lors de la création de l\'autorisation médicale.'], 500);
        }

        return response()->json([
            'status' => 'approuve',
            'message' => 'Accès autorisé. Le praticien peut maintenant consulter le dossier médical.',
        ]);
    }

    /**
     * POST /api/urgence/forcer
     * Le praticien force l'accès après expiration du délai de 3 minutes.
     */
    public function forcer(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'session_id' => 'required|string|exists:emergency_sessions,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $session = EmergencySession::find($request->input('session_id'));
        if (!$session) {
            return response()->json(['error' => 'Session introuvable.'], 404);
        }

        // Vérifier que le praticien est bien le propriétaire
        if ($session->practitioner_user_id !== $request->user()->id) {
            return response()->json(['error' => 'Non autorisé.'], 403);
        }

        // Vérifier que le délai de 3 minutes est bien écoulé (côté serveur)
        if (Carbon::now()->lessThanOrEqualTo($session->expires_at)) {
            return response()->json([
                'error' => 'Le délai de 3 minutes n\'est pas encore écoulé.',
                'remaining_seconds' => Carbon::now()->diffInSeconds($session->expires_at, false),
            ], 400);
        }

        if ($session->status !== 'en_attente' && $session->status !== 'expire') {
            return response()->json(['error' => 'Session déjà traitée.'], 400);
        }

        // Mettre à jour la session
        $session->update(['status' => 'force_praticien']);

        // Appel B2B vers FastAPI pour créer l'autorisation d'urgence
        try {
            $this->medicalClient->createEmergencyAuthorization(
                $session->patient_user_id,
                $session->practitioner_user_id,
                'force_praticien',
                $request->user()->id,
            );
        } catch (\Exception $e) {
            return response()->json(['error' => 'Erreur lors de la création de l\'autorisation médicale.'], 500);
        }

        return response()->json([
            'status' => 'force',
            'message' => 'Accès forcé sous votre responsabilité. Vous pouvez maintenant consulter le dossier médical.',
        ]);
    }
}
