<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AsistenciaController;
use App\Http\Controllers\AulaController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BitacoraController;
use App\Http\Controllers\CargaHorariaController;
use App\Http\Controllers\CarreraController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocenteController;
use App\Http\Controllers\GrupoController;
use App\Http\Controllers\HorarioController;
use App\Http\Controllers\ImportacionController;
use App\Http\Controllers\MateriaController;
use App\Http\Controllers\NotaController;
use App\Http\Controllers\PagoController;
use App\Http\Controllers\PostulanteController;
use App\Http\Controllers\ReporteController;
use App\Http\Controllers\ReporteExportController;
use App\Http\Controllers\ReporteIaController;
use App\Http\Controllers\ReportePersonalizadoController;
use App\Http\Controllers\RequisitoController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\ChatbotController;
use App\Http\Controllers\UserController;
use App\Services\CupoService;

/*
|--------------------------------------------------------------------------
| API Routes -- CUP-FICCT Admission System
|--------------------------------------------------------------------------
*/

// ─── Auth — Public ────────────────────────────────────────────────────
Route::post('auth/login', [AuthController::class, 'login']);
Route::post('auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('auth/reset-password', [AuthController::class, 'resetPassword']);

// ─── Auth — Protected ─────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('auth/me', [AuthController::class, 'me']);
});

// ─── Authenticated Routes ─────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // ─── Dashboard ────────────────────────────────────────────────────
    Route::get('dashboard/stats', [DashboardController::class, 'stats']);
    Route::post('dashboard/resumen-ia', [DashboardController::class, 'resumenIa']);

    // ─── Users & Roles (CPD only) ─────────────────────────────────────
    Route::middleware('role.cpd')->group(function () {
        Route::apiResource('users', UserController::class)->except(['create', 'edit']);
        Route::put('users/{user}/activate', [UserController::class, 'activate']);
        Route::get('roles', [RoleController::class, 'index']);
    });

    // ─── Postulantes ──────────────────────────────────────────────────
    Route::apiResource('postulantes', PostulanteController::class)->except(['create', 'edit']);
    Route::post('postulantes/generar-aleatorios', [PostulanteController::class, 'generarAleatorios']);
    Route::post('postulantes/completar-datos', [PostulanteController::class, 'completarDatos']);
    Route::patch('postulantes/{postulante}/estado', [PostulanteController::class, 'cambiarEstado']);

    // ─── Requisitos ───────────────────────────────────────────────────
    Route::get('postulantes/{postulante}/requisitos', [RequisitoController::class, 'index']);
    Route::post('postulantes/{postulante}/requisitos', [RequisitoController::class, 'store']);
    Route::patch('requisitos/{requisito}/toggle', [RequisitoController::class, 'toggle']);

    // ─── Pagos ────────────────────────────────────────────────────────
    Route::get('postulantes/{postulante}/pago', [PagoController::class, 'show']);
    Route::post('postulantes/{postulante}/pago/simular', [PagoController::class, 'register']);
    Route::post('postulantes/{postulante}/payment-intent', [PagoController::class, 'createPaymentIntent']);
    Route::patch('pagos/{pago}/estado', [PagoController::class, 'cambiarEstado']);

    // ─── Notas ────────────────────────────────────────────────────────
    Route::get('postulantes/{postulante}/notas', [NotaController::class, 'index']);
    Route::post('postulantes/{postulante}/notas', [NotaController::class, 'store']);
    Route::put('notas/{nota}', [NotaController::class, 'update']);
    Route::get('postulantes/{postulante}/promedios', [NotaController::class, 'promedios']);

    // ─── Carreras ─────────────────────────────────────────────────────
    Route::apiResource('carreras', CarreraController::class)->except(['create', 'edit']);
    Route::get('carreras/{carrera}/cupos', [CarreraController::class, 'cupos']);

    // ─── Gestiones ────────────────────────────────────────────────────
    Route::get('gestiones', function () {
        return response()->json([
            'success' => true,
            'data' => \App\Models\Gestion::where('activa', true)->orderBy('anio', 'desc')->orderBy('periodo', 'desc')->get(),
        ]);
    });
    Route::post('gestiones', function (\Illuminate\Http\Request $request) {
        $request->validate([
            'anio' => 'required|integer|min:2020|max:2030',
            'periodo' => 'required|string|in:1,2,I,II',
        ]);
        $gestion = \App\Models\Gestion::create([
            'anio' => $request->anio,
            'periodo' => $request->periodo,
            'activa' => true,
        ]);
        return response()->json(['success' => true, 'data' => $gestion], 201);
    });
    Route::delete('gestiones/{gestion}', function (\App\Models\Gestion $gestion) {
        $gestion->update(['activa' => false]);
        return response()->json(['success' => true, 'message' => 'Gestión desactivada.']);
    });

    // ─── Cupos ────────────────────────────────────────────────────────
    Route::post('cupos/asignar-carrera/{postulante}', function ($postulante) {
        $service = app(CupoService::class);
        return $service->asignarCarrera(\App\Models\Postulante::findOrFail($postulante));
    });
    Route::middleware('role.cpd')->post('cupos/resolver-merito', function () {
        $result = app(\App\Services\CupoService::class)->resolverPorMerito();
        return response()->json(['success' => true, 'data' => $result]);
    });

    // ─── Grupos ───────────────────────────────────────────────────────
    Route::get('grupos', [GrupoController::class, 'index']);
    Route::middleware('role.cpd')->post('grupos/generar', [GrupoController::class, 'generarGrupos']);
    Route::get('grupos/{grupo}', [GrupoController::class, 'show']);
    Route::get('grupos/{grupo}/estudiantes', [GrupoController::class, 'estudiantes']);

    // ─── Docentes ─────────────────────────────────────────────────────
    Route::apiResource('docentes', DocenteController::class)->except(['create', 'edit']);
    Route::post('docentes/{docente}/validar-requisitos', [DocenteController::class, 'validarRequisitos']);

    // ─── Carga Horaria ────────────────────────────────────────────────
    Route::get('carga-horaria', [CargaHorariaController::class, 'index']);
    Route::post('carga-horaria', [CargaHorariaController::class, 'store']);
    Route::middleware('role.cpd')->post('carga-horaria/regenerar', [CargaHorariaController::class, 'regenerarDataset']);
    Route::delete('carga-horaria/{cargaHoraria}', [CargaHorariaController::class, 'destroy']);
    Route::get('docentes/{docente}/carga-horaria', [CargaHorariaController::class, 'porDocente']);

    // ─── Aulas ────────────────────────────────────────────────────────
    Route::apiResource('aulas', AulaController::class)->except(['create', 'edit']);

    // ─── Materias ─────────────────────────────────────────────────────
    Route::apiResource('materias', MateriaController::class)->except(['create', 'edit']);

    // ─── Horarios ─────────────────────────────────────────────────────
    Route::apiResource('horarios', HorarioController::class)->except(['create', 'edit']);

    // ─── Asistencias ──────────────────────────────────────────────────
    Route::post('asistencias', [AsistenciaController::class, 'store']);
    Route::get('asistencias', [AsistenciaController::class, 'index']);
    // Route::get('asistencias/{grupo}', [AsistenciaController::class, 'porGrupo']); // Método no implementado

    // ─── Reportes ─────────────────────────────────────────────────────
    Route::prefix('reportes')->group(function () {
        Route::get('postulantes', [ReporteController::class, 'postulantes']);
        Route::get('aprobados', [ReporteController::class, 'aprobados']);
        Route::get('reprobados', [ReporteController::class, 'reprobados']);
        Route::get('promedios', [ReporteController::class, 'promedios']);
        Route::get('grupos', [ReporteController::class, 'grupos']);
        Route::get('estadisticas-materia', [ReporteController::class, 'estadisticasMateria']);
        Route::get('docentes-grupos', [ReporteController::class, 'docentesGrupos']);
        Route::get('grupos-mas-aprobados', [ReporteController::class, 'gruposMasAprobados']);
        Route::get('asistencia-docente', [ReporteController::class, 'asistenciaDocente']);
        Route::get('cupos-carrera', [ReporteController::class, 'cuposCarrera']);
        
        // Reportes personalizados con Gemini
        Route::post('personalizado', [ReportePersonalizadoController::class, 'generar']);
        Route::get('descargar/{nombreArchivo}', [ReportePersonalizadoController::class, 'descargar']);

        // Exportación de reportes (Excel y PDF)
        Route::get('exportar/{reportKey}/excel', [ReporteExportController::class, 'exportExcel']);
        Route::get('exportar/{reportKey}/pdf', [ReporteExportController::class, 'exportPdf']);

        // Reportes personalizados con IA
        Route::post('ia/generar', [ReporteIaController::class, 'generar']);
        Route::get('ia/historial', [ReporteIaController::class, 'historial']);
        Route::get('ia/{id}/excel', [ReporteIaController::class, 'exportarExcel']);
        Route::get('ia/{id}/pdf', [ReporteIaController::class, 'exportarPdf']);
    });

    // ─── Importaciones (CPD only) ─────────────────────────────────────
    Route::middleware('role.cpd')->group(function () {
        Route::post('importaciones/usuarios', [ImportacionController::class, 'importarUsuarios']);
        Route::get('importaciones', [ImportacionController::class, 'index']);
    });

    // ─── Bitácora (CPD only) ──────────────────────────────────────────
    Route::middleware('role.cpd')->group(function () {
        Route::get('bitacora', [BitacoraController::class, 'index']);
    });

    // ─── Chatbot ──────────────────────────────────────────────────────────
    Route::post('chatbot/message', [ChatbotController::class, 'chat']);
});
