/**
 * Reminder Logic Utility
 * Calculates next due dates for vaccinations and deworming based on pet age
 */

/**
 * Add days to a date
 */
const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

/**
 * Add weeks to a date
 */
const addWeeks = (date, weeks) => {
    return addDays(date, weeks * 7);
};

/**
 * Add months to a date
 */
const addMonths = (date, months) => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
};

/**
 * Add years to a date
 */
const addYears = (date, years) => {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
};

/**
 * Calculate next vaccination due date
 * @param {Date} lastVaccinationDate - Date of last vaccination
 * @param {Number} petAgeInYears - Age of pet in years
 * @param {String} species - Pet species (dog, cat, etc.)
 * @returns {Date} Next due date
 */
const calculateNextVaccinationDate = (lastVaccinationDate, petAgeInYears, species = 'dog') => {
    const lastDate = new Date(lastVaccinationDate);

    // Puppies/Kittens (under 16 weeks / ~4 months)
    if (petAgeInYears < 0.33) {
        return addWeeks(lastDate, 3); // Every 3-4 weeks
    }

    // Young pets (4-16 months)
    if (petAgeInYears < 1.33) {
        return addMonths(lastDate, 6); // Every 6 months
    }

    // Adult pets - yearly boosters
    return addYears(lastDate, 1);
};

/**
 * Calculate next deworming due date
 * @param {Date} lastDewormingDate - Date of last deworming
 * @param {Number} petAgeInYears - Age of pet in years
 * @returns {Date} Next due date
 */
const calculateNextDewormingDate = (lastDewormingDate, petAgeInYears) => {
    const lastDate = new Date(lastDewormingDate);

    // Puppies/Kittens (under 6 months)
    if (petAgeInYears < 0.5) {
        return addMonths(lastDate, 1); // Monthly
    }

    // Young pets (6 months - 1 year)
    if (petAgeInYears < 1) {
        return addMonths(lastDate, 2); // Every 2 months
    }

    // Adult pets - every 3 months
    return addMonths(lastDate, 3);
};

/**
 * Get reminder message based on type and days until due
 * @param {String} type - Type of reminder (vaccination/deworming)
 * @param {Number} daysUntilDue - Days until due date
 * @param {String} petName - Name of the pet
 * @returns {Object} Reminder message object
 */
const getReminderMessage = (type, daysUntilDue, petName) => {
    const typeLabels = {
        vaccination: { en: 'vaccination', vi: 'tiêm phòng' },
        deworming: { en: 'deworming', vi: 'tẩy giun' },
        checkup: { en: 'checkup', vi: 'khám tổng quát' }
    };

    const label = typeLabels[type] || { en: type, vi: type };

    if (daysUntilDue < 0) {
        return {
            priority: 'urgent',
            en: `${petName}'s ${label.en} is overdue by ${Math.abs(daysUntilDue)} days!`,
            vi: `${label.vi} của ${petName} đã quá hạn ${Math.abs(daysUntilDue)} ngày!`
        };
    }

    if (daysUntilDue === 0) {
        return {
            priority: 'urgent',
            en: `${petName}'s ${label.en} is due today!`,
            vi: `Hôm nay là ngày ${label.vi} của ${petName}!`
        };
    }

    if (daysUntilDue <= 7) {
        return {
            priority: 'high',
            en: `${petName}'s ${label.en} is due in ${daysUntilDue} days`,
            vi: `Còn ${daysUntilDue} ngày nữa là đến ngày ${label.vi} của ${petName}`
        };
    }

    if (daysUntilDue <= 30) {
        return {
            priority: 'medium',
            en: `${petName}'s ${label.en} is coming up in ${daysUntilDue} days`,
            vi: `${label.vi} của ${petName} sẽ đến trong ${daysUntilDue} ngày nữa`
        };
    }

    return {
        priority: 'low',
        en: `${petName}'s next ${label.en} is scheduled in ${daysUntilDue} days`,
        vi: `Lịch ${label.vi} tiếp theo của ${petName} là trong ${daysUntilDue} ngày nữa`
    };
};

/**
 * Calculate days between two dates
 * @param {Date} date1 
 * @param {Date} date2 
 * @returns {Number} Days difference
 */
const daysBetween = (date1, date2) => {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round((date2 - date1) / oneDay);
};

module.exports = {
    addDays,
    addWeeks,
    addMonths,
    addYears,
    calculateNextVaccinationDate,
    calculateNextDewormingDate,
    getReminderMessage,
    daysBetween
};
