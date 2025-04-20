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

        // Применяем базовое смещение (UTC+2 или UTC+3) для получения локального времени
        let localHours = utcHours + baseOffset;
        let localMinutes = utcMinutes;
        let localSeconds = utcSeconds;

        if (localHours >= 24) {
            localHours -= 24;
        }

        // Применяем правило WTS на основе локального времени (UTC+2 или UTC+3)
        const wtsAdjustment = (localHours, localMinutes) => {
            const localTimeInMinutes = localHours * 60 + localMinutes;
            const thresholdMorning = 5 * 60 + 55; // 05:55 в минутах
            const thresholdEvening = 20 * 60; // 20:00 в минутах

            if (localTimeInMinutes < thresholdMorning || localTimeInMinutes >= thresholdEvening) {
                return -55; // Отнимаем 55 минут
            } else {
                return 55; // Добавляем 55 минут
            }
        };

        const wtsMinutes = wtsAdjustment(localHours, localMinutes);
        localMinutes += wtsMinutes;

        // Корректируем часы и минуты после WTS
        while (localMinutes < 0) {
            localMinutes += 60;
            localHours -= 1;
        }
        while (localMinutes >= 60) {
            localMinutes -= 60;
            localHours += 1;
        }
        if (localHours < 0) {
            localHours += 24;
        }
        if (localHours >= 24) {
            localHours -= 24;
        }

        // Форматируем время в 24-часовом формате
        document.getElementById('time').textContent = `${String(localHours).padStart(2, '0')}:${String(localMinutes).padStart(2, '0')}:${String(localSeconds).padStart(2, '0')}`;

        // Отображаем текущее состояние WTS (+55 или -55 минут)
        const wtsStatus = wtsMinutes > 0 ? "+55 minut" : "-55 minut";
        document.getElementById('wts-status').textContent = `${wtsStatus}`;

        // Вычисляем время до смены состояния на основе локального времени
        const totalLocalMinutes = localHours * 60 + localMinutes;
        const thresholdMorning = 5 * 60 + 55; // 05:55 локального времени
        const thresholdEvening = 20 * 60; // 20:00 локального времени

        let timeUntilChange;
        if (totalLocalMinutes < thresholdMorning) {
            // Сейчас -55 минут, ждём переход на +55 в 05:55 локального времени
            const minutesUntilMorning = thresholdMorning - totalLocalMinutes;
            const hoursUntil = Math.floor(minutesUntilMorning / 60);
            const minutesUntil = minutesUntilMorning % 60;
            timeUntilChange = `Na +55: ${hoursUntil} c ${String(minutesUntil).padStart(2, '0')} min`;
        } else if (totalLocalMinutes >= thresholdMorning && totalLocalMinutes < thresholdEvening) {
            // Сейчас +55 минут, ждём переход на -55 в 20:00 локального времени
            const minutesUntilEvening = thresholdEvening - totalLocalMinutes;
            const hoursUntil = Math.floor(minutesUntilEvening / 60);
            const minutesUntil = minutesUntilEvening % 60;
            timeUntilChange = `Na -55: ${hoursUntil} c ${String(minutesUntil).padStart(2, '0')} min`;
        } else {
            // Сейчас -55 минут, ждём переход на +55 в 05:55 локального времени следующего дня
            const minutesUntilMidnight = (24 * 60) - totalLocalMinutes;
            const minutesUntilMorning = minutesUntilMidnight + thresholdMorning;
            const hoursUntil = Math.floor(minutesUntilMorning / 60);
            const minutesUntil = minutesUntilMorning % 60;
            timeUntilChange = `Na +55: ${hoursUntil} c ${String(minutesUntil).padStart(2, '0')} min`;
        }

        document.getElementById('wts-change').textContent = timeUntilChange;
    }

    // Синхронизируем обновление времени с началом каждой секунды
    function syncUpdate() {
        updateTime();
        const now = new Date();
        const delay = 1000 - now.getMilliseconds(); // Время до следующей секунды
        setTimeout(() => {
            updateTime();
            setInterval(updateTime, 1000); // Теперь обновляем точно каждую секунду
        }, delay);
    }

    syncUpdate();
});
