export interface Employee {
  id: string;
  name: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Absence {
  id: string;
  employeeId: string;
  date: string;  // YYYY-MM-DD format
  reason: string;
  approved: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BreakSchedule {
  id: string;
  date: string;  // YYYY-MM-DD format
  shifts: {
    supervisor: string;
    breaks: {
      hour: string;
      operators: string[];
    }[];
  }[];
  createdAt?: string;
  updatedAt?: string;
}
