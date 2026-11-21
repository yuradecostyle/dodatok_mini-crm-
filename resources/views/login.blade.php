<!doctype html>
<html lang="uk">
<head>
    @include('_head')
    <title>Вхід · Mini CRM</title>
</head>
<body>
<div class="login-wrap">
    <form class="login" method="POST" action="/login">
        @csrf
        <img class="logo" src="/icons/icon-192.png" alt="">
        <h1>Mini CRM</h1>
        <p>Особистий простір. Увійдіть, щоб продовжити.</p>
        @if ($errors->any())
            <div class="err">{{ $errors->first() }}</div>
        @endif
        <div class="f">
            <label for="email">Email</label>
            <input id="email" type="email" name="email" value="{{ old('email') }}" autocomplete="username" required autofocus>
        </div>
        <div class="f">
            <label for="password">Пароль</label>
            <input id="password" type="password" name="password" autocomplete="current-password" required>
        </div>
        <button class="btn" type="submit">Увійти</button>
    </form>
</div>
</body>
</html>
