'use client';

import { motion } from 'framer-motion';
import { Users, Wifi, RefreshCw } from 'lucide-react';
import ActiveUsers from './ActiveUsers';

interface CollaborationInfoProps {
  status: 'connected' | 'connecting' | 'disconnected';
  scheduleDate?: string;
  onReconnect?: () => void;
}

export default function CollaborationInfo({ status, scheduleDate, onReconnect }: CollaborationInfoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card p-3 sm:p-4 rounded-lg shadow-sm border border-border mb-4 sm:mb-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`p-2 rounded-full ${
            status === 'connected' 
              ? 'bg-green-100' 
              : status === 'connecting' 
                ? 'bg-amber-100' 
                : 'bg-red-100'
          }`}>
            <Wifi 
              size={16} 
              className={`${
                status === 'connected' 
                  ? 'text-green-600' 
                  : status === 'connecting' 
                    ? 'text-amber-600' 
                    : 'text-red-600'
              }`} 
            />
          </div>
          <div>
            <h3 className="font-medium text-sm sm:text-base">Colaboração em Tempo Real</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {status === 'connected' 
                ? 'Você está conectado. Alterações sincronizadas automaticamente.' 
                : status === 'connecting' 
                  ? 'Conectando ao sistema de colaboração...' 
                  : 'Você está desconectado. Alterações não sincronizadas.'}
            </p>
          </div>
          
          {status === 'disconnected' && onReconnect && (
            <button 
              onClick={onReconnect}
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded-md flex items-center gap-2 text-xs transition-colors"
            >
              <RefreshCw size={14} className="animate-spin" />
              Reconectar
            </button>
          )}
        </div>
        
        {status === 'connected' && scheduleDate && (
          <ActiveUsers scheduleDate={scheduleDate} />
        )}
      </div>
    </motion.div>
  );
}
