<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Importacion;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ImportacionService
{
    private const ROLE_KEYS = [
        'rol_id',
        'rol',
        'role',
        'role_id',
        'role_name',
        'rol_nombre',
        'nombre_rol',
    ];

    public function procesarCSV(string $filePath): array
    {
        $rows = [];
        $handle = fopen($filePath, 'r');

        if (!$handle) {
            throw new \RuntimeException('No se pudo abrir el archivo.');
        }

        $headers = fgetcsv($handle);

        if (!$headers) {
            fclose($handle);
            throw new \RuntimeException('El archivo CSV no tiene encabezados.');
        }

        $headers = array_map(function ($header) {
            return ltrim(trim($header), "\xEF\xBB\xBF");
        }, $headers);

        while (($data = fgetcsv($handle)) !== false) {
            if (count($data) === count($headers)) {
                $row = array_combine($headers, array_map(function ($value) {
                    return ltrim(trim($value), "\xEF\xBB\xBF");
                }, $data));
                $rows[] = $row;
            }
        }

        fclose($handle);

        return $rows;
    }

    public function procesarXLSX(string $filePath): array
    {
        $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($filePath);
        $worksheet = $spreadsheet->getActiveSheet();
        $rows = [];

        $headers = [];
        foreach ($worksheet->getRowIterator() as $rowIndex => $row) {
            $cellIterator = $row->getCellIterator();
            $cellIterator->setIterateOnlyExistingCells(false);
            $data = [];
            foreach ($cellIterator as $cell) {
                $data[] = trim((string) $cell->getValue());
            }

            if (empty($headers)) {
                $headers = array_map(function ($header) {
                    return ltrim(trim($header), "\xEF\xBB\xBF");
                }, $data);
                continue;
            }

            if (count($data) === count($headers)) {
                $rowData = array_combine($headers, array_map(function ($value) {
                    return ltrim(trim($value), "\xEF\xBB\xBF");
                }, $data));
                $rows[] = $rowData;
            }
        }

        return $rows;
    }

    public function crearUsuarios(array $rows, int $userId): array
    {
        $exitosas = 0;
        $fallidas = 0;
        $errores = [];

        foreach ($rows as $index => $row) {
            $filaNum = $index + 2;

            try {
                $name = $row['name'] ?? '';
                $email = $row['email'] ?? '';
                $rolId = $this->resolverRolId($row);
                $password = $row['password'] ?? $this->generarPasswordTemporal();

                if (empty($name) || empty($email)) {
                    $errores[] = "Fila {$filaNum}: name y email son obligatorios.";
                    $fallidas++;
                    continue;
                }

                $user = User::where('email', $email)->first();

                if ($user) {
                    $user->update([
                        'name' => $name,
                        'password' => Hash::make($password),
                        'rol_id' => $rolId,
                    ]);
                } else {
                    User::create([
                        'name' => $name,
                        'email' => $email,
                        'password' => Hash::make($password),
                        'rol_id' => $rolId,
                    ]);
                }

                $exitosas++;
            } catch (\Exception $e) {
                $errores[] = "Fila {$filaNum}: " . $e->getMessage();
                $fallidas++;
            }
        }

        return [
            'exitosas' => $exitosas,
            'fallidas' => $fallidas,
            'errores' => $errores,
        ];
    }

    public function generarPasswordTemporal(): string
    {
        $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        return substr(str_shuffle(str_repeat($chars, 8)), 0, 8);
    }

    private function resolverRolId(array $row): int
    {
        $rolExplicito = false;

        foreach (self::ROLE_KEYS as $key) {
            if (!array_key_exists($key, $row)) {
                continue;
            }

            $valor = trim((string) $row[$key]);

            if ($valor === '') {
                continue;
            }

            $rolExplicito = true;

            if (in_array($key, ['rol_id', 'role_id'], true) && ctype_digit($valor)) {
                $role = Role::find((int) $valor);
                if ($role) {
                    return $role->id;
                }
            }

            $role = $this->buscarRolePorNombre($valor);
            if ($role) {
                return $role->id;
            }
        }

        if ($rolExplicito) {
            throw new \InvalidArgumentException('el rol indicado no es válido.');
        }

        return 1;
    }

    private function buscarRolePorNombre(string $valor): ?Role
    {
        $normalizado = $this->normalizarTexto($valor);

        return Role::all()->first(function (Role $role) use ($normalizado) {
            return $this->normalizarTexto($role->nombre) === $normalizado;
        });
    }

    private function normalizarTexto(string $valor): string
    {
        return Str::of($valor)->squish()->ascii()->lower()->toString();
    }
}
