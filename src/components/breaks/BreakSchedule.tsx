'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, Save, AlertCircle, Loader2, FileDown, Wifi } from 'lucide-react';
import { getBreakSchedules, saveBreakSchedule, getBreakScheduleByDate, getEmployees, getAbsences } from '@/lib/data';
import { BreakSchedule as BreakScheduleType, Employee, Absence } from '@/types';
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { useRealtimeSubscription } from '@/lib/hooks/useRealtimeSubscription';
import CollaborationInfo from './CollaborationInfo';
import ActiveUsers from './ActiveUsers';
import RealtimeNotification from '@/components/ui/RealtimeNotification';

export default function BreakSchedule() {
  const [date, setDate] = useState(new Date());
  const [schedule, setSchedule] = useState<BreakScheduleType | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState('');
  const [tableView, setTableView] = useState<'edit' | 'view'>('edit');
  const [realtimeStatus, setRealtimeStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [notification, setNotification] = useState({ visible: false, message: '' });
  const [lastUpdateId, setLastUpdateId] = useState<string | null>(null);
  
  // Format current date as string for API calls and filtering
  const currentDateString = format(date, 'yyyy-MM-dd');

  const hours = ['15h', '16h', '17h', '18h', '19h', '20h'];
  const supervisors = ['Gabriel', 'Thais', 'Evaldo', 'Maria', 'Kelly', 'Vitória', 'Emanuel'];
  
  // Set up real-time subscription for break schedules
  const { status, reconnect } = useRealtimeSubscription<BreakScheduleType>(
    'break_schedules',
    (updatedSchedule) => {
      // Only update if the schedule is for the current date and it's not our own update
      if (updatedSchedule && updatedSchedule.date === currentDateString) {
        // Generate an update ID to prevent duplicate notifications
        const updateId = `${updatedSchedule.id}-${Date.now()}`;
        
        // Check if this is a new update (not triggered by our own save)
        if (lastUpdateId !== updateId) {
          console.log('Received real-time update for break schedule:', updatedSchedule);
          try {
            // Parse the shifts JSON if it's a string
            const parsedSchedule = {
              ...updatedSchedule,
              shifts: typeof updatedSchedule.shifts === 'string' 
                ? JSON.parse(updatedSchedule.shifts) 
                : updatedSchedule.shifts
            };
            setSchedule(parsedSchedule);
            
            // Show notification about the update
            setNotification({
              visible: true,
              message: 'Os horários foram atualizados por outro usuário!'
            });
            
            // Store this update ID to prevent duplicate notifications
            setLastUpdateId(updateId);
          } catch (error) {
            console.error('Error parsing real-time schedule update:', error);
          }
        }
      }
    },
    'UPDATE',
    { column: 'date', value: currentDateString }
  );
  
  // Handle manual reconnection
  const handleReconnect = () => {
    setRealtimeStatus('connecting');
    reconnect();
  };
  
  // Update realtime status when it changes
  useEffect(() => {
    setRealtimeStatus(status);
  }, [status]);

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

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        setIsLoading(true);
        const dateString = format(date, 'yyyy-MM-dd');
        const found = await getBreakScheduleByDate(dateString);
        
        if (found) {
          setSchedule(found);
        } else {
          // Create a new empty schedule
          const newSchedule = {
            id: '',
            date: dateString,
            shifts: supervisors.map(supervisor => ({
              supervisor,
              breaks: hours.map(hour => ({
                hour,
                operators: Array(4).fill('') // 4 operators per hour
              }))
            }))
          };
          
          setSchedule(newSchedule);
        }
      } catch (error) {
        console.error('Failed to load break schedule', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSchedule();
  }, [date]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value
      ? parse(e.target.value, 'yyyy-MM-dd', new Date())
      : new Date();
    setDate(newDate);
  };

  const handleOperatorChange = (
    supervisorIndex: number,
    hourIndex: number,
    operatorIndex: number,
    value: string
  ) => {
    if (!schedule) return;
    
    const updatedSchedule = { ...schedule };
    updatedSchedule.shifts[supervisorIndex].breaks[hourIndex].operators[operatorIndex] = value;
    
    setSchedule(updatedSchedule);
  };

  const handleSaveSchedule = async () => {
    if (!schedule) return;
    
    setIsSaving(true);
    
    try {
      const savedSchedule = await saveBreakSchedule({
        date: schedule.date,
        shifts: schedule.shifts
      });
      
      if (savedSchedule) {
        // Generate an update ID to prevent duplicate notifications from our own save
        const updateId = `${savedSchedule.id}-${Date.now()}`;
        setLastUpdateId(updateId);
        
        setSchedule(savedSchedule);
        setSaveMessage('Horários salvos com sucesso! Outros usuários verão as alterações em tempo real.');
        
        setTimeout(() => {
          setSaveMessage('');
        }, 5000);
      }
    } catch (error) {
      console.error('Failed to save break schedule', error);
      setSaveMessage('Erro ao salvar horários.');
    } finally {
      setIsSaving(false);
    }
  };

  // Get absences for the current date
  const todayAbsences = absences.filter(absence => absence.date === currentDateString);
  
  // Get employees who are absent today
  const absentEmployeeIds = todayAbsences.map(absence => absence.employeeId);
  
  // Get absent operators (employees with role "Operador")
  const absentOperators = employees
    .filter(emp => absentEmployeeIds.includes(emp.id) && emp.role === 'Operador')
    .map(emp => emp.name);

  // Function to get available operators (not absent)
  const getAvailableOperators = () => {
    return employees
      .filter(emp => !absentEmployeeIds.includes(emp.id) && emp.role === 'Operador')
      .map(emp => emp.name);
  };

  // Function to suggest operators for each time slot
  const suggestOperators = () => {
    if (!schedule) return;
    
    const availableOperators = getAvailableOperators();
    const operatorsPerHour = 4;
    const totalOperators = availableOperators.length;
    
    // Create a new schedule with adjusted operators
    const updatedSchedule = { ...schedule };
    
    // For each supervisor
    updatedSchedule.shifts.forEach((shift, supervisorIndex) => {
      // For each hour slot
      shift.breaks.forEach((breakSlot, hourIndex) => {
        // Calculate starting index for this supervisor and hour
        const startIdx = (supervisorIndex * hours.length + hourIndex) * operatorsPerHour % totalOperators;
        
        // Assign operators to this slot
        for (let i = 0; i < operatorsPerHour; i++) {
          const operatorIdx = (startIdx + i) % totalOperators;
          breakSlot.operators[i] = availableOperators[operatorIdx];
        }
      });
    });
    
    setSchedule(updatedSchedule);
  };
  
  // Function to export the break schedule to PDF
  const exportToPDF = () => {
    if (!schedule) return;
    
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text("Horários de Pausas e Operadores", 14, 15);
    
    // Add date
    doc.setFontSize(12);
    doc.text(`Data: ${format(date, 'dd/MM/yyyy', { locale: ptBR })}`, 14, 25);
    
    // Create table data
    const tableData: string[][] = [];
    
    // For each supervisor, create a row
    schedule.shifts.forEach(shift => {
      const row = [shift.supervisor];
      
      // For each hour, add the operators
      shift.breaks.forEach(breakSlot => {
        const operatorNames = breakSlot.operators
          .filter(op => op) // Filter out empty operators
          .join(', ');
        row.push(operatorNames);
      });
      
      tableData.push(row);
    });
    
    // Create headers for the table
    const headers = ['Supervisor', ...hours];
    
    // Generate PDF table
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 35,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [24, 24, 27], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    });
    
    // Add footer note for absent operators if any
    if (absentOperators.length > 0) {
      const finalY = (doc as any).lastAutoTable.finalY || 35;
      doc.setFontSize(10);
      doc.text("Operadores ausentes: " + absentOperators.join(', '), 14, finalY + 10);
    }
    
    // Save PDF with a formatted date in the filename
    doc.save(`horarios-pausas-${format(date, 'dd-MM-yyyy')}.pdf`);
  };

  if (!schedule) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 md:space-y-6"
    >
      <RealtimeNotification 
        message={notification.message}
        isVisible={notification.visible}
        onClose={() => setNotification({ ...notification, visible: false })}
      />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <h2 className="text-lg sm:text-xl font-bold">Horários de Pausas e Operadores</h2>
          <div className="flex items-center gap-1">
            <Wifi 
              size={16} 
              className={`${
                realtimeStatus === 'connected' 
                  ? 'text-green-500' 
                  : realtimeStatus === 'connecting' 
                    ? 'text-amber-500' 
                    : 'text-red-500'
              }`} 
            />
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {realtimeStatus === 'connected' 
                ? 'Tempo real ativo' 
                : realtimeStatus === 'connecting' 
                  ? 'Conectando...' 
                  : 'Desconectado'}
            </span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Calendar size={18} className="text-muted-foreground" />
            <input
              type="date"
              value={format(date, 'yyyy-MM-dd')}
              onChange={handleDateChange}
              className="border rounded-md p-2 flex-1 sm:flex-auto"
            />
          </div>
          
          <div className="flex space-x-1 w-full sm:w-auto">
            <button
              onClick={() => setTableView('edit')}
              className={`flex-1 sm:flex-auto px-3 py-2 rounded-md flex items-center justify-center gap-1 ${
                tableView === 'edit' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              <span>Editar</span>
            </button>
            <button
              onClick={() => setTableView('view')}
              className={`flex-1 sm:flex-auto px-3 py-2 rounded-md flex items-center justify-center gap-1 ${
                tableView === 'view' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              <span>Visualizar</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <button
          onClick={suggestOperators}
          className="flex-1 sm:flex-none px-3 py-2 bg-secondary text-secondary-foreground rounded-md flex items-center justify-center gap-2"
        >
          <Clock size={16} />
          <span className="text-sm">Sugerir</span>
        </button>
        
        <button
          onClick={exportToPDF}
          className="flex-1 sm:flex-none px-3 py-2 bg-secondary text-secondary-foreground rounded-md flex items-center justify-center gap-2"
        >
          <FileDown size={16} />
          <span className="text-sm">PDF</span>
        </button>
        
        <button
          onClick={handleSaveSchedule}
          disabled={isSaving}
          className="flex-1 sm:flex-none px-3 py-2 bg-primary text-primary-foreground rounded-md flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary-foreground"></div>
          ) : (
            <Save size={16} />
          )}
          <span className="text-sm">Salvar</span>
        </button>
      </div>
      
      {saveMessage && (
        <div className={`p-3 rounded-md text-sm ${
          saveMessage.includes('tempo real') 
            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
            : 'bg-primary bg-opacity-10 text-primary'
        }`}>
          {saveMessage}
        </div>
      )}
      
      <CollaborationInfo 
        status={realtimeStatus} 
        scheduleDate={currentDateString} 
        onReconnect={handleReconnect} 
      />
      
      {absentOperators.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-3 sm:p-4 rounded-md flex items-start gap-2 sm:gap-3">
          <AlertCircle size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-amber-800 text-sm">Operadores ausentes hoje</h4>
            <p className="text-amber-700 text-xs sm:text-sm mt-1">
              Os seguintes operadores estão marcados como ausentes:
              {' '}{absentOperators.join(', ')}
            </p>
          </div>
        </div>
      )}
      
      {tableView === 'edit' ? (
        <div className="bg-card rounded-lg shadow overflow-x-auto -mx-4 sm:mx-0">
          <div className="min-w-[800px]">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="p-2 sm:p-3 text-left text-xs sm:text-sm">Supervisor</th>
                  {hours.map(hour => (
                    <th key={hour} className="p-2 sm:p-3 text-center text-xs sm:text-sm">
                      <div className="flex items-center justify-center gap-1">
                        <Clock size={12} className="hidden sm:inline" />
                        <span>{hour}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {schedule.shifts.map((shift, supervisorIndex) => (
                  <tr key={shift.supervisor} className="border-t">
                    <td className="p-2 sm:p-3 font-medium text-xs sm:text-sm">{shift.supervisor}</td>
                    {shift.breaks.map((breakSlot, hourIndex) => (
                      <td key={`${shift.supervisor}-${breakSlot.hour}`} className="p-1 sm:p-2 border-l">
                        <div className="grid grid-cols-2 gap-1 sm:gap-2">
                          {Array(4).fill(0).map((_, operatorIndex) => (
                            <input
                              key={operatorIndex}
                              type="text"
                              value={breakSlot.operators[operatorIndex] || ''}
                              onChange={(e) => handleOperatorChange(
                                supervisorIndex,
                                hourIndex,
                                operatorIndex,
                                e.target.value
                              )}
                              placeholder={`Op ${operatorIndex + 1}`}
                              className="w-full p-1 text-xs sm:text-sm border rounded"
                              list="available-operators"
                            />
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Datalist for operator suggestions */}
          <datalist id="available-operators">
            {getAvailableOperators().map((operator, index) => (
              <option key={index} value={operator} />
            ))}
          </datalist>
        </div>
      ) : (
        <div className="bg-card rounded-lg shadow overflow-x-auto -mx-4 sm:mx-0">
          <div className="min-w-[800px]">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="p-2 sm:p-3 text-left text-xs sm:text-sm">Supervisor</th>
                  {hours.map(hour => (
                    <th key={hour} className="p-2 sm:p-3 text-center text-xs sm:text-sm">
                      <div className="flex items-center justify-center gap-1">
                        <Clock size={12} className="hidden sm:inline" />
                        <span>{hour}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {schedule.shifts.map((shift) => (
                  <tr key={shift.supervisor} className="border-t">
                    <td className="p-2 sm:p-3 font-medium text-xs sm:text-sm">{shift.supervisor}</td>
                    {shift.breaks.map((breakSlot) => {
                      // Join operator names with commas
                      const operators = breakSlot.operators
                        .filter(Boolean) // Remove empty strings
                        .join(', ');
                        
                      return (
                        <td key={`${shift.supervisor}-${breakSlot.hour}`} className="p-2 sm:p-3 border-l text-xs sm:text-sm">
                          {operators || '—'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}
