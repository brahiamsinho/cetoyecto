<?php
$tz = new DateTimeZone('America/La_Paz');
$now = new DateTime('now', $tz);
echo 'Hora Bolivia: ' . $now->format('Y-m-d H:i:s') . ' ' . $tz->getName() . PHP_EOL;

$utc = new DateTime('now', new DateTimeZone('UTC'));
echo 'Hora UTC: ' . $utc->format('Y-m-d H:i:s') . ' UTC' . PHP_EOL;
