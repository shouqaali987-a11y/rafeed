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
    const data = {
        braceletId: `BRC-${rfidCode}`,
        name: ['أحمد محمد السعيد', 'عبدالله خالد العمري', 'محمد فهد القحطاني', 
               'سعد ناصر الدوسري', 'خالد علي الشمري'][lastDigit % 5],
        permitNumber: `PMT-2024-${Math.floor(Math.random() * 90000) + 10000}`,
        nationality: ['السعودية', 'مصر', 'باكستان', 'إندونيسيا', 'تركيا'][lastDigit % 5],
        language: ['العربية', 'العربية', 'الأردية', 'الإندونيسية', 'التركية'][lastDigit % 5],
        healthStatus: ['مستقر', 'جيد', 'سكري', 'ضغط مرتفع', 'طبيعي'][lastDigit % 5],
        age: 45 + (lastDigit * 3),
        campNumber: `M-${100 + lastDigit}`,
        permitValid: permitValid,
        langCode: ['ar', 'ar', 'ur', 'id', 'tr'][lastDigit % 5]
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