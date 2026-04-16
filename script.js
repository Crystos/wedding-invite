const modal = document.getElementById('inviteModal');
document.getElementById('openForm').onclick = () => modal.showModal();
document.getElementById('closeModal').onclick = () => modal.close();

// Логика чекбокса +1
const plusOneCheckbox = document.getElementById('plusOne');
const plusOneFields = document.getElementById('plusOneFields');
plusOneCheckbox.addEventListener('change', () => {
    const show = plusOneCheckbox.checked;
    plusOneFields.classList.toggle('hidden', !show);
    
    // ✅ Применяем required ТОЛЬКО к текстовым полям (ФИО, телефон, VK)
    plusOneFields.querySelectorAll('input[type="text"], input[type="tel"], input[type="vk"]').forEach(inp => inp.required = show);
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

    // Сбор данных формы
    const formData = new FormData(form);
    const data = {
    // Основной гость
    name: formData.get('name'),
    phone: formData.get('phone'),
    vk: formData.get('vk'),
    drinks: formData.getAll('drink'),
    food_restriction: formData.get('food_restriction') || 'no',
    
    // Гость +1
    plus_name: formData.get('plus_name'),
    plus_phone: formData.get('plus_phone'),
    plus_vk: formData.get('plus_vk'),
    plus_drinks: formData.getAll('plus_drink'),
    plus_food_restriction: formData.get('plus_food_restriction') || 'no'
    };

    submitBtn.textContent = 'Отправка...';
    try {
        const res = await fetch('/api/send-invite', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
        });
        if (res.ok) { alert('✅ Свяжемся с вами в течение 7 дней!'); modal.close(); form.reset(); }
        else alert('❌ Ошибка сервера. Попробуйте позже.');
    } catch (err) { alert('❌ Нет соединения с интернетом.'); }
    finally { submitBtn.disabled = false; submitBtn.textContent = 'Отправить'; }
};