'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, parse, addDays, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Check, X, ChevronLeft, ChevronRight, Save, Loader2 } from 'lucide-react';
import { getEmployees, getAbsences, saveAbsence, deleteAbsence } from '@/lib/data';
import { Employee, Absence } from '@/types';

export default function AttendanceRegistration() {
  const [date, setDate] = useState(new Date());
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState('');
  const [filter, setFilter] = useState('');

  // Load employees and absences
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const storedEmployees = await getEmployees();
        const storedAbsences = await getAbsences();
        
        setEmployees(storedEmployees);
        setAbsences(storedAbsences);
      } catch (error) {
        console.error('Failed to load data', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Get absences for the current date
  const currentDateString = format(date, 'yyyy-MM-dd');
  const todayAbsences = absences.filter(absence => absence.date === currentDateString);
  
  // Get employees who are absent today
  const absentEmployeeIds = todayAbsences.map(absence => absence.employeeId);
  
  // Filter employees based on search term
  const filteredEmployees = employees.filter(employee => 
    employee.name.toLowerCase().includes(filter.toLowerCase())
  );

  const handlePreviousDay = () => {
    setDate(subDays(date, 1));
  };

  const handleNextDay = () => {
    setDate(addDays(date, 1));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value
      ? parse(e.target.value, 'yyyy-MM-dd', new Date())
      : new Date();
    setDate(newDate);
  };

  const handleRegisterAbsence = async () => {
    if (!selectedEmployee || !reason) {
      setSaveMessage('Por favor, selecione um funcionário e informe o motivo da falta.');
      return;
    }

    setIsSaving(true);

    try {
      // Check if employee is already marked as absent for this date
      const existingAbsence = absences.find(
        absence => absence.employeeId === selectedEmployee && absence.date === currentDateString
      );

      if (existingAbsence) {
        setSaveMessage('Este funcionário já está registrado como ausente nesta data.');
        setIsSaving(false);
        return;
      }

      // Create new absence record
      const newAbsence = {
        employeeId: selectedEmployee,
        date: currentDateString,
        reason,
        approved: true,
      };

      const savedAbsence = await saveAbsence(newAbsence);

      if (savedAbsence) {
        setAbsences([...absences, savedAbsence]);
        
        // Reset form
        setSelectedEmployee('');
        setReason('');
        setSaveMessage('Falta registrada com sucesso!');

        // Clear message after 3 seconds
        setTimeout(() => {
          setSaveMessage('');
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to save absence', error);
      setSaveMessage('Erro ao registrar falta.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveAbsence = async (absenceId: string) => {
    try {
      setIsSaving(true);
      const success = await deleteAbsence(absenceId);
      
      if (success) {
        setAbsences(absences.filter(absence => absence.id !== absenceId));
        setSaveMessage('Registro de falta removido com sucesso!');

        // Clear message after 3 seconds
        setTimeout(() => {
          setSaveMessage('');
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to remove absence', error);
      setSaveMessage('Erro ao remover registro de falta.');
    } finally {
      setIsSaving(false);
    }
  };

  // Get employee name by ID
  const getEmployeeName = (id: string) => {
    const employee = employees.find(emp => emp.id === id);
    return employee ? employee.name : 'Funcionário Desconhecido';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 md:space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <h2 className="text-lg sm:text-xl font-bold">Registro de Presenças e Faltas</h2>
        
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button 
            onClick={handlePreviousDay}
            className="p-2 rounded-md bg-secondary text-secondary-foreground"
          >
            <ChevronLeft size={18} />
          </button>
          
          <div className="flex items-center space-x-2 flex-1 sm:flex-auto">
            <Calendar size={18} className="text-muted-foreground hidden sm:block" />
            <input
              type="date"
              value={format(date, 'yyyy-MM-dd')}
              onChange={handleDateChange}
              className="border rounded-md p-2 w-full sm:w-auto"
            />
          </div>
          
          <button 
            onClick={handleNextDay}
            className="p-2 rounded-md bg-secondary text-secondary-foreground"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className={`p-3 rounded-md text-sm ${saveMessage.includes('Erro') ? 'bg-destructive bg-opacity-10 text-destructive' : 'bg-primary bg-opacity-10 text-primary'}`}>
          {saveMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Registration Form */}
        <div className="bg-card p-4 sm:p-6 rounded-lg shadow">
          <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Registrar Nova Falta</h3>
          
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label htmlFor="employee-filter" className="block text-sm font-medium mb-1">
                Buscar Funcionário
              </label>
              <input
                type="text"
                id="employee-filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Digite o nome do funcionário..."
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="employee" className="block text-sm font-medium mb-1">
                Funcionário
              </label>
              <select
                id="employee"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Selecione um funcionário</option>
                {filteredEmployees.map((employee) => (
                  <option 
                    key={employee.id} 
                    value={employee.id}
                    disabled={absentEmployeeIds.includes(employee.id)}
                  >
                    {employee.name} {absentEmployeeIds.includes(employee.id) ? '(Já registrado como ausente)' : ''}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="reason" className="block text-sm font-medium mb-1">
                Motivo da Falta
              </label>
              <select
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Selecione um motivo</option>
                <option value="Doença">Doença</option>
                <option value="Consulta Médica">Consulta Médica</option>
                <option value="Motivos Pessoais">Motivos Pessoais</option>
                <option value="Férias">Férias</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={handleRegisterAbsence}
                disabled={isSaving || !selectedEmployee || !reason}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary-foreground"></div>
                ) : (
                  <Save size={16} />
                )}
                <span>Registrar Falta</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Absences List */}
        <div className="bg-card p-4 sm:p-6 rounded-lg shadow">
          <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">
            Faltas Registradas em {format(date, 'dd/MM/yyyy', { locale: ptBR })}
          </h3>
          
          {todayAbsences.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {todayAbsences.map((absence) => (
                <div 
                  key={absence.id} 
                  className="flex justify-between items-center p-2 sm:p-3 border rounded-md"
                >
                  <div>
                    <p className="font-medium text-sm sm:text-base">{getEmployeeName(absence.employeeId)}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Motivo: {absence.reason}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveAbsence(absence.id)}
                    className="p-1 sm:p-2 text-destructive hover:bg-destructive hover:bg-opacity-10 rounded-full"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm">
              Nenhuma falta registrada para esta data.
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-card p-4 sm:p-6 rounded-lg shadow">
        <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Lista de Presença</h3>
        
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="min-w-full inline-block align-middle">
            <div className="overflow-hidden px-4 sm:px-0">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-3 text-sm">Funcionário</th>
                    <th className="text-center pb-3 text-sm">Função</th>
                    <th className="text-right pb-3 text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => {
                    const isAbsent = absentEmployeeIds.includes(employee.id);
                    return (
                      <tr key={employee.id} className="border-b">
                        <td className="py-2 sm:py-3 text-sm">{employee.name}</td>
                        <td className="py-2 sm:py-3 text-center text-sm">{employee.role}</td>
                        <td className="py-2 sm:py-3 text-right">
                          {isAbsent ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-destructive bg-opacity-10 text-destructive">
                              <X size={12} className="mr-1" />
                              Ausente
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Check size={12} className="mr-1" />
                              Presente
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
