document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const errorBox = document.getElementById('auth-error');

    const urlParams = new URLSearchParams(window.location.search);
    const redirectTarget = urlParams.get('redirect') || 'index.html';

    function showError(message) {
        if (!errorBox) return;
        errorBox.textContent = message;
        errorBox.style.display = 'block';
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (errorBox) errorBox.style.display = 'none';

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const submitBtn = loginForm.querySelector('button[type="submit"]');

            try {
                if (submitBtn) submitBtn.disabled = true;
                await API.login(email, password);
                window.location.href = redirectTarget;
            } catch (error) {
                showError(error.message || 'Invalid email or password');
                if (submitBtn) submitBtn.disabled = false;
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (errorBox) errorBox.style.display = 'none';

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const submitBtn = registerForm.querySelector('button[type="submit"]');

            if (password !== confirmPassword) {
                showError('Passwords do not match');
                return;
            }

            try {
                if (submitBtn) submitBtn.disabled = true;
                await API.register(email, password);
                window.location.href = redirectTarget;
            } catch (error) {
                showError(error.message || 'Registration failed');
                if (submitBtn) submitBtn.disabled = false;
            }
        });
    }
});