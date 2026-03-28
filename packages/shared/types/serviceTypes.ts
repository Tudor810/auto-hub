export interface IServiceFormData {
    name: string,
    description?: string,
    price: string,
    duration: string,
    category: string,
    isActive: boolean
}

export interface IService extends IServiceFormData {
    _id: string,
    locationId: string
}