<?php

return [
    /*
    |--------------------------------------------------------------------------
    | CUP Configuration
    |--------------------------------------------------------------------------
    |
    | CAPACIDAD_GRUPO: Maximum number of students per group.
    | Default: 70. Can be overridden via .env: CUP_CAPACIDAD_GRUPO=80
    |
    */

    'capacidad_grupo' => (int) env('CUP_CAPACIDAD_GRUPO', 70),
];
