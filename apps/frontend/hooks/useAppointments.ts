import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/utils/api';
// Make sure to adjust this path to where your actual interfaces live
import { IAppointmentFormData, IAppointmentResponse } from '@auto-hub/shared/types/appointmentTypes';

interface MutationResponse {
  success: boolean;
  error?: string;
}

export const useAppointments = (locationId: string | null) => {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<IAppointmentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- GET APPOINTMENTS ---
  const fetchAppointments = useCallback(async () => {
    // If you need to fetch by user instead of location later, you can swap this logic
    if (Platform.OS !== 'web' && !token) return;

    setIsLoading(true);
    try {

      const url = locationId
        ? `${API_BASE_URL}/api/appointments?locationId=${locationId}`
        : `${API_BASE_URL}/api/appointments`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });

      if (response.ok) {
        const data: IAppointmentResponse[] = await response.json();
        setAppointments(data);
      } else {
        setError("Eroare la aducerea programărilor.");
      }
    } catch (err) {
      setError("Eroare de rețea.");
    } finally {
      setIsLoading(false);
    }
  }, [locationId, token]);

  // Fetch automatically when the locationId changes
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // --- POST APPOINTMENT ---
  const addAppointment = async (appointmentData: IAppointmentFormData): Promise<MutationResponse> => {
    // 3. PAYLOAD CHECK: Read locationId straight from the form data
    if (!appointmentData.locationId) return { success: false, error: "Locația nu este selectată." };

    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        // Send the exact FormData interface
        body: JSON.stringify(appointmentData),
        credentials: 'include'
      });

      if (response.ok) {
        // 4. NEW ITEM TYPE: The backend returns the fully populated object
        const newAppointment: IAppointmentResponse = await response.json();
        setAppointments(prev => [...prev, newAppointment]);
        return { success: true };
      }

      const errorData = await response.json().catch(() => ({}));
      return { success: false, error: errorData.message || "Eroare la adăugare." };
    } catch (err) {
      return { success: false, error: "Eroare de rețea." };
    }
  };

  // --- PUT (UPDATE) APPOINTMENT ---
  // Using Partial<> here since appointments often receive partial updates (e.g., updating just the status)
  const updateAppointment = async (appointmentId: string, updatedData: Partial<IAppointmentFormData>): Promise<MutationResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData),
        credentials: 'include'
      });

      if (response.ok) {
        const updatedAppointment: IAppointmentResponse = await response.json();
        setAppointments(prev => prev.map(appointment =>
          appointment._id === appointmentId ? updatedAppointment : appointment
        ));
        return { success: true };
      }

      const errorData = await response.json().catch(() => ({}));
      return { success: false, error: errorData.message || "Eroare la actualizare." };
    } catch (err) {
      return { success: false, error: "Eroare de rețea." };
    }
  };

  // --- DELETE APPOINTMENT ---
  const deleteAppointment = async (appointmentId: string): Promise<MutationResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: "include"
      });

      if (response.ok) {
        setAppointments(prev => prev.filter(appointment => appointment._id !== appointmentId));
        return { success: true };
      }

      const errorData = await response.json().catch(() => ({}));
      return { success: false, error: errorData.message || "Eroare la ștergere." };
    } catch (err) {
      return { success: false, error: "Eroare de rețea." };
    }
  };

  return {
    appointments,
    isLoading,
    error,
    refreshAppointments: fetchAppointments,
    addAppointment,
    updateAppointment,
    deleteAppointment
  };
};