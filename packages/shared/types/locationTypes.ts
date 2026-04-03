export interface ILocationFormData {
    name: string;
    address: string;
    coordinates: {
        latitude: string;
        longitude: string;
    };
    description?: string;
    services: string[];

    schedule: {
        [key: string]: {
            open: string;
            close: string;
            isOpen: boolean;
        }
    },
    phone: String,
    rating?: Number,
    reviews?: Number
}


export interface ILocation extends ILocationFormData {
    _id: string,
    companyId: string
};