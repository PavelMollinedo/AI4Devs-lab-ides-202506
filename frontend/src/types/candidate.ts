export interface CandidateEmail {
    id?: number;
    email: string;
    isPrimary?: boolean;
  }
  
  export interface CandidatePhone {
    id?: number;
    phone: string;
    typeId: number;
    isPrimary?: boolean;
    type?: { id: number; name: string }; // Para mostrar el nombre del tipo
  }
  
  export interface CandidateAddress {
    id?: number;
    address: string;
    typeId: number;
    isPrimary?: boolean;
    type?: { id: number; name: string };
  }
  
  export interface CandidateEducation {
    id?: number;
    institution: string;
    degree: string;
    startDate: string;
    endDate?: string;
    typeId: number;
    type?: { id: number; name: string };
  }
  
  export interface CandidateExperience {
    id?: number;
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    description?: string;
    typeId: number;
    type?: { id: number; name: string };
  }
  
  export interface Candidate {
    id?: number;
    personalId: string;
    firstName: string;
    secondName?: string;
    firstSurname: string;
    secondSurname?: string;
    resumeUrl?: string;
    emails: CandidateEmail[];
    phones: CandidatePhone[];
    addresses: CandidateAddress[];
    educations?: CandidateEducation[];
    experiences?: CandidateExperience[];
  }