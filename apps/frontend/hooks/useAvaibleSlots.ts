import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { API_BASE_URL } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';

export function useAvailableSlots(locationId: string, date: Date, totalDuration: number) {
    const [slots, setSlots] = useState<string[]>([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const { token } = useAuth();

    useEffect(() => {
        const fetchSlots = async () => {
            if (!locationId || !date) return;

            setIsLoadingSlots(true);
            
            // Format the date to send to your backend (e.g., "YYYY-MM-DD")
            const formattedDate = format(date, 'yyyy-MM-dd');

            try {
                const response = await fetch(`${API_BASE_URL}/api/locations/${locationId}/slots?date=${formattedDate}&duration=${totalDuration}`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                    credentials: 'include'
                });

                if (!response.ok) throw new Error('Failed to fetch slots');

                const data = await response.json();
                // Expecting backend to return something like: { availableSlots: ["08:00", "08:30", "11:00"] }
                setSlots(data.availableSlots || []); 
            } catch (error) {
                console.error(error);
                setSlots([]); // Fallback to empty if there's an error
            } finally {
                setIsLoadingSlots(false);
            }
        };

        fetchSlots();
    }, [locationId, date]); // <--- CRITICAL: Re-runs the API call EVERY time the date changes!

    return { slots, isLoadingSlots };
}