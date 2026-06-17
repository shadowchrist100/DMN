<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrganizationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Organization::with('creator', 'validator');

        if ($user->role === 'admin_organisation') {
            $query->where('created_by', $user->id);
        }

        return response()->json([
            'organizations' => $query->orderBy('created_at', 'desc')->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string'],
            'email' => ['nullable', 'email'],
        ]);

        $organization = Organization::create([
            ...$data,
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Organisation créée. En attente de validation.',
            'organization' => $organization->load('creator'),
        ], 201);
    }

    public function show(Request $request, Organization $organization): JsonResponse
    {
        $user = $request->user();

        if ($user->role === 'admin_organisation' && $organization->created_by !== $user->id) {
            return response()->json(['message' => 'Action non autorisée.'], 403);
        }

        return response()->json([
            'organization' => $organization->load('creator', 'validator', 'members'),
        ]);
    }

    public function update(Request $request, Organization $organization): JsonResponse
    {
        $user = $request->user();

        if ($user->role === 'admin_organisation' && $organization->created_by !== $user->id) {
            return response()->json(['message' => 'Action non autorisée.'], 403);
        }

        if ($organization->status !== 'pending') {
            return response()->json([
                'message' => "Impossible de modifier une organisation déjà traitée.",
            ], 400);
        }

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'type' => ['sometimes', 'string', 'max:255'],
            'city' => ['sometimes', 'string', 'max:255'],
            'address' => ['sometimes', 'string', 'max:255'],
            'phone' => ['nullable', 'string'],
            'email' => ['nullable', 'email'],
        ]);

        $organization->update($data);

        return response()->json([
            'message' => 'Organisation mise à jour.',
            'organization' => $organization->load('creator'),
        ]);
    }

    public function destroy(Request $request, Organization $organization): JsonResponse
    {
        $user = $request->user();

        if ($user->role === 'admin_organisation' && $organization->created_by !== $user->id) {
            return response()->json(['message' => 'Action non autorisée.'], 403);
        }

        if ($organization->status !== 'pending') {
            return response()->json([
                'message' => "Impossible de supprimer une organisation déjà traitée.",
            ], 400);
        }

        $organization->delete();

        return response()->json(['message' => 'Organisation supprimée.']);
    }
}
