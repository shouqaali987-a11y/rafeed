document.addEventListener('DOMContentLoaded', function() {
    initializeSettingsMenu();
    initializeToggles();
    initializeProfileImage();
    loadUserSettings();
});
function initializeSettingsMenu() {
    const menuItems = document.querySelectorAll('.settings-menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetSection = this.dataset.section;
            menuItems.forEach(i => i.classList.remove('active'));
            document.querySelectorAll('.settings-section').forEach(s => s.classList.remove('active'));
            this.classList.add('active');
            document.getElementById(targetSection).classList.add('active');
        });
    });
}
function initializeToggles() {
    const toggles = document.querySelectorAll('.toggle-switch');
    toggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            this.classList.toggle('active');
            const settingName = this.dataset.setting;
            const isActive = this.classList.contains('active');
            saveSetting(settingName, isActive);
        });
    });
}
function initializeProfileImage() {
    const uploadBtn = document.querySelector('.profile-image-upload');
    const fileInput = document.getElementById('profileImageInput');
    if (uploadBtn && fileInput) {
        uploadBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    showToast('تم تحميل الصورة بنجاح', 'success');
                };
                reader.readAsDataURL(this.files[0]);
            }
        });
    }
}
function loadUserSettings() {
    const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
    if (user.name) {
        const nameInput = document.getElementById('fullName');
        if (nameInput) nameInput.value = user.name;
    }
    if (user.email) {
        const emailInput = document.getElementById('email');
        if (emailInput) emailInput.value = user.email;
    }
}
function saveGeneralSettings() {
    const form = document.getElementById('generalSettingsForm');
    if (!form) return;
    const formData = new FormData(form);
    const settings = {
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        role: formData.get('role')
    };
    const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
    Object.assign(user, settings);
    if (localStorage.getItem('user')) {
        localStorage.setItem('user', JSON.stringify(user));
    } else {
        sessionStorage.setItem('user', JSON.stringify(user));
    }
    showToast('تم حفظ الإعدادات بنجاح', 'success');
}
function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    if (!currentPassword || !newPassword || !confirmPassword) {
        showToast('يرجى ملء جميع الحقول', 'warning');
        return;
    }
    if (newPassword !== confirmPassword) {
        showToast('كلمتا المرور غير متطابقتين', 'error');
        return;
    }
    if (newPassword.length < 8) {
        showToast('كلمة المرور يجب أن تكون 8 أحرف على الأقل', 'error');
        return;
    }
    setTimeout(() => {
        showToast('تم تغيير كلمة المرور بنجاح', 'success');
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmNewPassword').value = '';
    }, 1000);
}
function saveSystemSettings() {
    const language = document.getElementById('systemLanguage').value;
    const timezone = document.getElementById('timezone').value;
    const dateFormat = document.getElementById('dateFormat').value;
    const settings = { language, timezone, dateFormat };
    localStorage.setItem('systemSettings', JSON.stringify(settings));
    showToast('تم حفظ إعدادات النظام بنجاح', 'success');
}
function saveNotificationSettings() {
    const emailNotifications = document.querySelector('[data-setting="emailNotifications"]').classList.contains('active');
    const smsNotifications = document.querySelector('[data-setting="smsNotifications"]').classList.contains('active');
    const pushNotifications = document.querySelector('[data-setting="pushNotifications"]').classList.contains('active');
    const settings = { emailNotifications, smsNotifications, pushNotifications };
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
    showToast('تم حفظ إعدادات الإشعارات بنجاح', 'success');
}
function logoutAllDevices() {
    if (confirm('هل أنت متأكد من تسجيل الخروج من جميع الأجهزة؟')) {
        setTimeout(() => {
            showToast('تم تسجيل الخروج من جميع الأجهزة', 'success');
        }, 1000);
    }
}
function logoutDevice(deviceId) {
    if (confirm('هل أنت متأكد من تسجيل الخروج من هذا الجهاز؟')) {
        const deviceElement = document.querySelector(`[data-device="${deviceId}"]`);
        if (deviceElement) {
            deviceElement.remove();
            showToast('تم تسجيل الخروج من الجهاز', 'success');
        }
    }
}
function deleteAccount() {
    const confirmed = confirm('⚠️ تحذير: هذا الإجراء لا يمكن التراجع عنه!\n\nهل أنت متأكد من حذف حسابك؟');
    if (confirmed) {
        const doubleConfirm = confirm('هل أنت متأكد تماماً؟ سيتم حذف جميع بياناتك نهائياً!');
        if (doubleConfirm) {
            showToast('جاري حذف الحساب...', 'info');
            setTimeout(() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = 'index.html';
            }, 2000);
        }
    }
}
function exportData() {
    showToast('جاري تحضير البيانات للتصدير...', 'info');
    setTimeout(() => {
        const data = {
            user: JSON.parse(localStorage.getItem('user') || '{}'),
            settings: localStorage,
            exportDate: new Date().toISOString()
        };
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `rafeed-data-${Date.now()}.json`;
        link.click();
        showToast('تم تصدير البيانات بنجاح', 'success');
    }, 1500);
}
function saveSetting(name, value) {
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');
    settings[name] = value;
    localStorage.setItem('settings', JSON.stringify(settings));
    console.log(`تم حفظ ${name}: ${value}`);
}
function showToast(message, type = 'info') {
    if (window.RafeedUtils && window.RafeedUtils.showToast) {
        window.RafeedUtils.showToast(message, type);
    } else {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type} show`;
        toast.innerHTML = `<i class="fas fa-${getToastIcon(type)}"></i><span>${message}</span>`;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}
function getToastIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'times-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}