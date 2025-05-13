'use client';

import { Employee, Absence, BreakSchedule } from '@/types';
import { supabase } from './supabase';

// Employee Methods
export const getEmployees = async (): Promise<Employee[]> => {
  try {
    const response = await fetch('/api/employees', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch employees: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to get employees from API', error);
    return [];
  }
};

export const saveEmployee = async (employee: Omit<Employee, 'id'>): Promise<Employee | null> => {
  try {
    const response = await fetch('/api/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(employee),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save employee');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to save employee to API', error);
    return null;
  }
};

export const updateEmployee = async (id: string, employee: Partial<Employee>): Promise<Employee | null> => {
  try {
    const response = await fetch('/api/employees', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        ...employee
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update employee');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to update employee in API', error);
    return null;
  }
};

export const deleteEmployee = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/employees/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete employee');
    }
    
    return true;
  } catch (error) {
    console.error('Failed to delete employee from API', error);
    return false;
  }
};

// Absence Methods
export const getAbsences = async (): Promise<Absence[]> => {
  try {
    const response = await fetch('/api/absences', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch absences: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to get absences from API', error);
    return [];
  }
};

export const saveAbsence = async (absence: Omit<Absence, 'id'>): Promise<Absence | null> => {
  try {
    const response = await fetch('/api/absences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(absence),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save absence');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to save absence to API', error);
    return null;
  }
};

export const deleteAbsence = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/absences/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete absence');
    }
    
    return true;
  } catch (error) {
    console.error('Failed to delete absence from API', error);
    return false;
  }
};

// Break Schedules Methods
export const getBreakSchedules = async (): Promise<BreakSchedule[]> => {
  try {
    const response = await fetch('/api/breaks', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch break schedules: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to get break schedules from API', error);
    return [];
  }
};

export const getBreakScheduleByDate = async (date: string): Promise<BreakSchedule | null> => {
  try {
    const response = await fetch(`/api/breaks/${date}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.status === 404 || !response.ok) {
      if (response.status !== 404) {
        console.error('Error fetching break schedule:', response.statusText);
      }
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to get break schedule from API', error);
    return null;
  }
};

export const saveBreakSchedule = async (schedule: Omit<BreakSchedule, 'id'>): Promise<BreakSchedule | null> => {
  try {
    const response = await fetch('/api/breaks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(schedule),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save break schedule');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to save break schedule to API', error);
    return null;
  }
};
