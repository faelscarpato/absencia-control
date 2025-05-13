'use client';

import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, LayoutDashboard, Users, Clock, ClipboardCheck, Database, Menu, X } from 'lucide-react';
import AbsenteeismDashboard from '@/components/dashboard/AbsenteeismDashboard';
import EmployeeManagement from '@/components/employees/EmployeeManagement';
import BreakSchedule from '@/components/breaks/BreakSchedule';
import AttendanceRegistration from '@/components/attendance/AttendanceRegistration';
import MigrationHelper from '@/components/migration/MigrationHelper';
import { motion, AnimatePresence } from 'framer-motion';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'employees' | 'breaks' | 'attendance' | 'migration'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'attendance', label: 'Registro de Presenças', icon: <ClipboardCheck size={18} /> },
    { id: 'employees', label: 'Funcionários', icon: <Users size={18} /> },
    { id: 'breaks', label: 'Horários de Pausa', icon: <Clock size={18} /> },
    { id: 'migration', label: 'Migração', icon: <Database size={18} /> },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary py-4 sticky top-0 z-30">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold text-primary-foreground">Controle de Absenteísmo</h1>
          <button 
            className="md:hidden text-primary-foreground p-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-4 md:py-6">
        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-3 py-2 flex items-center space-x-2 rounded-md ${
                activeTab === tab.id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mb-4 overflow-hidden"
            >
              <div className="flex flex-col gap-2 bg-card p-3 rounded-md shadow-md">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`px-3 py-3 flex items-center space-x-3 rounded-md ${
                      activeTab === tab.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Tab Indicator */}
        <div className="md:hidden mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium flex items-center gap-2">
            {tabs.find(tab => tab.id === activeTab)?.icon}
            {tabs.find(tab => tab.id === activeTab)?.label}
          </h2>
        </div>

        {activeTab === 'dashboard' && <AbsenteeismDashboard />}
        {activeTab === 'attendance' && <AttendanceRegistration />}
        {activeTab === 'employees' && <EmployeeManagement />}
        {activeTab === 'breaks' && <BreakSchedule />}
        {activeTab === 'migration' && <MigrationHelper />}
      </div>
    </div>
  );
}
