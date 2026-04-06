// --- 1. HELPERS ---
const timeToMinutes = (timeString: string | undefined | null): number => {
    // 1. Guard against empty/null input
    if (!timeString || !timeString.includes(':')) {
        return 0;
    }

    const parts = timeString.split(':');

    // 2. Safely parse with fallbacks to NaN if the part is missing
    const hours = parseInt(parts[0] || '', 10);
    const minutes = parseInt(parts[1] || '', 10);

    // 3. Now isNaN will work perfectly because hours/minutes are guaranteed numbers (even if NaN)
    if (isNaN(hours) || isNaN(minutes)) {
        return 0;
    }

    return (hours * 60) + minutes;
};

const minutesToTime = (minutes: number): string => {
    const h = Math.floor(minutes / 60).toString().padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
};

// --- 2. ENGINE ---
// --- 2. ENGINE ---
export const calculateAvailableSlots = (
    date: Date,
    schedule: any,
    existingAppointments: { time: string, durationMinutes: number }[],
    serviceDuration: number,
    minAllowedTimeInMinutes: number = 0 // <--- 1. ADD NEW PARAMETER
): string[] => {
    // A. Map the JS Date to your Romanian schedule keys
    const days = ['duminica', 'luni', 'marti', 'miercuri', 'joi', 'vineri', 'sambata'];
    const currentDay = days[date.getDay()];

    if (!currentDay)
        return [];

    const daySchedule = schedule[currentDay];

    // B. If closed, return empty immediately
    if (!daySchedule || !daySchedule.isOpen) {
        return [];
    }

    const openTime = timeToMinutes(daySchedule.open);
    const closeTime = timeToMinutes(daySchedule.close);

    // C. Convert all existing appointments into "Busy Blocks" [start, end]
    const busyBlocks = existingAppointments.map(app => {
        const start = timeToMinutes(app.time);
        return { start, end: start + app.durationMinutes };
    });

    const availableSlots: string[] = [];
    const interval = 30; // Check every 30 minutes

    // D. Loop through the day and check for overlaps
    for (let currentTime = openTime; (currentTime + serviceDuration) <= closeTime; currentTime += interval) {

        const proposedStart = currentTime;
        const proposedEnd = currentTime + serviceDuration;

        // --- 2. NEW CHECK: Has this slot already passed today? ---
        if (proposedStart < minAllowedTimeInMinutes) {
            continue; // Skip to the next loop iteration!
        }

        // Check if this proposed slot overlaps with ANY busy block
        const isOverlapping = busyBlocks.some(busy => {
            // Standard overlap formula: Start A < End B AND End A > Start B
            return (proposedStart < busy.end && proposedEnd > busy.start);
        });

        // If it doesn't overlap, it's a valid slot!
        if (!isOverlapping) {
            availableSlots.push(minutesToTime(proposedStart));
        }
    }

    return availableSlots;
};