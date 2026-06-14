<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Carrera;
use App\Models\Gestion;
use App\Models\Postulante;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class PostulanteService
{
    public function __construct(
        private readonly UserService $userService
    ) {
    }

    private const NOMBRES = [
        'Andrés', 'Bruno', 'Carlos', 'Diego', 'Elías', 'Fabio', 'Gustavo', 'Hugo', 'Iván', 'Julián',
    ];

    private const APELLIDOS = [
        'Alvarado', 'Borda', 'Castillo', 'Díaz', 'Escobar', 'Fernández', 'Gómez', 'Herrera', 'Ibarra', 'Juárez',
    ];

    private const CIUDADES = [
        'Santa Cruz', 'La Paz', 'Cochabamba', 'Tarija', 'Sucre', 'Oruro', 'Potosí', 'Trinidad', 'Cobija', 'Montero',
    ];

    public function store(array $data, Request $request): Postulante
    {
        return DB::transaction(function () use ($data) {
            $postulante = Postulante::create($data);
            $this->userService->syncPostulanteAccount($postulante);

            return $postulante->fresh();
        });
    }

    public function update(Postulante $postulante, array $data, Request $request): Postulante
    {
        return DB::transaction(function () use ($postulante, $data) {
            $postulante->update($data);
            $this->userService->syncPostulanteAccount($postulante->fresh());

            return $postulante->fresh();
        });
    }

    public function delete(Postulante $postulante, Request $request): void
    {
        $postulante->delete();
    }

    public function cambiarEstado(Postulante $postulante, string $estado, Request $request): Postulante
    {
        $estadosValidos = ['inscrito', 'admitido', 'rechazado', 'habilitado'];

        if (!in_array($estado, $estadosValidos)) {
            throw new \InvalidArgumentException("El estado '{$estado}' no es válido.");
        }

        $postulante->update(['estado' => $estado]);

        return $postulante->fresh();
    }

    public function generarAleatorios(int $cantidad = 60): Collection
    {
        return DB::transaction(function () use ($cantidad) {
            $gestion = Gestion::query()
                ->where('activa', true)
                ->orderByDesc('anio')
                ->orderByDesc('id')
                ->first()
                ?? Gestion::query()->orderByDesc('anio')->orderByDesc('id')->first();

            if (!$gestion) {
                throw new \RuntimeException('No hay gestiones registradas para generar postulantes.');
            }

            $carreras = Carrera::query()->orderBy('id')->get();

            if ($carreras->count() < 2) {
                throw new \RuntimeException('Se requieren al menos dos carreras para generar postulantes.');
            }

            $baseCi = (int) collect(Postulante::query()->lockForUpdate()->pluck('ci'))
                ->map(static fn ($ci) => (int) $ci)
                ->max();
            $now = now();
            $records = [];
            $nombresCount = count(self::NOMBRES);
            $apellidosCount = count(self::APELLIDOS);
            $ciudadesCount = count(self::CIUDADES);

            for ($i = 1; $i <= $cantidad; $i++) {
                $ci = (string) ($baseCi + $i);
                $carreraPrimeraId = $carreras->random()->id;
                $carrerasSecundarias = $carreras->where('id', '!=', $carreraPrimeraId)->values();
                $carreraSegundaId = $carrerasSecundarias->isNotEmpty() && random_int(0, 1) === 1
                    ? $carrerasSecundarias->random()->id
                    : null;

                $record = [
                    'ci' => $ci,
                    'nombres' => self::NOMBRES[($i - 1) % $nombresCount],
                    'apellidos' => self::APELLIDOS[intdiv($i - 1, $nombresCount) % $apellidosCount],
                    'fecha_nacimiento' => now()->subYears(18)->subDays($i)->format('Y-m-d'),
                    'sexo' => random_int(0, 1) === 1 ? 'M' : 'F',
                    'direccion' => "Zona {$i}, Calle {$ci}",
                    'telefono' => '7' . str_pad($ci, 7, '0', STR_PAD_LEFT),
                    'email' => "postulante{$ci}@example.test",
                    'colegio_procedencia' => 'Colegio ' . self::CIUDADES[($i - 1) % $ciudadesCount] . ' ' . $ci,
                    'ciudad' => self::CIUDADES[($i - 1) % $ciudadesCount] . " {$i}",
                    'carrera_primera_id' => $carreraPrimeraId,
                    'carrera_segunda_id' => $carreraSegundaId,
                    'tiene_carnet_identidad' => true,
                    'tiene_foto' => true,
                    'tiene_diploma_bachiller' => true,
                    'gestion_id' => $gestion->id,
                    'estado' => 'inscrito',
                    'carrera_asignada_id' => null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];

                $records[] = $record;
            }

            Postulante::query()->insert($records);

            $postulantes = Postulante::query()
                ->with(['carreraPrimera', 'carreraSegunda', 'carreraAsignada', 'gestion'])
                ->whereIn('ci', array_column($records, 'ci'))
                ->orderBy('created_at', 'desc')
                ->get();

            $postulantes->each(function (Postulante $postulante): void {
                $this->userService->syncPostulanteAccount($postulante);
            });

            return $postulantes;
        });
    }
}
