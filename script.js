const modal = document.getElementById('inviteModal');
document.getElementById('openForm').onclick = () => modal.showModal();
document.getElementById('closeModal').onclick = () => modal.close();

// Логика чекбокса +1
const plusOneCheckbox = document.getElementById('plusOne');
const plusOneFields = document.getElementById('plusOneFields');
plusOneCheckbox.addEventListener('change', () => {
    const show = plusOneCheckbox.checked;
    plusOneFields.classList.toggle('hidden', !show);
    plusOneFields.querySelectorAll('input').forEach(inp => inp.required = show);
});

// Индивидуальный параллакс для каждого фото
document.querySelectorAll('.collage-item').forEach(item => {
    const speed = parseFloat(item.dataset.speed);
    const img = item.querySelector('img');
    
    window.addEventListener('mousemove', (e) => {
        if (window.innerWidth < 768) return;
        const x = (window.innerWidth / 2 - e.pageX) * speed;
        const y = (window.innerHeight / 2 - e.pageY) * speed;
        img.style.transform = `translate(${x}px, ${y}px) scale(1.05)`;
    });
});

// Отправка формы + генерация PDF
const form = document.getElementById('guestForm');
const submitBtn = document.getElementById('submitBtn');

form.onsubmit = async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Генерация приглашения...';

    const data = Object.fromEntries(new FormData(form));

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit: 'mm', format: 'a5' });
        
        // Фон и текст
        doc.setFillColor(5, 5, 5); doc.rect(0, 0, 210, 148, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(36); doc.text('∞', 105, 35, { align: 'center' });
        doc.setFontSize(16); doc.text('Приглашение на свадьбу', 105, 55, { align: 'center' });
        doc.setFontSize(20); doc.text(data.name, 105, 70, { align: 'center' });
        if (data.plus_name) doc.text(`+ ${data.plus_name}`, 105, 82, { align: 'center' });
        doc.setFontSize(12); doc.text(`14 августа 2026 • 19:00`, 105, 100, { align: 'center' });
        doc.text(`Стиль: total black`, 105, 110, { align: 'center' });
        doc.text(`Место: [Ваш Адрес]`, 105, 120, { align: 'center' });

        // Конвертация в base64
        data.pdfAttachment = doc.output('datauristring').split(',')[1];
    } catch (err) { console.error('PDF Error:', err); }

    submitBtn.textContent = 'Отправка...';
    try {
        const res = await fetch('/api/send-invite', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
        });
        if (res.ok) { alert('✅ Приглашение отправлено на вашу почту!'); modal.close(); form.reset(); }
        else alert('❌ Ошибка сервера. Попробуйте позже.');
    } catch (err) { alert('❌ Нет соединения с интернетом.'); }
    finally { submitBtn.disabled = false; submitBtn.textContent = 'Отправить'; }
};