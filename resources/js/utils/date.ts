export function formatDate(date: string | Date): string {
    const d = new Date(date);
    const day = d.getDate();
    const suffix = day === 1 || day === 21 || day === 31 ? 'st'
        : day === 2 || day === 22 ? 'nd'
        : day === 3 || day === 23 ? 'rd'
        : 'th';
    const month = d.toLocaleString('en', { month: 'long' });
    return `${day}${suffix} ${month}, ${d.getFullYear()}`;
}

export function formatDateTime(date: string | Date): string {
    const d = new Date(date);
    const datePart = formatDate(d);
    const time = d.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${datePart} ${time}`;
}
