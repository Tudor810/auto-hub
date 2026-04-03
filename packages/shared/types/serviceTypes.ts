export type ServiceCategory = 
    | 'Service' 
    | 'ITP' 
    | 'RCA' 
    | 'Vulcanizare' 
    | 'Detailing' 
    | 'Școală Șoferi' 
    | 'Redobândire' 
    | 'Piese Auto' 
    | 'Tractări';

export interface IServiceFormData {
    name: string,
    description?: string,
    price: string,
    duration: string,
    category: ServiceCategory,
    isActive: boolean
}

export interface IService extends IServiceFormData {
    _id: string,
    locationId: string
}