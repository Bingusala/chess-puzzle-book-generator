<?php

use Illuminate\Support\Facades\Route;

// All web routes serve the React SPA
Route::get('/{any?}', fn () => view('app'))->where('any', '.*');
