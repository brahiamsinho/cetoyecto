<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Pago;
use App\Models\Postulante;
use App\Http\Requests\RegisterPagoRequest;
use App\Services\PagoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class PagoController extends Controller
{
    public function __construct(
        private readonly PagoService $pagoService
    ) {
        $this->middleware('auth:sanctum');
    }

    public function show(int $postulanteId): JsonResponse
    {
        try {
            $postulante = Postulante::findOrFail($postulanteId);

            $pago = Pago::where('postulante_id', $postulanteId)->first();

            if (!$pago) {
                return response()->json([
                    'success' => true,
                    'data' => null,
                    'message' => 'El postulante no tiene un registro de pago.',
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => $pago,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener pago: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function createPaymentIntent(int $postulanteId): JsonResponse
    {
        try {
            $postulante = Postulante::findOrFail($postulanteId);

            $stripeSecretKey = env('STRIPE_SECRET_KEY');
            $publishableKey = env('STRIPE_PUBLISHABLE_KEY');

            // Modo test simulado (sin credenciales reales de Stripe)
            if (empty($stripeSecretKey) || str_contains($stripeSecretKey, 'placeholder')) {
                $mockId = 'pi_test_' . bin2hex(random_bytes(8));
                return response()->json([
                    'success' => true,
                    'data' => [
                        'client_secret' => $mockId . '_secret_test',
                        'publishable_key' => $publishableKey ?: 'pk_test_placeholder',
                        'test_mode' => true,
                    ],
                ]);
            }

            \Stripe\Stripe::setApiKey($stripeSecretKey);

            $paymentIntent = \Stripe\PaymentIntent::create([
                'amount' => 70000,
                'currency' => 'bob',
                'metadata' => [
                    'postulante_id' => $postulante->id,
                    'postulante_nombre' => $postulante->nombres . ' ' . $postulante->apellidos,
                ],
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'client_secret' => $paymentIntent->client_secret,
                    'publishable_key' => $publishableKey,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear PaymentIntent: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function register(RegisterPagoRequest $request, int $postulanteId): JsonResponse
    {
        try {
            $postulante = Postulante::findOrFail($postulanteId);

            $stripePaymentIntentId = $request->input('stripe_payment_intent_id');

            $pago = $this->pagoService->registrarPago(
                $postulante,
                $request->validated(),
                $stripePaymentIntentId,
                $request
            );

            return response()->json([
                'success' => true,
                'data' => $pago,
                'message' => 'Pago registrado correctamente.',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al procesar pago: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function cambiarEstado(Request $request, int $id): JsonResponse
    {
        try {
            $request->validate(['estado' => 'required|string']);

            $pago = Pago::findOrFail($id);
            $pago = $this->pagoService->cambiarEstado($pago, $request->estado, $request);

            return response()->json([
                'success' => true,
                'data' => $pago,
                'message' => 'Estado del pago actualizado correctamente.',
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cambiar estado del pago: ' . $e->getMessage(),
            ], 500);
        }
    }
}
