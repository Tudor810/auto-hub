export interface ICarFormData {
    plateNr: string;
    make: string;
    model: string;
    year: string;
    fuel: string;
    vin?: string;
    engineCapacity?: string;
    color?: string;
    itpDate: Date | null;
    rcaDate: Date | null;
    rovinietaDate: Date | null;
}


export interface ICar extends ICarFormData {
    _id: string;
    userId: string;
}