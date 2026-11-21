<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function show()
    {
        return Auth::check() ? redirect('/') : view('login');
    }

    public function login(Request $request)
    {
        $data = $request->validate(['email' => 'required|email', 'password' => 'required|string']);
        if (! Auth::attempt($data, true)) {
            return back()->withInput(['email' => $data['email']])->withErrors(['email' => 'Невірний email або пароль']);
        }
        $request->session()->regenerate();

        return redirect()->intended('/');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login');
    }

    public function password(Request $request)
    {
        $data = $request->validate([
            'current' => 'required|string',
            'password' => 'required|string|min:10',
        ]);
        $user = $request->user();
        if (! Hash::check($data['current'], $user->password)) {
            return response()->json(['message' => 'Поточний пароль невірний'], 422);
        }
        $user->update(['password' => $data['password']]);

        return ['ok' => true];
    }
}
