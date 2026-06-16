<?php

use App\Http\Controllers\Api\FenBookController;
use Illuminate\Support\Facades\Route;

Route::post('/fen/book', [FenBookController::class, 'create']);
