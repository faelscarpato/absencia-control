'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, X, Check, User, Loader2 } from 'lucide-react';
import { getEmployees, saveEmployee, updateEmployee, deleteEmployee } from '@/lib/data';
import { Employee } from '@/types';

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [newEmployee, setNewEmployee] = useState<Omit<Employee, 'id'>>({ name: '', role: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setIsLoading(true);
        const storedEmployees = await getEmployees();
        setEmployees(storedEmployees);
      } catch (error) {
        console.error('Failed to load employees', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadEmployees();
  }, []);
  
  const handleAddEmployee = async () => {
    if (!newEmployee.name.trim() || isSaving) return;
    
    try {
      setIsSaving(true);
      const employee = {
        name: newEmployee.name,
        role: newEmployee.role || 'Operador',
      };
      
      const savedEmployee = await saveEmployee(employee);
      
      if (savedEmployee) {
        setEmployees([...employees, savedEmployee]);
        setNewEmployee({ name: '', role: '' });
        setIsAddingEmployee(false);
      } else {
        // Show error if the employee couldn't be saved
        console.error('Failed to add employee: No response from server');
        alert('Não foi possível adicionar o funcionário. Por favor, tente novamente.');
      }
    } catch (error) {
      console.error('Failed to add employee', error);
      alert('Erro ao adicionar funcionário: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleUpdateEmployee = async (id: string) => {
    if (!newEmployee.name.trim() || isSaving) return;
    
    try {
      setIsSaving(true);
      const updatedEmployee = await updateEmployee(id, {
        name: newEmployee.name,
        role: newEmployee.role
      });
      
      if (updatedEmployee) {
        setEmployees(employees.map(emp => 
          emp.id === id ? updatedEmployee : emp
        ));
        setNewEmployee({ name: '', role: '' });
        setEditingEmployeeId(null);
      }
    } catch (error) {
      console.error('Failed to update employee', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleEditEmployee = (employee: Employee) => {
    setNewEmployee({ name: employee.name, role: employee.role });
    setEditingEmployeeId(employee.id);
  };
  
  const handleDeleteEmployee = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este funcionário? Todas as faltas associadas também serão removidas.')) {
      return;
    }
    
    try {
      setIsSaving(true);
      const success = await deleteEmployee(id);
      
      if (success) {
        setEmployees(employees.filter(emp => emp.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete employee', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 md:space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <h2 className="text-lg sm:text-xl font-bold">Gestão de Funcionários</h2>
        <button 
          onClick={() => {
            setIsAddingEmployee(true);
            setEditingEmployeeId(null);
            setNewEmployee({ name: '', role: '' });
          }}
          className="w-full sm:w-auto px-4 py-2 bg-primary text-primary-foreground rounded-md flex items-center justify-center sm:justify-start gap-2"
        >
          <Plus size={16} />
          <span>Adicionar Funcionário</span>
        </button>
      </div>
      
      <div className="mb-4 md:mb-6">
        <input
          type="text"
          placeholder="Buscar funcionários..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded-md"
        />
      </div>
      
      <AnimatePresence>
        {isAddingEmployee && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-card p-4 sm:p-6 rounded-lg shadow mb-4 md:mb-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-lg font-medium">Adicionar Novo Funcionário</h3>
              <button 
                onClick={() => setIsAddingEmployee(false)}
                className="p-1 rounded-full bg-secondary text-secondary-foreground"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="grid gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  id="name"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  placeholder="Nome do funcionário"
                />
              </div>
              
              <div>
                <label htmlFor="role" className="block text-sm font-medium mb-1">
                  Função
                </label>
                <input
                  type="text"
                  id="role"
                  value={newEmployee.role}
                  onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  placeholder="Ex: Operador"
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={handleAddEmployee}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md flex items-center gap-2"
                  disabled={!newEmployee.name.trim()}
                >
                  <Check size={16} />
                  <span>Salvar</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {filteredEmployees.map((employee, index) => (
          <motion.div
            key={employee.id}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="bg-card p-4 sm:p-6 rounded-lg shadow"
          >
            {editingEmployeeId === employee.id ? (
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label htmlFor={`edit-name-${employee.id}`} className="block text-sm font-medium mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    id={`edit-name-${employee.id}`}
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                
                <div>
                  <label htmlFor={`edit-role-${employee.id}`} className="block text-sm font-medium mb-1">
                    Função
                  </label>
                  <input
                    type="text"
                    id={`edit-role-${employee.id}`}
                    value={newEmployee.role}
                    onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button 
                    onClick={() => setEditingEmployeeId(null)}
                    className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => handleUpdateEmployee(employee.id)}
                    className="px-3 py-1 bg-primary text-primary-foreground rounded-md"
                    disabled={!newEmployee.name.trim()}
                  >
                    Salvar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="p-2 bg-primary bg-opacity-10 rounded-full">
                      <User size={18} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm sm:text-base">{employee.name}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">{employee.role}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEditEmployee(employee)}
                      className="p-1 text-muted-foreground hover:text-foreground"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteEmployee(employee.id)}
                      className="p-1 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>
      
      {filteredEmployees.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <p className="text-muted-foreground text-sm sm:text-base">
            {searchTerm ? 'Nenhum funcionário encontrado.' : 'Nenhum funcionário cadastrado.'}
          </p>
        </div>
      )}
    </motion.div>
  );
}
