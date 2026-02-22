export const validateEventDates = (start: string | null | undefined, end: string | null | undefined): string | null => {
    if (!start) return "Start date is required.";
    if (!end) return "End date is required.";

    const startDate = new Date(start);
    const endDate = new Date(end);
    const now = new Date();

    // Check valid dates
    if (isNaN(startDate.getTime())) return "Invalid start date.";
    if (isNaN(endDate.getTime())) return "Invalid end date.";

    // 1. Both are in the future
    // Note: We use a small buffer (e.g., 1 minute) or strict 'now' depending on preference.
    if (startDate <= now) {
        return "Start date must be in the future.";
    }
    // Implicitly, if end > start and start > now, end is > now. But we can check specifically if needed.

    // 2. Start is before end
    if (endDate <= startDate) {
        return "End date/time must be after start date/time.";
    }

    // 3. Duration is at least 30 minutes
    const durationMs = endDate.getTime() - startDate.getTime();
    const thirtyMinutesMs = 30 * 60 * 1000;

    if (durationMs < thirtyMinutesMs) {
        return "Event duration must be at least 30 minutes.";
    }

    return null;
};
