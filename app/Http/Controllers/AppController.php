<?php

namespace App\Http\Controllers;

class AppController extends Controller
{
    public function index()
    {
        $v = fn ($f) => @filemtime(public_path($f)) ?: time();

        return view('app', [
            'jsVersion' => $v('app/app.js'),
            'cssVersion' => $v('app/app.css'),
        ]);
    }
}
