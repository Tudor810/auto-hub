// 1. Interfața pentru ce TRIMIȚI de pe Frontend (Form Payload / DTO)

export interface ICompanyFormData {
  name: string;    // ex: "SC Auto Hub SRL"
  admin: string;   // ex: "Tudor"
  email: string;   // ex: "contact@autohub.ro"
  phone: string;   // ex: "0722123456"
  cui: string;     // ex: "RO12345678"
  regCom: string;  // ex: "J12/345/2020"
}

// 2. Interfața pentru ce PRIMEȘTI de la Backend (Full Database Object)

export interface ICompany extends ICompanyFormData {
  _id: string;        // ID-ul unic al companiei din MongoDB
  ownerId: string;    // ID-ul utilizatorului (Provider) care deține firma
}