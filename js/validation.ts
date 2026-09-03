export const isValidBrazilianDate = (value: string, allowFuture = true) => {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return false;

    const [day, month, year] = value.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    const isRealDate = date.getFullYear() === year
        && date.getMonth() === month - 1
        && date.getDate() === day;

    if (!isRealDate) return false;

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return allowFuture || date <= today;
};
