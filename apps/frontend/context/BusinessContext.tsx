// context/BusinessContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '@/utils/api';
import type { ICompany, ICompanyFormData } from '@auto-hub/shared/types/companyTypes';
import { Platform } from 'react-native';
// import type { ILocation } from '@auto-hub/shared/types/location'; // Dacă ai o interfață și pentru locații

interface BusinessContextType {
  company: ICompany | null;
  locations: any[]; // Schimbă cu ILocation[] când ai tipul
  isLoadingBusiness: boolean;
  refreshBusinessData: () => Promise<void>;
  saveCompanyData: (formData: ICompanyFormData) => Promise<{ success: boolean; error?: string }>; 
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: React.ReactNode }): React.ReactNode {
  const { token } = useAuth();

  const [company, setCompany] = useState<ICompany | null>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [isLoadingBusiness, setIsLoadingBusiness] = useState(true);



  const saveCompanyData = async (formData: ICompanyFormData) => {
    if (!token) return { success: false, error: "Neautentificat" };

    try {
      const method = company ? 'PUT' : 'POST';
      
      const response = await fetch(`${API_BASE_URL}/api/companies/my-company`, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        // Aducem compania proaspăt salvată/creată din backend
        const updatedCompany : ICompany = await response.json();
        
        setCompany(updatedCompany); 
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.message || "Eroare la salvare." };
      }
    } catch (error) {
      console.error("Eroare de rețea la salvarea companiei:", error);
      return { success: false, error: "Eroare de rețea." };
    }
  };

  // Funcția care aduce datele
  const refreshBusinessData = async () => {
    if (Platform.OS !== 'web' && !token) return;
    setIsLoadingBusiness(true);

    try {
      // 1. Aducem Compania
      const compRes = await fetch(`${API_BASE_URL}/api/companies/my-company`, {
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });


      if (compRes.ok) {
        const compData = await compRes.json();
        setCompany(compData);

        // 2. Dacă avem companie, îi aducem și locațiile (folosind ID-ul ei)
        // const locRes = await fetch(`${API_BASE_URL}/api/locations?companyId=${compData._id}`, {
        //   headers: { 'Authorization': `Bearer ${token}` }
        // });

        // if (locRes.ok) {
        //   const locData = await locRes.json();
        //   setLocations(locData);
        // }
      }
    } catch (error) {
      console.error("Eroare la aducerea datelor de business", error);
    } finally {
      setIsLoadingBusiness(false);
    }
  };

  // Se apelează automat când Provider-ul este montat
  useEffect(() => {
    refreshBusinessData();
  }, [token]);

  return (
    <BusinessContext.Provider value={{ company, locations, isLoadingBusiness, refreshBusinessData, saveCompanyData }} >
      {children}
    </BusinessContext.Provider>
  );
}

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) throw new Error('useBusiness must be used within a BusinessProvider');
  return context;
};