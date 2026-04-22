import { ServiceCategory } from "./serviceTypes";

export interface ILocationFormData {
    name: string;
    address: string;
    coordinates: {
        latitude: string;
        longitude: string;
    };
    description?: string;
    services: ServiceCategory[];

    schedule: {
        [key: string]: {
            open: string;
            close: string;
            isOpen: boolean;
        }
    },
    phone: string,
    rating?: number,
    reviews?: number
}


export interface ILocation extends ILocationFormData {
    _id: string,
    companyId: {
        _id: string,
        phone: string
    }
};