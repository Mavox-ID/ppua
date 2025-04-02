document.addEventListener('DOMContentLoaded', () => {
    // Переключение флага и герба
    const flagContainer = document.querySelector('.flag-container');
    flagContainer.addEventListener('click', () => {
        flagContainer.classList.toggle('active');
    });

    // Обновление времени (Новая Зеландия, UTC+12)
    function updateTime() {
        const nzTime = new Date().toLocaleString('en-US', { timeZone: 'Pacific/Auckland' });
        const [date, time] = nzTime.split(', ');
        const [hours, minutes, seconds] = time.split(':');
        const period = hours >= 12 ? 'PM' : 'AM';
        const hour12 = hours % 12 || 12;
        document.getElementById('time').textContent = `${hour12}:${minutes}:${seconds} ${period}`;
    }
    updateTime();
    setInterval(updateTime, 1000);

    // Календарь
    const today = new Date().toLocaleDateString('ru-RU', { timeZone: 'Europe/Kiev' });
    document.getElementById('calendar').textContent = today;
});
