document.addEventListener('DOMContentLoaded', () => {
    // Обновление времени (базовое UTC+2 или UTC+3 с WTS)
    function updateTime() {
        const now = new Date();

        // Получаем текущее время в UTC
        const utcHours = now.getUTCHours();
        const utcMinutes = now.getUTCMinutes();
        const utcSeconds = now.getUTCSeconds();
        const utcMonth = now.getUTCMonth(); // 0-11 (январь-декабрь)
        const utcDate = now.getUTCDate();

        // Определяем, летнее время или нет (март-октябрь)
        const isSummerTime = (month, date) => {
            const lastSundayMarch = new Date(Date.UTC(now.getUTCFullYear(), 2, 31));
            lastSundayMarch.setUTCDate(31 - (lastSundayMarch.getUTCDay() || 7));
            const lastSundayOctober = new Date(Date.UTC(now.getUTCFullYear(), 9, 31));
            lastSundayOctober.setUTCDate(31 - (lastSundayOctober.getUTCDay() || 7));

            const currentDate = new Date(Date.UTC(now.getUTCFullYear(), month, date));
            return currentDate >= lastSundayMarch && currentDate < lastSundayOctober;
        };

        const summerTime = isSummerTime(utcMonth, utcDate);
        const baseOffset = summerTime ? 3 : 2; // UTC+2 или UTC+3

        // Применяем базовое смещение (UTC+2 или UTC+3)
        let hours = utcHours + baseOffset;
        let minutes = utcMinutes;
        let seconds = utcSeconds;

        if (hours >= 24) {
            hours -= 24;
        }

        // Применяем правило WTS
        const wtsAdjustment = (utcHours, utcMinutes) => {
            const utcTimeInMinutes = utcHours * 60 + utcMinutes;
            const thresholdMorning = 5 * 60 + 55; // 05:55 в минутах
            const thresholdEvening = 20 * 60; // 20:00 в минутах

            if (utcTimeInMinutes < thresholdMorning || utcTimeInMinutes >= thresholdEvening) {
                return -55; // Отнимаем 55 минут
            } else {
                return 55; // Добавляем 55 минут
            }
        };

        const wtsMinutes = wtsAdjustment(utcHours, utcMinutes);
        minutes += wtsMinutes;

        // Корректируем часы и минуты
        while (minutes < 0) {
            minutes += 60;
            hours -= 1;
        }
        while (minutes >= 60) {
            minutes -= 60;
            hours += 1;
        }
        if (hours < 0) {
            hours += 24;
        }
        if (hours >= 24) {
            hours -= 24;
        }

        // Форматируем время в 24-часовом формате
        document.getElementById('time').textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        // Отображаем текущее состояние WTS (+55 или -55 минут)
        const wtsStatus = wtsMinutes > 0 ? "+55 minut" : "-55 minut";
        document.getElementById('wts-status').textContent = `${wtsStatus}`;

        // Вычисляем время до смены состояния
        const totalUTCMinutes = utcHours * 60 + utcMinutes;
        const thresholdMorning = 5 * 60 + 55; // 05:55 UTC
        const thresholdEvening = 20 * 60; // 20:00 UTC

        let timeUntilChange;
        if (totalUTCMinutes < thresholdMorning) {
            // Сейчас -55 минут, ждём переход на +55 в 05:55 UTC
            const minutesUntilMorning = thresholdMorning - totalUTCMinutes;
            const hoursUntil = Math.floor(minutesUntilMorning / 60);
            const minutesUntil = minutesUntilMorning % 60;
            timeUntilChange = `Na +55: ${hoursUntil} c ${String(minutesUntil).padStart(2, '0')} min`;
        } else if (totalUTCMinutes >= thresholdMorning && totalUTCMinutes < thresholdEvening) {
            // Сейчас +55 минут, ждём переход на -55 в 20:00 UTC
            const minutesUntilEvening = thresholdEvening - totalUTCMinutes;
            const hoursUntil = Math.floor(minutesUntilEvening / 60);
            const minutesUntil = minutesUntilEvening % 60;
            timeUntilChange = `Na -55: ${hoursUntil} c ${String(minutesUntil).padStart(2, '0')} min`;
        } else {
            // Сейчас -55 минут, ждём переход на +55 в 05:55 UTC следующего дня
            const minutesUntilMidnight = (24 * 60) - totalUTCMinutes;
            const minutesUntilMorning = minutesUntilMidnight + thresholdMorning;
            const hoursUntil = Math.floor(minutesUntilMorning / 60);
            const minutesUntil = minutesUntilMorning % 60;
            timeUntilChange = `Na +55: ${hoursUntil} c ${String(minutesUntil).padStart(2, '0')} min`;
        }

        document.getElementById('wts-change').textContent = timeUntilChange;
    }

    updateTime();
    setInterval(updateTime, 1000);
});
