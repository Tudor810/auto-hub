// 1. The payload you send when CREATING an appointment
export interface IAppointmentFormData {
    locationId: string;
    carId: string;         
    serviceIds: string[];   
    date: string;    
    time: string;           
    notes?: string;         
}

// 2. The sub-interfaces for the populated objects
export interface IPopulatedCar {
    _id: string;
    make: string;
    model: string;
    plateNr: string;
}

export interface IPopulatedClient {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
}

export interface IPopulatedService {
    _id: string;
    name: string;
    price: number;
    duration: number;
}

export interface IPopulatedLocation {
    _id: string;
    name: string;
}

// 3. The exact data your frontend receives from the GET request
// Notice we DO NOT extend IAppointmentFormData here, we redefine the relations as objects.
export interface IAppointmentResponse {
    _id: string;
    clientId: IPopulatedClient;
    date: string;
    time: string;
    notes?: string;
    status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
    totalPrice: number;     
    totalDuration: number;
    
    // These are objects now, thanks to .populate()!
    locationId: IPopulatedLocation;
    carId: IPopulatedCar;
    serviceIds: IPopulatedService[];

    createdAt?: string;
    updatedAt?: string;
}