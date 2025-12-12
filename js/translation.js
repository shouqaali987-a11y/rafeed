let supportedLanguages = [];
let localizationFiles = [];
document.addEventListener('DOMContentLoaded', function() {
    loadLanguages();
    initializeTranslator();
    initializeLocalization();
    initializeUploadZone();
});
function loadLanguages() {
    supportedLanguages = [
        { code: 'ar', name: 'العربية', flag: '🇸🇦' },
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'ur', name: 'اردو', flag: '🇵🇰' },
        { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
        { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
        { code: 'ms', name: 'Bahasa Melayu', flag: '🇲🇾' },
        { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
        { code: 'fa', name: 'فارسی', flag: '🇮🇷' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'ru', name: 'Русский', flag: '🇷🇺' },
        { code: 'zh', name: '中文', flag: '🇨🇳' },
        { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
        { code: 'sw', name: 'Kiswahili', flag: '🇰🇪' },
        { code: 'so', name: 'Soomaali', flag: '🇸🇴' }
    ];
    renderLanguagesList();
    populateLanguageSelects();
}
function renderLanguagesList() {
    const list = document.getElementById('languagesList');
    if (!list) return;
    list.innerHTML = supportedLanguages.map(lang => `
        <div class="language-item" data-code="${lang.code}" onclick="selectLanguage('${lang.code}')">
            <div class="lang-info">
                <span class="lang-flag">${lang.flag}</span>
                <span class="lang-name">${lang.name}</span>
            </div>
            <span class="lang-code">${lang.code}</span>
        </div>
    `).join('');
}
function populateLanguageSelects() {
    const sourceSelect = document.getElementById('sourceLang');
    const targetSelect = document.getElementById('targetLang');
    if (sourceSelect && targetSelect) {
        const options = supportedLanguages.map(lang => 
            `<option value="${lang.code}">${lang.flag} ${lang.name}</option>`
        ).join('');
        sourceSelect.innerHTML = options;
        targetSelect.innerHTML = options;
        sourceSelect.value = 'ar';
        targetSelect.value = 'en';
    }
}
function selectLanguage(code) {
    const items = document.querySelectorAll('.language-item');
    items.forEach(item => item.classList.remove('active'));
    const selected = document.querySelector(`[data-code="${code}"]`);
    if (selected) {
        selected.classList.add('active');
        document.getElementById('targetLang').value = code;
    }
}
function searchLanguages() {
    const query = document.getElementById('langSearch').value.toLowerCase();
    const items = document.querySelectorAll('.language-item');
    items.forEach(item => {
        const name = item.querySelector('.lang-name').textContent.toLowerCase();
        const code = item.dataset.code.toLowerCase();
        if (name.includes(query) || code.includes(query)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}
function initializeTranslator() {
    const sourceText = document.getElementById('sourceText');
    if (sourceText) {
        sourceText.addEventListener('input', function() {
            updateCharCount(this.value.length);
        });
    }
}
function updateCharCount(count) {
    const charCount = document.querySelector('.char-count');
    if (charCount) {
        charCount.textContent = `${count} / 5000 حرف`;
    }
}
function swapLanguages() {
    const sourceSelect = document.getElementById('sourceLang');
    const targetSelect = document.getElementById('targetLang');
    const sourceText = document.getElementById('sourceText');
    const targetText = document.getElementById('targetText');
    if (sourceSelect && targetSelect) {
        const tempLang = sourceSelect.value;
        sourceSelect.value = targetSelect.value;
        targetSelect.value = tempLang;
    }
    if (sourceText && targetText) {
        const tempText = sourceText.value;
        sourceText.value = targetText.value;
        targetText.value = tempText;
    }
}
async function translateNow() {
    const sourceText = document.getElementById('sourceText');
    const targetText = document.getElementById('targetText');
    const sourceLang = document.getElementById('sourceLang');
    const targetLang = document.getElementById('targetLang');
    const translateBtn = document.querySelector('.translate-actions .btn-primary');
    if (!sourceText.value.trim()) {
        showToast('يرجى إدخال نص للترجمة', 'warning');
        return;
    }
    translateBtn.disabled = true;
    translateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الترجمة...';
    targetText.value = '';
    try {
        await simulateDelay(1500);
        const result = await mockTranslate(
            sourceText.value, 
            sourceLang.value, 
            targetLang.value
        );
        targetText.value = result;
        showToast('تمت الترجمة بنجاح', 'success');
    } catch (error) {
        showToast('حدث خطأ في الترجمة', 'error');
        console.error(error);
    } finally {
        translateBtn.disabled = false;
        translateBtn.innerHTML = '<i class="fas fa-language"></i> ترجمة';
    }
}
async function mockTranslate(text, from, to) {
    const translations = {
        'ar-en': {
            'مرحباً': 'Hello',
            'أهلاً وسهلاً': 'Welcome',
            'شكراً': 'Thank you',
            'من فضلك': 'Please',
            'اتبعني': 'Follow me',
            'هل تحتاج مساعدة؟': 'Do you need help?'
        },
        'en-ar': {
            'Hello': 'مرحباً',
            'Welcome': 'أهلاً وسهلاً',
            'Thank you': 'شكراً',
            'Please': 'من فضلك',
            'Follow me': 'اتبعني',
            'Do you need help?': 'هل تحتاج مساعدة؟'
        }
    };
    const key = `${from}-${to}`;
    const dict = translations[key] || {};
    return dict[text.trim()] || `[${to.toUpperCase()}] ${text}`;
}
function clearTranslation() {
    document.getElementById('sourceText').value = '';
    document.getElementById('targetText').value = '';
    updateCharCount(0);
}
function initializeLocalization() {
    localizationFiles = [
        { name: 'ar.json', lang: 'العربية', size: '15 KB', lastModified: '2024-01-15' },
        { name: 'en.json', lang: 'English', size: '14 KB', lastModified: '2024-01-15' },
        { name: 'ur.json', lang: 'اردو', size: '16 KB', lastModified: '2024-01-10' },
        { name: 'id.json', lang: 'Indonesia', size: '13 KB', lastModified: '2024-01-08' }
    ];
    renderLocalizationFiles();
}
function renderLocalizationFiles() {
    const container = document.getElementById('localizationFiles');
    if (!container) return;
    container.innerHTML = localizationFiles.map(file => `
        <div class="file-item">
            <div class="file-info">
                <div class="file-icon">
                    <i class="fas fa-file-code"></i>
                </div>
                <div class="file-details">
                    <h5>${file.name}</h5>
                    <span>${file.lang} • ${file.size} • ${file.lastModified}</span>
                </div>
            </div>
            <div class="file-actions">
                <button class="file-action-btn edit" onclick="editLocFile('${file.name}')" title="تعديل">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="file-action-btn download" onclick="downloadLocFile('${file.name}')" title="تحميل">
                    <i class="fas fa-download"></i>
                </button>
                <button class="file-action-btn delete" onclick="deleteLocFile('${file.name}')" title="حذف">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}
function editLocFile(filename) {
    const editor = document.getElementById('translationEditor');
    if (editor) {
        editor.style.display = 'block';
        loadTranslationKeys(filename);
    }
}
function loadTranslationKeys(filename) {
    const tbody = document.getElementById('translationKeys');
    if (!tbody) return;
    const keys = [
        { key: 'app.title', value: 'نظام رفيد' },
        { key: 'nav.dashboard', value: 'لوحة التحكم' },
        { key: 'nav.tracking', value: 'تتبع الحجاج' },
        { key: 'nav.alerts', value: 'التنبيهات' },
        { key: 'nav.rfid', value: 'قراءة RFID' },
        { key: 'nav.translation', value: 'الترجمة' },
        { key: 'btn.save', value: 'حفظ' },
        { key: 'btn.cancel', value: 'إلغاء' },
        { key: 'btn.search', value: 'بحث' }
    ];
    tbody.innerHTML = keys.map(item => `
        <tr>
            <td class="key-cell">${item.key}</td>
            <td><input type="text" value="${item.value}" class="form-control"></td>
        </tr>
    `).join('');
}
function downloadLocFile(filename) {
    showToast(`جاري تحميل ${filename}`, 'info');
}
function deleteLocFile(filename) {
    if (confirm(`هل أنت متأكد من حذف ملف ${filename}؟`)) {
        localizationFiles = localizationFiles.filter(f => f.name !== filename);
        renderLocalizationFiles();
        showToast('تم حذف الملف', 'success');
    }
}
function saveTranslations() {
    showToast('تم حفظ الترجمات بنجاح', 'success');
    document.getElementById('translationEditor').style.display = 'none';
}
function initializeUploadZone() {
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    if (!uploadZone || !fileInput) return;
    uploadZone.addEventListener('click', () => fileInput.click());
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });
    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });
    fileInput.addEventListener('change', () => {
        handleFiles(fileInput.files);
    });
}
function handleFiles(files) {
    Array.from(files).forEach(file => {
        if (file.name.endsWith('.json')) {
            uploadLocalizationFile(file);
        } else {
            showToast('يرجى رفع ملفات JSON فقط', 'warning');
        }
    });
}
async function uploadLocalizationFile(file) {
    showToast(`جاري رفع ${file.name}...`, 'info');
    await simulateDelay(1500);
    localizationFiles.push({
        name: file.name,
        lang: 'جديد',
        size: formatFileSize(file.size),
        lastModified: new Date().toISOString().split('T')[0]
    });
    renderLocalizationFiles();
    showToast('تم رفع الملف بنجاح', 'success');
}
function simulateDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
function showToast(message, type = 'info') {
    if (window.RafeedUtils && window.RafeedUtils.showToast) {
        window.RafeedUtils.showToast(message, type);
    } else {
        console.log(`[${type}] ${message}`);
    }
}