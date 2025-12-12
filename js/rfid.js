let currentPilgrim = null;
document.addEventListener('DOMContentLoaded', function() {
    initializeRFIDReader();
    initializeTranslation();
});
function initializeRFIDReader() {
    const rfidInput = document.getElementById('rfidInput');
    if (rfidInput) {
        rfidInput.focus();
        rfidInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                readRFID(this.value);
            }
        });
        rfidInput.addEventListener('input', debounce(function() {
            if (this.value.length >= 10) {
                readRFID(this.value);
            }
        }, 500));
    }
}
async function readRFID(rfidCode) {
    if (!rfidCode || rfidCode.length < 5) return;
    updateRFIDStatus('reading', 'جاري قراءة البيانات...');
    try {
        await simulateDelay(1500);
        const pilgrimData = getMockPilgrimData(rfidCode);
        if (pilgrimData) {
            currentPilgrim = pilgrimData;
            updateRFIDStatus('success', 'تم قراءة البيانات بنجاح');
            displayPilgrimData(pilgrimData);
        } else {
            updateRFIDStatus('error', 'لم يتم العثور على بيانات');
            displayNoData();
        }
    } catch (error) {
        updateRFIDStatus('error', 'حدث خطأ في القراءة');
        console.error(error);
    }
}
function updateRFIDStatus(status, message) {
    const statusDiv = document.querySelector('.rfid-status');
    if (!statusDiv) return;
    statusDiv.className = `rfid-status ${status}`;
    const icons = {
        waiting: 'hourglass-half',
        reading: 'spinner fa-spin',
        success: 'check-circle',
        error: 'times-circle'
    };
    statusDiv.innerHTML = `
        <i class="fas fa-${icons[status] || 'info-circle'}"></i>
        <span>${message}</span>
    `;
}
function displayPilgrimData(pilgrim) {
    const resultBody = document.querySelector('.result-body');
    if (!resultBody) return;
    const permitStatusClass = pilgrim.permitValid ? 'valid' : 'invalid';
    const permitStatusText = pilgrim.permitValid ? 'تصريح ساري' : 'دخول غير مصرّح به';
    const permitIcon = pilgrim.permitValid ? 'check-circle' : 'times-circle';
    let html = '';
    if (!pilgrim.permitValid) {
        html += `
            <div class="no-permit-alert">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>❌ دخول غير مصرّح به</h3>
                <p>هذا الحاج لا يملك تصريح دخول ساري المفعول</p>
            </div>
        `;
    }
    html += `
        <div class="pilgrim-profile">
            <div class="profile-avatar">${pilgrim.name.charAt(0)}</div>
            <div class="profile-info">
                <h2>${pilgrim.name}</h2>
                <div class="permit-number">
                    <i class="fas fa-id-card"></i>
                    <span>رقم التصريح: ${pilgrim.permitNumber}</span>
                </div>
                <div class="permit-status ${permitStatusClass}">
                    <i class="fas fa-${permitIcon}"></i>
                    <span>${permitStatusText}</span>
                </div>
            </div>
        </div>
        <div class="info-grid">
            <div class="info-item">
                <label>رقم السوار</label>
                <span><i class="fas fa-tag"></i> ${pilgrim.braceletId}</span>
            </div>
            <div class="info-item">
                <label>الجنسية</label>
                <span><i class="fas fa-flag"></i> ${pilgrim.nationality}</span>
            </div>
            <div class="info-item">
                <label>اللغة</label>
                <span><i class="fas fa-language"></i> ${pilgrim.language}</span>
            </div>
            <div class="info-item">
                <label>فصيلة الدم</label>
                <span><i class="fas fa-tint"></i> ${pilgrim.bloodType}</span>
            </div>
            <div class="info-item">
                <label>الحالة الصحية</label>
                <span><i class="fas fa-heartbeat"></i> ${pilgrim.healthStatus}</span>
            </div>
            <div class="info-item">
                <label>العمر</label>
                <span><i class="fas fa-user"></i> ${pilgrim.age} سنة</span>
            </div>
            <div class="info-item">
                <label>رقم المخيم</label>
                <span><i class="fas fa-campground"></i> ${pilgrim.campNumber}</span>
            </div>
            <div class="info-item">
                <label>الحملة</label>
                <span><i class="fas fa-users"></i> ${pilgrim.group}</span>
            </div>
            <div class="info-item">
                <label>الحساسية</label>
                <span><i class="fas fa-allergies"></i> ${pilgrim.allergies}</span>
            </div>
            <div class="info-item">
                <label>الأدوية</label>
                <span><i class="fas fa-pills"></i> ${pilgrim.medications}</span>
            </div>
            <div class="info-item">
                <label>اتصال الطوارئ</label>
                <span><i class="fas fa-phone"></i> ${pilgrim.emergencyContact}</span>
            </div>
            <div class="info-item">
                <label>تاريخ الوصول</label>
                <span><i class="fas fa-calendar-check"></i> ${pilgrim.arrivalDate}</span>
            </div>
            <div class="info-item">
                <label>تاريخ المغادرة</label>
                <span><i class="fas fa-calendar-times"></i> ${pilgrim.departureDate}</span>
            </div>
            <div class="info-item">
                <label>آخر موقع</label>
                <span><i class="fas fa-map-marker-alt"></i> ${pilgrim.lastLocation}</span>
            </div>
            <div class="info-item">
                <label>وقت الدخول</label>
                <span><i class="fas fa-clock"></i> ${pilgrim.checkInTime}</span>
            </div>
            <div class="info-item">
                <label>مستوى البطارية</label>
                <span><i class="fas fa-battery-${pilgrim.batteryLevel > 50 ? 'full' : pilgrim.batteryLevel > 20 ? 'half' : 'quarter'}"></i> ${pilgrim.batteryLevel}%</span>
            </div>
        </div>
        <div class="translation-section">
            <h4><i class="fas fa-language"></i> الترجمة الفورية</h4>
            <div class="translation-form">
                <div class="translation-input">
                    <textarea id="textToTranslate" placeholder="اكتب نصاً للترجمة إلى لغة الحاج..."></textarea>
                </div>
                <div class="translation-output">
                    <div class="lang-label">
                        <i class="fas fa-globe"></i>
                        <span>الترجمة (${pilgrim.language})</span>
                    </div>
                    <div class="translated-text" id="translatedText">
                        سيظهر النص المترجم هنا...
                    </div>
                </div>
            </div>
            <button class="btn btn-primary" style="margin-top: 15px;" onclick="translateText()">
                <i class="fas fa-exchange-alt"></i> ترجمة
            </button>
        </div>
    `;
    resultBody.innerHTML = html;
    initializeTranslation();
}
function displayNoData() {
    const resultBody = document.querySelector('.result-body');
    if (!resultBody) return;
    resultBody.innerHTML = `
        <div class="no-data">
            <div class="no-data-icon">
                <i class="fas fa-search"></i>
            </div>
            <h4>لم يتم العثور على بيانات</h4>
            <p>يرجى التأكد من رقم RFID والمحاولة مرة أخرى</p>
        </div>
    `;
}
function initializeTranslation() {
    const translateInput = document.getElementById('textToTranslate');
    if (translateInput) {
        translateInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && e.ctrlKey) {
                translateText();
            }
        });
    }
}
async function translateText() {
    const input = document.getElementById('textToTranslate');
    const output = document.getElementById('translatedText');
    if (!input || !output || !input.value.trim()) return;
    output.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الترجمة...';
    try {
        await simulateDelay(1000);
        const translations = {
            'أهلاً وسهلاً': 'Welcome',
            'كيف حالك؟': 'How are you?',
            'هل تحتاج مساعدة؟': 'Do you need help?',
            'اتبعني من فضلك': 'Please follow me',
            'الحمام هنا': 'The bathroom is here',
            'المستشفى قريب': 'The hospital is nearby'
        };
        const translatedText = translations[input.value.trim()] || 
            `[Translated] ${input.value}`;
        output.textContent = translatedText;
    } catch (error) {
        output.textContent = 'حدث خطأ في الترجمة';
        console.error(error);
    }
}
function getMockPilgrimData(rfidCode) {
    const lastDigit = parseInt(rfidCode.slice(-1)) || 0;
    if (lastDigit === 0) {
        return null; 
    }
    const permitValid = lastDigit !== 5; 
    
    const pilgrimDatabase = [
        {
            name: 'أحمد محمد العتيبي',
            nationality: 'السعودية 🇸🇦',
            language: 'العربية',
            langCode: 'ar',
            healthStatus: 'مستقر - ضغط الدم طبيعي',
            age: 62,
            group: 'حملة الراجحي',
            bloodType: 'O+',
            allergies: 'لا يوجد',
            medications: 'أسبرين يومي',
            emergencyContact: '+966501234567',
            arrivalDate: '2024-06-10',
            departureDate: '2024-06-20'
        },
        {
            name: 'محمد حسن الأحمدي',
            nationality: 'مصر 🇪🇬',
            language: 'العربية',
            langCode: 'ar',
            healthStatus: 'جيد - سكري من النوع الثاني',
            age: 58,
            group: 'حملة الطيار',
            bloodType: 'A+',
            allergies: 'حساسية من البنسلين',
            medications: 'ميتفورمين، إنسولين',
            emergencyContact: '+201234567890',
            arrivalDate: '2024-06-11',
            departureDate: '2024-06-19'
        },
        {
            name: 'عبدالله أحمد خان',
            nationality: 'باكستان 🇵🇰',
            language: 'الأردية',
            langCode: 'ur',
            healthStatus: 'جيد جداً',
            age: 45,
            group: 'حملة بن لادن',
            bloodType: 'B+',
            allergies: 'لا يوجد',
            medications: 'فيتامينات متعددة',
            emergencyContact: '+923001234567',
            arrivalDate: '2024-06-09',
            departureDate: '2024-06-21'
        },
        {
            name: 'أحمد سوبرنو',
            nationality: 'إندونيسيا 🇮🇩',
            language: 'الإندونيسية',
            langCode: 'id',
            healthStatus: 'طبيعي',
            age: 52,
            group: 'حملة الجفالي',
            bloodType: 'AB+',
            allergies: 'حساسية موسمية',
            medications: 'مضادات الهيستامين',
            emergencyContact: '+6281234567890',
            arrivalDate: '2024-06-12',
            departureDate: '2024-06-18'
        },
        {
            name: 'مصطفى أوزتورك',
            nationality: 'تركيا 🇹🇷',
            language: 'التركية',
            langCode: 'tr',
            healthStatus: permitValid ? 'جيد' : 'غير مصرح',
            age: 47,
            group: 'حملة العثيم',
            bloodType: 'O-',
            allergies: 'حساسية من المكسرات',
            medications: 'لا يوجد',
            emergencyContact: '+905321234567',
            arrivalDate: '2024-06-10',
            departureDate: '2024-06-20'
        },
        {
            name: 'خالد سعيد الغامدي',
            nationality: 'السعودية 🇸🇦',
            language: 'العربية',
            langCode: 'ar',
            healthStatus: 'مستقر - ضغط مرتفع',
            age: 68,
            group: 'حملة السديري',
            bloodType: 'A-',
            allergies: 'حساسية من اليود',
            medications: 'أملوديبين، لوسارتان',
            emergencyContact: '+966509876543',
            arrivalDate: '2024-06-11',
            departureDate: '2024-06-19'
        },
        {
            name: 'عمر فاروق الشريف',
            nationality: 'الأردن 🇯🇴',
            language: 'العربية',
            langCode: 'ar',
            healthStatus: 'ممتاز',
            age: 35,
            group: 'حملة المعجل',
            bloodType: 'B-',
            allergies: 'لا يوجد',
            medications: 'لا يوجد',
            emergencyContact: '+962791234567',
            arrivalDate: '2024-06-13',
            departureDate: '2024-06-17'
        },
        {
            name: 'يوسف إبراهيم المالكي',
            nationality: 'الكويت 🇰🇼',
            language: 'العربية',
            langCode: 'ar',
            healthStatus: 'جيد - ربو خفيف',
            age: 55,
            group: 'حملة الزامل',
            bloodType: 'O+',
            allergies: 'غبار، حبوب اللقاح',
            medications: 'بخاخ فنتولين',
            emergencyContact: '+96550123456',
            arrivalDate: '2024-06-10',
            departureDate: '2024-06-20'
        },
        {
            name: 'حسن علي البلوشي',
            nationality: 'عمان 🇴🇲',
            language: 'العربية',
            langCode: 'ar',
            healthStatus: 'مستقر',
            age: 50,
            group: 'حملة الراجحي',
            bloodType: 'A+',
            allergies: 'لا يوجد',
            medications: 'أوميغا 3',
            emergencyContact: '+96891234567',
            arrivalDate: '2024-06-12',
            departureDate: '2024-06-18'
        }
    ];
    
    const pilgrim = pilgrimDatabase[lastDigit % pilgrimDatabase.length];
    
    const data = {
        braceletId: `RFID-${rfidCode}`,
        name: pilgrim.name,
        permitNumber: `PMT-2024-${Math.floor(Math.random() * 90000) + 10000}`,
        nationality: pilgrim.nationality,
        language: pilgrim.language,
        langCode: pilgrim.langCode,
        healthStatus: pilgrim.healthStatus,
        age: pilgrim.age,
        campNumber: `M-${100 + lastDigit}`,
        group: pilgrim.group,
        bloodType: pilgrim.bloodType,
        allergies: pilgrim.allergies,
        medications: pilgrim.medications,
        emergencyContact: pilgrim.emergencyContact,
        arrivalDate: pilgrim.arrivalDate,
        departureDate: pilgrim.departureDate,
        permitValid: permitValid,
        lastLocation: ['الحرم المكي', 'منى', 'عرفات', 'مزدلفة', 'الجمرات'][lastDigit % 5],
        checkInTime: new Date(Date.now() - Math.random() * 3600000).toLocaleString('ar-SA'),
        batteryLevel: Math.floor(Math.random() * 100)
    };
    return data;
}
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}
function simulateDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function searchRFID() {
    const input = document.getElementById('rfidInput');
    if (input && input.value) {
        readRFID(input.value);
    }
}
