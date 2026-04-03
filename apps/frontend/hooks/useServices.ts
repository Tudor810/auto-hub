import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/utils/api';
import { IService, IServiceFormData } from '@auto-hub/shared/types/serviceTypes'; // Adjust path if needed

// Define the standard return type for your mutation functions
interface MutationResponse {
  success: boolean;
  error?: string;
}

export const useServices = (locationId: string | null) => {
  const { token } = useAuth();
  const [services, setServices] = useState<IService[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- GET SERVICES ---
  const fetchServices = useCallback(async () => {
    if (!locationId || (Platform.OS !== 'web' && !token)) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/services?locationId=${locationId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        // Explicitly type the expected backend response
        const data: IService[] = await response.json();
        setServices(data);
      } else {
        setError("Eroare la aducerea serviciilor.");
      }
    } catch (err) {
      setError("Eroare de rețea.");
    } finally {
      setIsLoading(false);
    }
  }, [locationId, token]);

  // Fetch automatically when the locationId changes
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // --- POST SERVICE ---
  // Only accept IServiceFormData from your UI component
  const addService = async (serviceData: IServiceFormData): Promise<MutationResponse> => {
    if (!locationId) return { success: false, error: "Locația nu este selectată." };

    try {
      const response = await fetch(`${API_BASE_URL}/api/services?locationId=${locationId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...serviceData, locationId }),
        credentials: 'include'
      });

      if (response.ok) {
        // Explicitly type the newly created service from the backend
        const newService: IService = await response.json();
        setServices(prev => [...prev, newService]);
        return { success: true };
      }
      return { success: false, error: "Eroare la adăugare." };
    } catch (err) {
      return { success: false, error: "Eroare de rețea." };
    }
  };

  // --- PUT (UPDATE) SERVICE ---
  // Only accept IServiceFormData (or Partial<IServiceFormData> if you only send changed fields)
  const updateService = async (serviceId: string, updatedData: IServiceFormData): Promise<MutationResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/services/${serviceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData),
        credentials: 'include'
      });

      if (response.ok) {
        // Explicitly type the updated service returned from the backend
        const updatedService: IService = await response.json();
        setServices(prev => prev.map(service => 
          service._id === serviceId ? updatedService : service
        ));
        return { success: true };
      }
      
      const errorData = await response.json();
      return { success: false, error: errorData.message || "Eroare la actualizare." };
    } catch (err) {
      return { success: false, error: "Eroare de rețea." };
    }
  };

  // --- DELETE SERVICE ---
  const deleteService = async (serviceId: string): Promise<MutationResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/services/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (response.ok) {
        setServices(prev => prev.filter(service => service._id !== serviceId));
        return { success: true };
      }
      
      const errorData = await response.json();
      return { success: false, error: errorData.message || "Eroare la ștergere." };
    } catch (err) {
      return { success: false, error: "Eroare de rețea." };
    }
  };

  return {
    services,
    isLoading,
    error,
    refreshServices: fetchServices,
    addService,
    updateService,
    deleteService
  };
};