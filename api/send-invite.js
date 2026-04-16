export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name, phone, vk, plus_name, plus_phone, plus_vk } = req.body;
  const VK_TOKEN = process.env.VK_GROUP_TOKEN;
  const VK_GROUP_ID = process.env.VK_GROUP_ID;
  const VK_ADMIN_ID = process.env.VK_ADMIN_USER_ID;

  // Текст уведомления
  // Форматирование напитков
  const drinkNames = {
    'red_wine': '🍷 Красное', 'white_wine': '🥂 Белое', 
    'whiskey': '🥃 Виски', 'vodka': '🍸 Водка',
    'champagne': '🍾 Шампанское', 'cocktails': '🍹 Коктейли'
  };

  const formatDrinks = (drinks) => 
    drinks?.length > 0 ? drinks.map(d => drinkNames[d] || d).join(', ') : '—';

  const formatFood = (val) => val === 'yes' ? '✅ Есть' : '❌ Нет';

  // Основное сообщение
  let msg = `🖤 Новая RSVP
  👤 ${data.name}
  📞 ${data.phone}
  📧 ${data.email}
  🍷 Напитки: ${formatDrinks(data.drinks)}
  🍽️ Ограничения: ${formatFood(data.food_restriction)}`;

  // Если есть +1 — добавляем его данные
  if (data.plus_name) {
    msg += `
  ➕ Гость +1: ${data.plus_name}
  📞 ${data.plus_phone || '—'}
  🍷 Напитки (+1): ${formatDrinks(data.plus_drinks)}
  🍽️ Ограничения (+1): ${formatFood(data.plus_food_restriction)}`;
  }

  try {
    // Отправка через VK API
    const response = await fetch('https://api.vk.com/method/messages.send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        access_token: VK_TOKEN,
        v: '5.199',          // Актуальная версия API
        random_id: Math.floor(Math.random() * 10000000),
        peer_id: VK_ADMIN_ID, // ID получателя (ваш личный)
        message: msg,
        group_id: VK_GROUP_ID // ID сообщества-бота
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error('❌ VK Error:', data.error);
      return res.status(500).json({ error: 'VK send failed', details: data.error.error_msg });
    }

    res.status(200).json({ ok: true, message_id: data.response });
  } catch (err) {
    console.error('❌ Network Error:', err);
    res.status(500).json({ error: 'Request failed' });
  }
}