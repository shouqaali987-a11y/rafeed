let alerts = [];
let currentFilter = 'all';
let alertSound;
document.addEventListener('DOMContentLoaded', function() {
    initializeAlerts();
    initializeFilters();
    initializeModal();
    startAlertPolling();
});
function initializeAlerts() {
    alertSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQAAdaH');
    loadAlerts();
}
function loadAlerts() {
    alerts = [
        {
            id: 'ALT-001',
            type: 'sos',
            braceletId: 'RFID-785421',
            pilgrimName: 'أحمد محمد السعيد العتيبي',
            nationality: 'السعودية 🇸🇦',
            age: 62,
            permitNumber: 'PMT-2024-78523',
            location: { lat: 21.4225, lng: 39.8262, name: 'منى - المخيم 42' },
            healthStatus: 'إغماء - يحتاج إسعاف فوري',
            heartRate: 145,
            temperature: 38.9,
            timestamp: new Date(Date.now() - 5 * 60000),
            status: 'new',
            priority: 'critical'
        },
        {
            id: 'ALT-002',
            type: 'health',
            braceletId: 'RFID-632158',
            pilgrimName: 'عبدالرحمن خالد العمري',
            nationality: 'الأردن 🇯🇴',
            age: 58,
            permitNumber: 'PMT-2024-96541',
            location: { lat: 21.4230, lng: 39.8270, name: 'عرفات - المنطقة أ' },
            healthStatus: 'ارتفاع في ضغط الدم',
            heartRate: 125,
            temperature: 37.8,
            timestamp: new Date(Date.now() - 15 * 60000),
            status: 'processing',
            priority: 'high'
        },
        {
            id: 'ALT-003',
            type: 'location',
            braceletId: 'RFID-458963',
            pilgrimName: 'محمد فهد القحطاني',
            nationality: 'السعودية 🇸🇦',
            age: 45,
            permitNumber: 'PMT-2024-45632',
            location: { lat: 21.4220, lng: 39.8255, name: 'مزدلفة - منطقة محظورة' },
            healthStatus: 'جيد',
            heartRate: 85,
            temperature: 37.0,
            timestamp: new Date(Date.now() - 45 * 60000),
            status: 'resolved',
            priority: 'medium'
        },
        {
            id: 'ALT-004',
            type: 'sos',
            braceletId: 'RFID-321987',
            pilgrimName: 'سعد ناصر الدوسري',
            nationality: 'السعودية 🇸🇦',
            age: 70,
            permitNumber: 'PMT-2024-12589',
            location: { lat: 21.4235, lng: 39.8265, name: 'الجمرات - الجمرة الكبرى' },
            healthStatus: 'ضيق تنفس شديد',
            heartRate: 138,
            temperature: 38.5,
            timestamp: new Date(Date.now() - 2 * 60000),
            status: 'new',
            priority: 'critical'
        },
        {
            id: 'ALT-005',
            type: 'health',
            braceletId: 'RFID-741258',
            pilgrimName: 'عبدالله علي الشمري',
            nationality: 'الكويت 🇰🇼',
            age: 55,
            permitNumber: 'PMT-2024-85214',
            location: { lat: 21.4183, lng: 39.8886, name: 'منى - طريق المشاة' },
            healthStatus: 'ارتفاع حرارة - جفاف',
            heartRate: 115,
            temperature: 39.2,
            timestamp: new Date(Date.now() - 8 * 60000),
            status: 'processing',
            priority: 'high'
        },
        {
            id: 'ALT-006',
            type: 'crowd',
            braceletId: 'RFID-963258',
            pilgrimName: 'فهد راشد المطيري',
            nationality: 'السعودية 🇸🇦',
            age: 42,
            permitNumber: 'PMT-2024-74125',
            location: { lat: 21.4201, lng: 39.8883, name: 'الجمرات - ازدحام شديد' },
            healthStatus: 'مستقر',
            heartRate: 95,
            temperature: 37.2,
            timestamp: new Date(Date.now() - 20 * 60000),
            status: 'processing',
            priority: 'medium'
        },
        {
            id: 'ALT-007',
            type: 'battery',
            braceletId: 'RFID-852147',
            pilgrimName: 'خالد سعيد الغامدي',
            nationality: 'السعودية 🇸🇦',
            age: 48,
            permitNumber: 'PMT-2024-36985',
            location: { lat: 21.3566, lng: 39.9844, name: 'عرفات - المنطقة ب' },
            healthStatus: 'جيد',
            heartRate: 80,
            temperature: 36.8,
            timestamp: new Date(Date.now() - 30 * 60000),
            status: 'new',
            priority: 'low'
        },
        {
            id: 'ALT-008',
            type: 'health',
            braceletId: 'RFID-159753',
            pilgrimName: 'إبراهيم عمر الشهري',
            nationality: 'السعودية 🇸🇦',
            age: 65,
            permitNumber: 'PMT-2024-95184',
            location: { lat: 21.3927, lng: 39.9266, name: 'مزدلفة - المنطقة الشرقية' },
            healthStatus: 'انخفاض سكر - دوار',
            heartRate: 110,
            temperature: 36.5,
            timestamp: new Date(Date.now() - 12 * 60000),
            status: 'processing',
            priority: 'high'
        },
        {
            id: 'ALT-009',
            type: 'location',
            braceletId: 'RFID-357159',
            pilgrimName: 'طارق عادل السبيعي',
            nationality: 'الإمارات 🇦🇪',
            age: 38,
            permitNumber: 'PMT-2024-15973',
            location: { lat: 21.4100, lng: 39.8500, name: 'خارج المنطقة المسموحة' },
            healthStatus: 'جيد جداً',
            heartRate: 78,
            temperature: 36.9,
            timestamp: new Date(Date.now() - 60 * 60000),
            status: 'resolved',
            priority: 'medium'
        },
        {
            id: 'ALT-010',
            type: 'sos',
            braceletId: 'RFID-951357',
            pilgrimName: 'حسن علي الأحمدي',
            nationality: 'مصر 🇪🇬',
            age: 67,
            permitNumber: 'PMT-2024-48562',
            location: { lat: 21.4228, lng: 39.8275, name: 'منى - المخيم 28' },
            healthStatus: 'آلام في الصدر - حرجة',
            heartRate: 152,
            temperature: 38.1,
            timestamp: new Date(Date.now() - 3 * 60000),
            status: 'new',
            priority: 'critical'
        },
        {
            id: 'ALT-011',
            type: 'health',
            braceletId: 'RFID-753951',
            pilgrimName: 'يوسف إبراهيم المالكي',
            nationality: 'السعودية 🇸🇦',
            age: 52,
            permitNumber: 'PMT-2024-75315',
            location: { lat: 21.4218, lng: 39.8268, name: 'منى - المخيم 55' },
            healthStatus: 'إرهاق شديد',
            heartRate: 105,
            temperature: 37.6,
            timestamp: new Date(Date.now() - 25 * 60000),
            status: 'processing',
            priority: 'medium'
        },
        {
            id: 'ALT-012',
            type: 'crowd',
            braceletId: 'RFID-159357',
            pilgrimName: 'منصور طلال السديري',
            nationality: 'البحرين 🇧🇭',
            age: 44,
            permitNumber: 'PMT-2024-95175',
            location: { lat: 21.4240, lng: 39.8258, name: 'الحرم المكي - ازدحام' },
            healthStatus: 'مستقر',
            heartRate: 92,
            temperature: 37.1,
            timestamp: new Date(Date.now() - 90 * 60000),
            status: 'resolved',
            priority: 'low'
        }
    ];
    renderAlerts();
    updateFilterCounts();
}
function renderAlerts() {
    const tbody = document.getElementById('alertsTableBody');
    if (!tbody) return;
    const filteredAlerts = currentFilter === 'all' 
        ? alerts 
        : alerts.filter(a => a.status === currentFilter);
    tbody.innerHTML = filteredAlerts.map(alert => `
        <tr class="alert-row ${alert.status}" data-id="${alert.id}">
            <td>
                <div class="alert-type">
                    <div class="alert-type-icon ${alert.type}">
                        <i class="fas fa-${getAlertIcon(alert.type)}"></i>
                    </div>
                    <span>${getAlertTypeName(alert.type)}</span>
                </div>
            </td>
            <td>
                <div class="alert-time">
                    <span class="date">${formatDate(alert.timestamp)}</span>
                    <span class="time">${formatTime(alert.timestamp)}</span>
                </div>
            </td>
            <td>${alert.braceletId}</td>
            <td>
                <div class="alert-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${alert.location.name}</span>
                </div>
            </td>
            <td>
                <span class="badge badge-${getStatusBadge(alert.status)}">
                    ${getStatusName(alert.status)}
                </span>
            </td>
            <td>
                <div class="alert-actions">
                    <button class="action-btn view" onclick="viewAlert('${alert.id}')" title="عرض التفاصيل">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn locate" onclick="locateAlert('${alert.id}')" title="عرض على الخريطة">
                        <i class="fas fa-map-marked-alt"></i>
                    </button>
                    ${alert.status !== 'resolved' ? `
                        <button class="action-btn resolve" onclick="resolveAlert('${alert.id}')" title="تم الحل">
                            <i class="fas fa-check"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}
function initializeFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            renderAlerts();
        });
    });
}
function updateFilterCounts() {
    const allCount = document.querySelector('[data-filter="all"] .count');
    const newCount = document.querySelector('[data-filter="new"] .count');
    const processingCount = document.querySelector('[data-filter="processing"] .count');
    const resolvedCount = document.querySelector('[data-filter="resolved"] .count');
    if (allCount) allCount.textContent = alerts.length;
    if (newCount) newCount.textContent = alerts.filter(a => a.status === 'new').length;
    if (processingCount) processingCount.textContent = alerts.filter(a => a.status === 'processing').length;
    if (resolvedCount) resolvedCount.textContent = alerts.filter(a => a.status === 'resolved').length;
}
function initializeModal() {
    const modal = document.getElementById('alertModal');
    const closeBtn = modal?.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}
function viewAlert(id) {
    const alert = alerts.find(a => a.id === id);
    if (!alert) return;
    const modal = document.getElementById('alertModal');
    const content = modal.querySelector('.modal-body');
    content.innerHTML = `
        <div class="pilgrim-info-card">
            <div class="pilgrim-header">
                <div class="pilgrim-avatar">${alert.pilgrimName.charAt(0)}</div>
                <div class="pilgrim-name">
                    <h4>${alert.pilgrimName}</h4>
                    <span>${alert.permitNumber}</span>
                </div>
            </div>
            <div class="pilgrim-details">
                <div class="detail-item">
                    <label>رقم السوار</label>
                    <span>${alert.braceletId}</span>
                </div>
                <div class="detail-item">
                    <label>الجنسية</label>
                    <span>${alert.nationality}</span>
                </div>
                <div class="detail-item">
                    <label>العمر</label>
                    <span>${alert.age} سنة</span>
                </div>
                <div class="detail-item">
                    <label>الحالة الصحية</label>
                    <span>${alert.healthStatus}</span>
                </div>
                <div class="detail-item">
                    <label>نبض القلب</label>
                    <span style="color: ${alert.heartRate > 100 ? '#dc3545' : '#28a745'}">${alert.heartRate} نبضة/د</span>
                </div>
                <div class="detail-item">
                    <label>درجة الحرارة</label>
                    <span style="color: ${alert.temperature > 37.5 ? '#dc3545' : '#28a745'}">${alert.temperature}°س</span>
                </div>
                <div class="detail-item">
                    <label>نوع التنبيه</label>
                    <span>${getAlertTypeName(alert.type)}</span>
                </div>
                <div class="detail-item">
                    <label>الأولوية</label>
                    <span class="badge badge-${alert.priority === 'critical' ? 'danger' : alert.priority === 'high' ? 'warning' : 'info'}">
                        ${alert.priority === 'critical' ? '🔴 حرج' : alert.priority === 'high' ? '🟠 عالي' : alert.priority === 'medium' ? '🟡 متوسط' : '🟢 منخفض'}
                    </span>
                </div>
                <div class="detail-item">
                    <label>الوقت</label>
                    <span>${formatDateTime(alert.timestamp)}</span>
                </div>
            </div>
        </div>
        <div class="mini-map" id="miniMap"></div>
        <div class="form-group">
            <label>تغيير الحالة</label>
            <select class="form-control" onchange="updateAlertStatus('${alert.id}', this.value)">
                <option value="new" ${alert.status === 'new' ? 'selected' : ''}>جديد</option>
                <option value="processing" ${alert.status === 'processing' ? 'selected' : ''}>قيد المعالجة</option>
                <option value="resolved" ${alert.status === 'resolved' ? 'selected' : ''}>تم الحل</option>
            </select>
        </div>
    `;
    modal.classList.add('active');
    setTimeout(() => {
        initMiniMap(alert.location);
    }, 100);
}
function closeModal() {
    const modal = document.getElementById('alertModal');
    modal.classList.remove('active');
}
function initMiniMap(location) {
    const miniMap = L.map('miniMap', {
        center: [location.lat, location.lng],
        zoom: 16,
        zoomControl: false,
        dragging: false
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(miniMap);
    L.marker([location.lat, location.lng]).addTo(miniMap);
}
function locateAlert(id) {
    const alert = alerts.find(a => a.id === id);
    if (!alert) return;
    window.location.href = `dashboard.html?lat=${alert.location.lat}&lng=${alert.location.lng}`;
}
function resolveAlert(id) {
    updateAlertStatus(id, 'resolved');
}
function updateAlertStatus(id, status) {
    const alert = alerts.find(a => a.id === id);
    if (alert) {
        alert.status = status;
        renderAlerts();
        updateFilterCounts();
        if (typeof showToast !== 'undefined') {
            showToast('تم تحديث حالة التنبيه', 'success');
        }
    }
}
function startAlertPolling() {
    setInterval(checkNewAlerts, 10000);
}
function checkNewAlerts() {
    if (Math.random() < 0.1) {
        addNewAlert();
    }
}
function addNewAlert() {
    const newAlert = {
        id: `ALT-${String(alerts.length + 1).padStart(3, '0')}`,
        type: ['sos', 'health', 'location'][Math.floor(Math.random() * 3)],
        braceletId: `BRC-${Math.floor(Math.random() * 90000) + 10000}`,
        pilgrimName: 'حاج جديد',
        permitNumber: `PMT-2024-${Math.floor(Math.random() * 90000) + 10000}`,
        location: { 
            lat: 21.4225 + (Math.random() - 0.5) * 0.02, 
            lng: 39.8262 + (Math.random() - 0.5) * 0.02, 
            name: 'موقع جديد' 
        },
        healthStatus: 'غير معروف',
        timestamp: new Date(),
        status: 'new'
    };
    alerts.unshift(newAlert);
    renderAlerts();
    updateFilterCounts();
    playAlertSound();
    showAlertNotification(newAlert);
}
function playAlertSound() {
    if (alertSound) {
        alertSound.play().catch(() => {});
    }
}
function showAlertNotification(alert) {
    const indicator = document.querySelector('.alert-sound-indicator');
    if (indicator) {
        indicator.classList.add('active');
        setTimeout(() => indicator.classList.remove('active'), 5000);
    }
}
function getAlertIcon(type) {
    const icons = { sos: 'exclamation-triangle', health: 'heartbeat', location: 'map-marker-alt' };
    return icons[type] || 'bell';
}
function getAlertTypeName(type) {
    const names = { sos: 'طوارئ SOS', health: 'تنبيه صحي', location: 'خروج عن المسار' };
    return names[type] || 'تنبيه';
}
function getStatusBadge(status) {
    const badges = { new: 'danger', processing: 'warning', resolved: 'success' };
    return badges[status] || 'info';
}
function getStatusName(status) {
    const names = { new: 'جديد', processing: 'قيد المعالجة', resolved: 'تم الحل' };
    return names[status] || status;
}
function formatDate(date) {
    return new Date(date).toLocaleDateString('ar-SA');
}
function formatTime(date) {
    return new Date(date).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
}
function formatDateTime(date) {
    return new Date(date).toLocaleString('ar-SA');
}
