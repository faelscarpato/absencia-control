'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, AlertCircle, Loader2 } from 'lucide-react';

export default function MigrationHelper() {
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const runMigration = async () => {
    try {
      setMigrationStatus('loading');
      setMessage('Migrando dados para o Supabase...');
      
      const response = await fetch('/api/migrate');
      const data = await response.json();
      
      if (data.success) {
        setMigrationStatus('success');
        setMessage('Migração concluída com sucesso! Os dados foram transferidos para o Supabase.');
      } else {
        setMigrationStatus('error');
        setMessage(`Erro na migração: ${data.error}`);
      }
    } catch (error) {
      setMigrationStatus('error');
      setMessage(`Erro na migração: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card p-4 sm:p-6 rounded-lg shadow-lg max-w-full sm:max-w-md mx-auto my-4 sm:my-8"
    >
      <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Migração para Supabase</h2>
      <p className="text-sm text-muted-foreground mb-4 sm:mb-6">
        Este assistente irá migrar seus dados do localStorage para o Supabase, 
        permitindo acesso multi-usuário e maior segurança.
      </p>
      
      {migrationStatus === 'idle' && (
        <button
          onClick={runMigration}
          className="w-full py-2 bg-primary text-primary-foreground rounded-md hover:bg-opacity-90 text-sm sm:text-base"
        >
          Iniciar Migração
        </button>
      )}
      
      {migrationStatus === 'loading' && (
        <div className="flex items-center justify-center space-x-2 py-2">
          <Loader2 className="animate-spin" size={18} />
          <span className="text-sm">{message}</span>
        </div>
      )}
      
      {migrationStatus === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
          <Check className="text-green-500 mt-0.5 flex-shrink-0" size={18} />
          <div>
            <h4 className="font-medium text-green-800 text-sm sm:text-base">Migração concluída</h4>
            <p className="text-green-700 text-xs sm:text-sm mt-1">{message}</p>
          </div>
        </div>
      )}
      
      {migrationStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
          <AlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={18} />
          <div>
            <h4 className="font-medium text-red-800 text-sm sm:text-base">Erro na migração</h4>
            <p className="text-red-700 text-xs sm:text-sm mt-1">{message}</p>
            <button
              onClick={runMigration}
              className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 text-xs sm:text-sm"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
