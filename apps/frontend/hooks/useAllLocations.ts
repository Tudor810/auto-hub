// hooks/useAllLocations.ts
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/utils/api';
import { ILocation } from '@auto-hub/shared/types/locationTypes';
import { useAuth } from '@/context/AuthContext';

export function useAllLocations() {
    const [allLocations, setAllLocations] = useState<ILocation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { token } = useAuth();

    useEffect(() => {
        const fetchAllLocations = async () => {
            try {
                setIsLoading(true);

                const response = await fetch(`${API_BASE_URL}/api/locations/public`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch locations');
                }

                const data = await response.json();
                setAllLocations(data);
            } catch (err: any) {
                console.error("Error fetching all locations:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllLocations();
    }, []);

    return { allLocations, isLoading, error };
}