document.addEventListener('DOMContentLoaded', function() {
    initializeAuthForms();
    initializePasswordToggle();
    initializePasswordStrength();
});
function initializeAuthForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
}
async function handleLogin(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const email = form.querySelector('#email').value;
    const password = form.querySelector('#password').value;
    const remember = form.querySelector('#remember')?.checked;
    if (!email || !password) {
        showAuthError('يرجى ملء جميع الحقول');
        return;
    }
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري تسجيل الدخول...';
    try {
        await simulateAPICall();
        const userData = {
            email,
            name: 'مدير النظام',
            role: 'admin'
        };
        if (remember) {
            localStorage.setItem('user', JSON.stringify(userData));
        } else {
            sessionStorage.setItem('user', JSON.stringify(userData));
        }
        showAuthSuccess('تم تسجيل الدخول بنجاح');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    } catch (error) {
        showAuthError('بيانات الدخول غير صحيحة');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> تسجيل الدخول';
    }
}
async function handleRegister(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const name = form.querySelector('#name').value;
    const email = form.querySelector('#email').value;
    const password = form.querySelector('#password').value;
    const confirmPassword = form.querySelector('#confirmPassword').value;
    if (!name || !email || !password || !confirmPassword) {
        showAuthError('يرجى ملء جميع الحقول');
        return;
    }
    if (password !== confirmPassword) {
        showAuthError('كلمتا المرور غير متطابقتين');
        return;
    }
    if (password.length < 8) {
        showAuthError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
        return;
    }
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري إنشاء الحساب...';
    try {
        await simulateAPICall();
        showAuthSuccess('تم إنشاء الحساب بنجاح');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    } catch (error) {
        showAuthError('حدث خطأ أثناء إنشاء الحساب');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> إنشاء حساب';
    }
}
function initializePasswordToggle() {
    const toggles = document.querySelectorAll('.password-toggle');
    toggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const icon = this.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
}
function initializePasswordStrength() {
    const passwordInput = document.querySelector('#password');
    const strengthFill = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text');
    if (!passwordInput || !strengthFill) return;
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const strength = calculatePasswordStrength(password);
        strengthFill.className = 'strength-fill';
        if (password.length === 0) {
            strengthFill.style.width = '0';
            strengthText.textContent = '';
        } else if (strength < 30) {
            strengthFill.classList.add('weak');
            strengthText.textContent = 'ضعيفة';
        } else if (strength < 60) {
            strengthFill.classList.add('medium');
            strengthText.textContent = 'متوسطة';
        } else {
            strengthFill.classList.add('strong');
            strengthText.textContent = 'قوية';
        }
    });
}
function calculatePasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 20;
    return Math.min(strength, 100);
}
function showAuthError(message) {
    showAuthMessage(message, 'error');
}
function showAuthSuccess(message) {
    showAuthMessage(message, 'success');
}
function showAuthMessage(message, type) {
    const existingMessage = document.querySelector('.auth-message');
    if (existingMessage) existingMessage.remove();
    const messageDiv = document.createElement('div');
    messageDiv.className = `auth-message auth-message-${type}`;
    messageDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    const form = document.querySelector('.auth-form');
    form.insertBefore(messageDiv, form.firstChild);
    setTimeout(() => messageDiv.remove(), 5000);
}
function simulateAPICall() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({ success: true });
        }, 1500);
    });
}
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null');
    return user;
}
function logout() {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    window.location.href = 'login.html';
}
window.AuthUtils = {
    checkAuth,
    logout
};