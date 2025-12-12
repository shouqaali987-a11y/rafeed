let map;
let heatmapLayer;
let pilgrimsMarkers = [];
let isHeatmapVisible = true;

function waitForLeaflet(callback) {
    if (typeof L !== 'undefined') {
        callback();
    } else {
        setTimeout(function() {
            waitForLeaflet(callback);
        }, 100);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    waitForLeaflet(function() {
        initializeMap();
        initializeMapControls();
        loadPilgrimsData();
        startRealTimeUpdates();
    });
});

function initializeMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) {
        console.error('Map element not found');
        return;
    }
    
    try {
        map = L.map('map', {
            center: [21.4225, 39.8262],
            zoom: 14,
            zoomControl: false
        });
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);
        
        L.control.zoom({
            position: 'topleft'
        }).addTo(map);
        
        window.pilgrimIcon = L.divIcon({
            className: 'pilgrim-marker',
            html: '<div class="marker-dot"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });
        
        window.emergencyIcon = L.divIcon({
            className: 'emergency-marker',
            html: '<div class="marker-dot emergency"></div>',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });
        
        setTimeout(function() {
            map.invalidateSize();
        }, 100);
        
    } catch (error) {
        console.error('Error initializing map:', error);
    }
}

function initializeMapControls() {
    const heatmapToggle = document.getElementById('heatmapToggle');
    const satelliteToggle = document.getElementById('satelliteToggle');
    const refreshBtn = document.getElementById('refreshMap');
    if (heatmapToggle) {
        heatmapToggle.addEventListener('click', toggleHeatmap);
    }
    if (satelliteToggle) {
        satelliteToggle.addEventListener('click', toggleSatelliteView);
    }
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshMapData);
    }
}

function toggleHeatmap() {
    const btn = document.getElementById('heatmapToggle');
    if (isHeatmapVisible) {
        if (heatmapLayer) map.removeLayer(heatmapLayer);
        btn.classList.remove('active');
    } else {
        loadHeatmapData();
        btn.classList.add('active');
    }
    isHeatmapVisible = !isHeatmapVisible;
}

function toggleSatelliteView() {
    const btn = document.getElementById('satelliteToggle');
    btn.classList.toggle('active');
}

function refreshMapData() {
    const btn = document.getElementById('refreshMap');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    loadPilgrimsData();
    loadHeatmapData();
    setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-sync-alt"></i>';
    }, 1000);
}

function loadPilgrimsData() {
    if (!map) return;
    
    pilgrimsMarkers.forEach(marker => map.removeLayer(marker));
    pilgrimsMarkers = [];
    const pilgrims = generateMockPilgrims(120);
    pilgrims.forEach(pilgrim => {
        const icon = pilgrim.emergency ? window.emergencyIcon : window.pilgrimIcon;
        const marker = L.marker([pilgrim.lat, pilgrim.lng], { icon })
            .addTo(map)
            .bindPopup(createPilgrimPopup(pilgrim));
        pilgrimsMarkers.push(marker);
    });
    updateStats(pilgrims);
}

function createPilgrimPopup(pilgrim) {
    const batteryIcon = pilgrim.battery > 50 ? 'fa-battery-full' : pilgrim.battery > 20 ? 'fa-battery-half' : 'fa-battery-quarter';
    const batteryColor = pilgrim.battery > 50 ? '#28a745' : pilgrim.battery > 20 ? '#ffc107' : '#dc3545';
    
    return `
        <div class="pilgrim-popup">
            <div class="popup-header">
                <strong>${pilgrim.name}</strong>
                <span class="badge ${pilgrim.emergency ? 'badge-danger' : 'badge-success'}">
                    ${pilgrim.emergency ? '⚠️ طوارئ' : '✓ نشط'}
                </span>
            </div>
            <div class="popup-body">
                <p><i class="fas fa-id-card"></i> <strong>المعرف:</strong> ${pilgrim.braceletId}</p>
                <p><i class="fas fa-flag"></i> <strong>الجنسية:</strong> ${pilgrim.nationality}</p>
                <p><i class="fas fa-calendar"></i> <strong>العمر:</strong> ${pilgrim.age} سنة</p>
                <p><i class="fas fa-users"></i> <strong>الحملة:</strong> ${pilgrim.group}</p>
                <p><i class="fas fa-map-marker-alt"></i> <strong>الموقع:</strong> ${pilgrim.location}</p>
                <p><i class="fas fa-heartbeat"></i> <strong>نبض القلب:</strong> <span style="color: ${pilgrim.heartRate > 100 ? '#dc3545' : '#28a745'}">${pilgrim.heartRate} نبضة/د</span></p>
                <p><i class="fas fa-thermometer-half"></i> <strong>الحرارة:</strong> <span style="color: ${pilgrim.temperature > 37.5 ? '#dc3545' : '#28a745'}">${pilgrim.temperature}°س</span></p>
                <p><i class="${batteryIcon}"></i> <strong>البطارية:</strong> <span style="color: ${batteryColor}">${pilgrim.battery}%</span></p>
                <p><i class="fas fa-route"></i> <strong>المسافة:</strong> ${pilgrim.distance} كم</p>
                <p><i class="fas fa-clock"></i> <strong>آخر تحديث:</strong> ${pilgrim.lastUpdate}</p>
            </div>
            <div class="popup-footer">
                <button onclick="locatePilgrim('${pilgrim.id}')" class="btn btn-sm btn-primary">
                    <i class="fas fa-crosshairs"></i> تتبع مباشر
                </button>
                <button onclick="callPilgrim('${pilgrim.id}')" class="btn btn-sm" style="background: #17a2b8; margin-right: 5px;">
                    <i class="fas fa-phone"></i> اتصال
                </button>
            </div>
        </div>
    `;
}

function loadHeatmapData() {
    if (!map) return;
    
    const heatData = [
        [21.4225, 39.8262, 1.0],
        [21.4230, 39.8270, 0.95],
        [21.4220, 39.8255, 0.85],
        [21.4235, 39.8265, 0.75],
        [21.4215, 39.8260, 0.65],
        [21.4228, 39.8275, 0.9],
        [21.4218, 39.8268, 0.6],
        [21.4240, 39.8258, 0.5],
        [21.4183, 39.8886, 0.95],
        [21.4190, 39.8880, 0.85],
        [21.4175, 39.8890, 0.75],
        [21.3566, 39.9844, 0.8],
        [21.3570, 39.9850, 0.9],
        [21.3560, 39.9840, 0.7],
        [21.3927, 39.9266, 0.65],
        [21.3930, 39.9270, 0.7],
        [21.4201, 39.8883, 0.85],
        [21.4205, 39.8880, 0.8],
        [21.4210, 39.8885, 0.75],
        [21.4100, 39.8500, 0.6],
        [21.4105, 39.8505, 0.55],
        [21.4095, 39.8495, 0.5]
    ];
    if (heatmapLayer) {
        map.removeLayer(heatmapLayer);
    }
    if (typeof L.heatLayer !== 'undefined') {
        heatmapLayer = L.heatLayer(heatData, {
            radius: 35,
            blur: 25,
            maxZoom: 17,
            gradient: {
                0.2: 'blue',
                0.4: 'cyan',
                0.6: 'lime',
                0.8: 'yellow',
                1.0: 'red'
            }
        }).addTo(map);
    }
}

function updateStats(pilgrims) {
    const totalPilgrims = document.getElementById('totalPilgrims');
    const activePilgrims = document.getElementById('activePilgrims');
    const alertsCount = document.getElementById('alertsCount');
    const crowdedAreas = document.getElementById('crowdedAreas');
    
    const emergencyCount = pilgrims.filter(p => p.emergency).length;
    const crowdedCount = Math.floor(Math.random() * 3) + 2;
    
    if (totalPilgrims) {
        animateNumber(totalPilgrims, pilgrims.length);
    }
    if (activePilgrims) {
        animateNumber(activePilgrims, pilgrims.filter(p => !p.emergency).length);
    }
    if (alertsCount) {
        alertsCount.textContent = emergencyCount;
        if (emergencyCount > 0) {
            alertsCount.parentElement.parentElement.style.animation = 'pulse 2s infinite';
        }
    }
    if (crowdedAreas) {
        crowdedAreas.textContent = crowdedCount;
    }
}

function animateNumber(element, target) {
    const start = parseInt(element.textContent.replace(/,/g, '')) || 0;
    const duration = 1000;
    const startTime = Date.now();
    
    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(start + (target - start) * progress);
        element.textContent = formatNumber(current);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    update();
}

function startRealTimeUpdates() {
    setInterval(() => {
        updatePilgrimPositions();
    }, 15000);
}

function updatePilgrimPositions() {
    pilgrimsMarkers.forEach(marker => {
        const currentPos = marker.getLatLng();
        const newLat = currentPos.lat + (Math.random() - 0.5) * 0.0005;
        const newLng = currentPos.lng + (Math.random() - 0.5) * 0.0005;
        marker.setLatLng([newLat, newLng]);
    });
}

function locatePilgrim(id) {
    showToast('🎯 جاري تتبع الحاج ' + id, 'info');
    console.log('تتبع الحاج:', id);
}

function callPilgrim(id) {
    showToast('📞 جاري الاتصال بالحاج ' + id, 'info');
    console.log('الاتصال بالحاج:', id);
}

function showToast(message, type = 'success') {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function generateMockPilgrims(count) {
    const names = [
        'أحمد محمد العتيبي', 'عبدالله علي القحطاني', 'خالد سعيد الغامدي', 
        'فهد ناصر الدوسري', 'سلطان عمر الشمري', 'محمد عبدالرحمن الزهراني',
        'يوسف إبراهيم المالكي', 'سعد فيصل العمري', 'عبدالعزيز حمد الحربي',
        'طارق عادل السبيعي', 'فيصل راشد المطيري', 'ماجد سليمان البقمي',
        'نايف صالح القرني', 'بدر خالد الجهني', 'تركي فهد العنزي',
        'إبراهيم عمر الشهري', 'حسن علي الأحمدي', 'رائد محمود اليامي',
        'عادل ناصر الفيفي', 'وليد حسين البلوي', 'مشعل فارس الرشيدي',
        'سامي كريم البيشي', 'ثامر سعيد الزبيدي', 'جاسم عبدالله الخالدي',
        'منصور طلال السديري', 'عصام وليد الشريف', 'هاني جمال الخثعمي',
        'كمال أحمد الزامل', 'نبيل فواز العصيمي', 'مازن عيسى الجبرين'
    ];
    
    const statuses = [
        'مستقر', 'جيد جداً', 'طبيعي', 'ممتاز', 'نشط',
        'متعب قليلاً', 'يحتاج راحة', 'حالة جيدة'
    ];
    
    const locations = [
        { name: 'الحرم المكي', lat: 21.4225, lng: 39.8262 },
        { name: 'منى', lat: 21.4183, lng: 39.8886 },
        { name: 'عرفات', lat: 21.3566, lng: 39.9844 },
        { name: 'مزدلفة', lat: 21.3927, lng: 39.9266 },
        { name: 'الجمرات', lat: 21.4201, lng: 39.8883 },
        { name: 'طريق المشاة', lat: 21.4100, lng: 39.8500 }
    ];
    
    const nationalites = [
        'السعودية 🇸🇦', 'مصر 🇪🇬', 'الأردن 🇯🇴', 'فلسطين 🇵🇸',
        'الإمارات 🇦🇪', 'الكويت 🇰🇼', 'البحرين 🇧🇭', 'عمان 🇴🇲',
        'اليمن 🇾🇪', 'لبنان 🇱🇧', 'سوريا 🇸🇾', 'العراق 🇮🇶',
        'تركيا 🇹🇷', 'باكستان 🇵🇰', 'إندونيسيا 🇮🇩', 'ماليزيا 🇲🇾'
    ];
    
    const ages = [25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75];
    
    const groups = [
        'حملة الراجحي', 'حملة الطيار', 'حملة بن لادن', 'حملة الجفالي',
        'حملة العثيم', 'حملة السديري', 'حملة المعجل', 'حملة الزامل'
    ];
    
    const pilgrims = [];
    for (let i = 0; i < count; i++) {
        const location = locations[Math.floor(Math.random() * locations.length)];
        const isEmergency = Math.random() < 0.04;
        
        pilgrims.push({
            id: `PLG-${1000 + i}`,
            name: names[Math.floor(Math.random() * names.length)],
            braceletId: `RFID-${Math.floor(Math.random() * 900000) + 100000}`,
            nationality: nationalites[Math.floor(Math.random() * nationalites.length)],
            age: ages[Math.floor(Math.random() * ages.length)],
            group: groups[Math.floor(Math.random() * groups.length)],
            location: location.name,
            lat: location.lat + (Math.random() - 0.5) * 0.015,
            lng: location.lng + (Math.random() - 0.5) * 0.015,
            healthStatus: isEmergency ? 'يحتاج مساعدة' : statuses[Math.floor(Math.random() * statuses.length)],
            heartRate: isEmergency ? Math.floor(Math.random() * 30) + 120 : Math.floor(Math.random() * 20) + 70,
            temperature: isEmergency ? (Math.random() * 2 + 38).toFixed(1) : (Math.random() * 1 + 36.5).toFixed(1),
            battery: Math.floor(Math.random() * 100),
            emergency: isEmergency,
            lastUpdate: getRandomUpdateTime(),
            distance: (Math.random() * 10).toFixed(1)
        });
    }
    return pilgrims;
}

function getRandomUpdateTime() {
    const times = [
        'منذ لحظات', 'منذ دقيقة', 'منذ دقيقتين', 'منذ 3 دقائق',
        'منذ 5 دقائق', 'منذ 10 دقائق', 'منذ 15 دقيقة', 'منذ 20 دقيقة'
    ];
    return times[Math.floor(Math.random() * times.length)];
}

function formatNumber(num) {
    return new Intl.NumberFormat('ar-SA').format(num);
}