export function formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);

    const formatter = new Intl.DateTimeFormat("en-US", {
        month: "short",   // e.g., "Feb"
        day: "numeric",   // e.g., "9"
        year: "numeric",  // e.g., "2022"
        hour: "numeric",  // e.g., "5"
        minute: "2-digit", // e.g., "54"
        hour12: true      // use 12-hour clock with a.m./p.m.
    });

    let formatted = formatter.format(date);
    formatted = formatted.replace(/([A-Za-z]+)\s/, "$1. ");
    formatted = formatted.replace(/\s([AP])M$/, (_, p) => ` ${p.toLowerCase()}.m.`);

    return formatted;
}
