let map;
let heatmapLayer;
let pilgrimsMarkers = [];
let isHeatmapVisible = true;
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    initializeMapControls();
    loadPilgrimsData();
    startRealTimeUpdates();
});
function initializeMap() {
    map = L.map('map', {
        center: [21.4225, 39.8262],
        zoom: 14,
        zoomControl: false
    });
    L.tileLayer('https:
        attribution: '&copy; OpenStreetMap contributors'
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
    pilgrimsMarkers.forEach(marker => map.removeLayer(marker));
    pilgrimsMarkers = [];
    const pilgrims = generateMockPilgrims(50);
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
    return `
        <div class="pilgrim-popup">
            <div class="popup-header">
                <strong>${pilgrim.name}</strong>
                <span class="badge ${pilgrim.emergency ? 'badge-danger' : 'badge-success'}">
                    ${pilgrim.emergency ? 'طوارئ' : 'نشط'}
                </span>
            </div>
            <div class="popup-body">
                <p><i class="fas fa-id-card"></i> ${pilgrim.braceletId}</p>
                <p><i class="fas fa-heartbeat"></i> ${pilgrim.healthStatus}</p>
                <p><i class="fas fa-clock"></i> آخر تحديث: ${pilgrim.lastUpdate}</p>
            </div>
            <div class="popup-footer">
                <button onclick="locatePilgrim('${pilgrim.id}')" class="btn btn-sm btn-primary">
                    <i class="fas fa-crosshairs"></i> تتبع
                </button>
            </div>
        </div>
    `;
}
function loadHeatmapData() {
    const heatData = [
        [21.4225, 39.8262, 0.8],
        [21.4230, 39.8270, 0.9],
        [21.4220, 39.8255, 0.7],
        [21.4235, 39.8265, 0.6],
        [21.4215, 39.8260, 0.5],
        [21.4228, 39.8275, 0.85],
        [21.4218, 39.8268, 0.4],
        [21.4240, 39.8258, 0.3]
    ];
    if (heatmapLayer) {
        map.removeLayer(heatmapLayer);
    }
    if (typeof L.heatLayer !== 'undefined') {
        heatmapLayer = L.heatLayer(heatData, {
            radius: 40,
            blur: 20,
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
    if (totalPilgrims) totalPilgrims.textContent = formatNumber(pilgrims.length);
    if (activePilgrims) activePilgrims.textContent = formatNumber(pilgrims.filter(p => !p.emergency).length);
    if (alertsCount) alertsCount.textContent = pilgrims.filter(p => p.emergency).length;
    if (crowdedAreas) crowdedAreas.textContent = '3';
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
    console.log('تتبع الحاج:', id);
}
function generateMockPilgrims(count) {
    const names = ['أحمد محمد', 'عبدالله علي', 'خالد سعيد', 'فهد ناصر', 'سلطان عمر'];
    const statuses = ['مستقر', 'جيد', 'طبيعي'];
    const pilgrims = [];
    for (let i = 0; i < count; i++) {
        pilgrims.push({
            id: `PLG-${1000 + i}`,
            name: names[Math.floor(Math.random() * names.length)],
            braceletId: `BRC-${Math.floor(Math.random() * 90000) + 10000}`,
            lat: 21.4225 + (Math.random() - 0.5) * 0.02,
            lng: 39.8262 + (Math.random() - 0.5) * 0.02,
            healthStatus: statuses[Math.floor(Math.random() * statuses.length)],
            emergency: Math.random() < 0.05,
            lastUpdate: 'منذ دقيقتين'
        });
    }
    return pilgrims;
}
function formatNumber(num) {
    return new Intl.NumberFormat('ar-SA').format(num);
}