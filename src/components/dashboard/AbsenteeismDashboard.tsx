'use client';

import { useState, useEffect } from 'react';
import { format, subMonths, addMonths, getDaysInMonth, getMonth, getYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { ChevronLeft, ChevronRight, Calendar, Users, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { getEmployees, getAbsences } from '@/lib/data';
import { Employee, Absence } from '@/types';

export default function AbsenteeismDashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [loading, setLoading] = useState(true);
  
  const month = format(currentDate, 'MMMM', { locale: ptBR });
  const year = format(currentDate, 'yyyy');
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const storedEmployees = await getEmployees();
        const storedAbsences = await getAbsences();
        
        setEmployees(storedEmployees);
        setAbsences(storedAbsences);
      } catch (error) {
        console.error('Failed to load data', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  const previousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  // Filter absences for current month
  const currentMonthAbsences = absences.filter(absence => {
    const absenceDate = new Date(absence.date);
    return getMonth(absenceDate) === getMonth(currentDate) && 
           getYear(absenceDate) === getYear(currentDate);
  });
  
  // Calculate absence rate
  const totalWorkdays = getDaysInMonth(currentDate) * employees.length;
  const absenceRate = totalWorkdays > 0 
    ? (currentMonthAbsences.length / totalWorkdays) * 100 
    : 0;
  
  // Prepare data for charts
  
  // Absences by reason
  const absencesByReason = currentMonthAbsences.reduce((acc, absence) => {
    acc[absence.reason] = (acc[absence.reason] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const reasonsData = Object.entries(absencesByReason).map(([name, value]) => ({
    name,
    value,
  }));
  
  // Absences by day
  const daysInMonth = getDaysInMonth(currentDate);
  const dayLabels = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  const absencesByDay = dayLabels.map(day => {
    const count = currentMonthAbsences.filter(absence => {
      const absenceDate = new Date(absence.date);
      return absenceDate.getDate() === day;
    }).length;
    
    return {
      day: String(day),
      absences: count
    };
  });
  
  // Calculate top absentees
  const absencesByEmployee = employees.map(employee => {
    const count = currentMonthAbsences.filter(absence => 
      absence.employeeId === employee.id
    ).length;
    
    return {
      id: employee.id,
      name: employee.name,
      absences: count
    };
  }).sort((a, b) => b.absences - a.absences).slice(0, 5);
  
  const COLORS = ['#2F3F4A', '#E86343', '#2A9187', '#D9B64E', '#E67E33'];
  
  // For the animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };
  
  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-4 md:space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <h2 className="text-lg sm:text-xl font-bold">Dashboard de Absenteísmo</h2>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={previousMonth} 
            className="p-2 rounded-md bg-secondary text-secondary-foreground"
          >
            <ChevronLeft size={18} />
          </button>
          
          <h3 className="text-base sm:text-lg font-medium capitalize">
            {month}, {year}
          </h3>
          
          <button 
            onClick={nextMonth} 
            className="p-2 rounded-md bg-secondary text-secondary-foreground"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-card p-4 sm:p-6 rounded-lg shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-muted-foreground text-xs sm:text-sm">Taxa de Absenteísmo</p>
              <h3 className="text-2xl sm:text-3xl font-bold">{absenceRate.toFixed(2)}%</h3>
            </div>
            <span className="p-2 bg-primary bg-opacity-10 rounded-full">
              <Calendar size={18} className="text-primary" />
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-3 sm:mt-4">
            {currentMonthAbsences.length} faltas registradas em {totalWorkdays} dias úteis
          </p>
        </div>
        
        <div className="bg-card p-4 sm:p-6 rounded-lg shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-muted-foreground text-xs sm:text-sm">Total de Funcionários</p>
              <h3 className="text-2xl sm:text-3xl font-bold">{employees.length}</h3>
            </div>
            <span className="p-2 bg-primary bg-opacity-10 rounded-full">
              <Users size={18} className="text-primary" />
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-3 sm:mt-4">
            Funcionários ativos no sistema
          </p>
        </div>
        
        <div className="bg-card p-4 sm:p-6 rounded-lg shadow sm:col-span-2 md:col-span-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-muted-foreground text-xs sm:text-sm">Média de Faltas por Funcionário</p>
              <h3 className="text-2xl sm:text-3xl font-bold">
                {employees.length > 0 ? (currentMonthAbsences.length / employees.length).toFixed(1) : '0'}
              </h3>
            </div>
            <span className="p-2 bg-primary bg-opacity-10 rounded-full">
              <Calendar size={18} className="text-primary" />
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-3 sm:mt-4">
            No mês de {format(currentDate, 'MMMM', { locale: ptBR })}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-card p-4 sm:p-6 rounded-lg shadow">
          <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Faltas por Dia</h3>
          <div className="h-60 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={absencesByDay}
                margin={{
                  top: 5,
                  right: 10,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="absences" name="Faltas" fill="var(--chart-1)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-card p-4 sm:p-6 rounded-lg shadow">
          <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Faltas por Motivo</h3>
          <div className="h-60 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reasonsData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {reasonsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="bg-card p-4 sm:p-6 rounded-lg shadow">
        <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Top Funcionários com Mais Faltas</h3>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="min-w-full inline-block align-middle">
            <div className="overflow-hidden px-4 sm:px-0">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-3 text-sm">Funcionário</th>
                    <th className="text-center pb-3 text-sm">Faltas</th>
                    <th className="text-right pb-3 text-sm">Taxa</th>
                  </tr>
                </thead>
                <tbody>
                  {absencesByEmployee.map((employee) => (
                    <tr key={employee.id} className="border-b">
                      <td className="py-3 sm:py-4 text-sm">{employee.name}</td>
                      <td className="py-3 sm:py-4 text-center text-sm">{employee.absences}</td>
                      <td className="py-3 sm:py-4 text-right text-sm">
                        {((employee.absences / daysInMonth) * 100).toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                  {absencesByEmployee.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-3 sm:py-4 text-center text-sm text-muted-foreground">
                        Nenhum dado disponível para este mês
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
