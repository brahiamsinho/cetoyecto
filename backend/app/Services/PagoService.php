<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Pago;
use App\Models\Postulante;
use Illuminate\Http\Request;

class PagoService
{
    public function registrarPago(Postulante $postulante, array $data, ?string $stripePaymentIntentId, Request $request): Pago
    {
        $estado = 'pendiente';
        $fechaPago = null;
        $codigoTransaccion = null;

        if ($stripePaymentIntentId) {
            // Modo test simulado (sin credenciales reales de Stripe)
            if (str_contains($stripePaymentIntentId, 'pi_test_')) {
                $estado = 'pagado';
                $fechaPago = now();
                $codigoTransaccion = $stripePaymentIntentId;
            } else {
                $stripeSecretKey = env('STRIPE_SECRET_KEY');
                if (empty($stripeSecretKey)) {
                    throw new \RuntimeException('Stripe no está configurado.');
                }

                \Stripe\Stripe::setApiKey($stripeSecretKey);
                $paymentIntent = \Stripe\PaymentIntent::retrieve($stripePaymentIntentId);

                if ($paymentIntent->status === 'succeeded') {
                    $estado = 'pagado';
                    $fechaPago = now();
                    $codigoTransaccion = $stripePaymentIntentId;
                } else {
                    throw new \RuntimeException('El pago no ha sido confirmado en Stripe.');
                }
            }
        } else {
            $codigoTransaccion = 'TXN-' . strtoupper(bin2hex(random_bytes(8)));
            $simulacion = rand(1, 100);
            $estado = $simulacion <= 90 ? 'pagado' : 'rechazado';
            $fechaPago = $estado === 'pagado' ? now() : null;
        }

        $pago = Pago::updateOrCreate(
            ['postulante_id' => $postulante->id],
            [
                'monto' => $data['monto'],
                'codigo_transaccion' => $codigoTransaccion,
                'estado' => $estado,
                'fecha_pago' => $fechaPago,
                'metodo_pago' => $data['metodo_pago'] ?? 'online',
            ]
        );

        log_bitacora(
            $estado === 'pagado' ? 'PAGO_EXITOSO' : 'PAGO_RECHAZADO',
            'Pagos',
            "Pago de Bs. {$data['monto']} para postulante {$postulante->nombres} {$postulante->apellidos} - Estado: {$estado} - Transacción: {$codigoTransaccion}.",
            null,
            $request
        );

        return $pago;
    }

    public function cambiarEstado(Pago $pago, string $estado, Request $request): Pago
    {
        $estadosValidos = ['pendiente', 'pagado', 'rechazado', 'reembolsado'];

        if (!in_array($estado, $estadosValidos)) {
            throw new \InvalidArgumentException("El estado '{$estado}' no es válido.");
        }

        $pago->update(['estado' => $estado]);

        log_bitacora(
            'CAMBIAR_ESTADO_PAGO',
            'Pagos',
            "Se cambió el estado del pago a '{$estado}' - Postulante ID: {$pago->postulante_id}.",
            null,
            $request
        );

        return $pago->fresh();
    }
}
