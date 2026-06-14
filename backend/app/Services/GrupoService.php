<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Grupo;
use App\Models\Gestion;
use App\Models\Materia;
use App\Models\Postulante;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class GrupoService
{
    private const GRUPO_PREFIX = 'Z';
    private const MATERIAS_OBLIGATORIAS = ['Computación', 'Física', 'Inglés', 'Matemáticas'];

    public function getCapacidadGrupo(): int
    {
        return (int) config('cup.capacidad_grupo', 70);
    }

    public function asignarEstudiantes(Collection $grupos, Collection $postulantes): void
    {
        $gruposArray = $this->ordenarGruposFijos($grupos);
        $capacidad = $this->getCapacidadGrupo();
        $restantes = $postulantes->values();

        if ($gruposArray->isEmpty()) {
            return;
        }

        $gruposArray->each(function ($grupo) use (&$restantes, $capacidad) {
            $asignados = $restantes->take($capacidad);
            $grupo->postulantes()->sync($asignados->pluck('id')->all());
            $restantes = $restantes->slice($capacidad)->values();
        });
    }

    public function generarGrupos(Request $request): Collection
    {
        $gestion = $this->resolverGestion();
        $materiasObligatorias = $this->resolverMateriasObligatorias();
        $capacidad = $this->getCapacidadGrupo();

        $postulantes = Postulante::where('estado', 'inscrito')->orderBy('id')->get();

        $cantGrupos = max(1, (int) ceil($postulantes->count() / $capacidad));
        $codigosNecesarios = array_map(fn ($i) => self::GRUPO_PREFIX . $i, range(1, $cantGrupos));

        Grupo::query()
            ->where('codigo', 'LIKE', self::GRUPO_PREFIX . '%')
            ->whereNotIn('codigo', $codigosNecesarios)
            ->delete();

        $grupos = collect();

        foreach ($codigosNecesarios as $codigo) {
            $grupo = Grupo::updateOrCreate(
                ['codigo' => $codigo],
                [
                    'nombre' => $codigo,
                    'gestion_id' => $gestion->id,
                ]
            );

            $grupo->materias()->sync($materiasObligatorias->pluck('id')->all());
            $grupos->push($grupo->fresh(['materias']));
        }

        $this->asignarEstudiantes($grupos, $postulantes);

        return $this->gruposVisibles();
    }

    public function gruposVisibles(): Collection
    {
        return $this->filtrarGruposVisibles(
            Grupo::with('materias')
                ->withCount('postulantes as estudiantes_count')
                ->where('codigo', 'LIKE', self::GRUPO_PREFIX . '%')
                ->orderByRaw("CAST(SUBSTR(codigo, 2) AS INTEGER)")
                ->get()
        );
    }

    public function prepararGrupos(Collection $grupos): Collection
    {
        $gruposOrdenados = $this->ordenarGruposFijos($grupos);
        $capacidad = $this->getCapacidadGrupo();
        $grupoAnteriorLleno = true;

        return $gruposOrdenados->map(function ($grupo, $index) use (&$grupoAnteriorLleno, $capacidad) {
            $inscritos = (int) ($grupo->estudiantes_count ?? 0);
            $habilitado = $index === 0 ? true : $grupoAnteriorLleno;

            $grupo->setAttribute('capacidad_grupo', $capacidad);
            $grupo->setAttribute('cupo_maximo', $capacidad);
            $grupo->setAttribute('cupo_disponible', max(0, $capacidad - $inscritos));
            $grupo->setAttribute('habilitado', $habilitado);
            $grupo->setAttribute('enabled', $habilitado);
            $grupo->setAttribute('visible', $habilitado);

            $grupoAnteriorLleno = $inscritos >= $capacidad;

            return $grupo;
        });
    }

    private function filtrarGruposVisibles(Collection $grupos): Collection
    {
        return $this->prepararGrupos($grupos)
            ->filter(fn ($grupo) => (bool) $grupo->visible)
            ->values();
    }

    private function resolverMateriasObligatorias(): Collection
    {
        $materias = collect();

        foreach (self::MATERIAS_OBLIGATORIAS as $nombreMateria) {
            $materia = Materia::query()
                ->where('nombre', $nombreMateria)
                ->first();

            if (! $materia) {
                throw new \RuntimeException("No se encontró la materia obligatoria: {$nombreMateria}.");
            }

            $materias->push($materia);
        }

        return $materias;
    }

    private function resolverGestion(): Gestion
    {
        return Gestion::query()
            ->where('activa', true)
            ->orderByDesc('anio')
            ->orderByDesc('periodo')
            ->first()
            ?? Gestion::query()
                ->orderByDesc('anio')
                ->orderByDesc('periodo')
                ->first()
            ?? throw new \RuntimeException('No hay una gestión disponible para generar grupos.');
    }

    private function ordenarGruposFijos(Collection $grupos): Collection
    {
        return $grupos->sortBy(function ($grupo) {
            if (preg_match('/^' . self::GRUPO_PREFIX . '(\d+)$/', $grupo->codigo, $m)) {
                return (int) $m[1];
            }

            return PHP_INT_MAX;
        })->values();
    }

}
