<?php

namespace App\Http\Controllers;

use App\Services\MedicalOrganizationServiceClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrganizationProxyController extends Controller
{
    private MedicalOrganizationServiceClient $orgClient;

    public function __construct(MedicalOrganizationServiceClient $orgClient)
    {
        $this->orgClient = $orgClient;
    }

    public function index(Request $request): JsonResponse
    {
        $query = $request->query();

        if ($request->user()->role === 'admin_organisation') {
            $query['created_by'] = $request->user()->id;
        }

        $result = $this->orgClient->list($query);
        return response()->json($result);
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

        $data['created_by'] = $request->user()->id;

        $result = $this->orgClient->create($data);

        return response()->json($result, 201);
    }

    public function show(Request $request, string $organization): JsonResponse
    {
        $result = $this->orgClient->show($organization);
        $this->authorizeOrgaAccess($request, $result);
        return response()->json($result);
    }

    public function update(Request $request, string $organization): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'type' => ['sometimes', 'string', 'max:255'],
            'city' => ['sometimes', 'string', 'max:255'],
            'address' => ['sometimes', 'string', 'max:255'],
            'phone' => ['nullable', 'string'],
            'email' => ['nullable', 'email'],
        ]);

        $org = $this->orgClient->show($organization);
        $this->authorizeOrgaAccess($request, $org);

        $result = $this->orgClient->update($organization, $data);
        return response()->json($result);
    }

    public function destroy(Request $request, string $organization): JsonResponse
    {
        $org = $this->orgClient->show($organization);
        $this->authorizeOrgaAccess($request, $org);

        $result = $this->orgClient->destroy($organization);
        return response()->json($result);
    }

    private function authorizeOrgaAccess(Request $request, array $organization): void
    {
        if ($request->user()->role === 'admin_organisation'
            && ($organization['created_by'] ?? null) !== $request->user()->id) {
            abort(403, 'Vous ne pouvez accéder qu\'à vos propres organisations.');
        }
    }
}
