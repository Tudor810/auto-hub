// Converts degrees to radians
const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
};

// The Haversine formula to calculate distance in Kilometers
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

// Formats the distance cleanly (e.g., "850m" or "2.4km")
export const formatDistance = (distanceInKm: number) => {
    if (distanceInKm < 1) {
        // If less than 1km, convert to meters and round up
        return `${Math.round(distanceInKm * 1000)}m`;
    }
    // Otherwise, show kilometers with 1 decimal point
    return `${distanceInKm.toFixed(1)}km`;
};