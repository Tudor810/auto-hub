import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/utils/api';
import { ICar, ICarFormData } from '@auto-hub/shared/types/carTypes'; 

interface MutationResponse {
  success: boolean;
  error?: string;
}

export const useCars = () => {
  const { token } = useAuth();
  const [cars, setCars] = useState<ICar[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- GET CARS ---
  const fetchCars = useCallback(async () => {
    if (Platform.OS !== 'web' && !token) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/cars`, {
        credentials: 'include', 
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data: ICar[] = await response.json();
        setCars(data);
      } else {
        setError("Eroare la aducerea mașinilor.");
      }
    } catch (err) {
      setError("Eroare de rețea.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  // --- POST (ADD) CAR ---
  const addCar = async (carData: ICarFormData): Promise<MutationResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/cars`, {
        method: 'POST',
        credentials: 'include', 
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(carData)
      });

      if (response.ok) {
        const newCar: ICar = await response.json();
        setCars(prev => [...prev, newCar]);
        return { success: true };
      }
      
      const errorData = await response.json();
      return { success: false, error: errorData.message || "Eroare la adăugarea mașinii." };
    } catch (err) {
      return { success: false, error: "Eroare de rețea." };
    }
  };

  // --- PUT (UPDATE) CAR ---
  const updateCar = async (carId: string, updatedData: ICarFormData): Promise<MutationResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/cars/${carId}`, {
        method: 'PUT',
        credentials: 'include', 
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        const updatedCar: ICar = await response.json();
        setCars(prev => prev.map(car => 
          car._id === carId ? updatedCar : car
        ));
        return { success: true };
      }
      
      const errorData = await response.json();
      return { success: false, error: errorData.message || "Eroare la actualizare." };
    } catch (err) {
      return { success: false, error: "Eroare de rețea." };
    }
  };

  // --- DELETE CAR ---
  const deleteCar = async (carId: string): Promise<MutationResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/cars/${carId}`, {
        method: 'DELETE',
        credentials: 'include', 
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setCars(prev => prev.filter(car => car._id !== carId));
        return { success: true };
      }
      
      const errorData = await response.json();
      return { success: false, error: errorData.message || "Eroare la ștergere." };
    } catch (err) {
      return { success: false, error: "Eroare de rețea." };
    }
  };

  return {
    cars,
    isLoading,
    error,
    refreshCars: fetchCars,
    addCar,
    updateCar,
    deleteCar
  };
};