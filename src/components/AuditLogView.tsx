import React, { useState } from 'react';
import { AuditLog } from '../types';
import { Search, Clock, PlusCircle, Edit3, Trash2, Upload } from 'lucide-react';

interface AuditLogViewProps {
  logs: AuditLog[];
}

export function AuditLogView({ logs }: AuditLogViewProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(log => 
    log.colaboradorNome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'Criar': return <PlusCircle className="w-4 h-4 text-emerald-500" />;
      case 'Editar': return <Edit3 className="w-4 h-4 text-blue-500" />;
      case 'Eliminar': return <Trash2 className="w-4 h-4 text-rose-500" />;
      case 'Importar': return <Upload className="w-4 h-4 text-indigo-500" />;
      default: return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const getActionStyle = (action: string) => {
    switch (action) {
      case 'Criar': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Editar': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Eliminar': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'Importar': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="h-full flex flex-col pb-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Log de Auditoria</h2>
          <p className="text-slate-500 text-sm mt-1">Histórico de alterações e registos no sistema</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col flex-grow min-h-0">
        <div className="p-4 border-b border-slate-100 flex items-center gap-4 shrink-0">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Procurar nos logs..."
              className="block w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-xs text-slate-500 font-medium">
            {filteredLogs.length} registos
          </div>
        </div>
        
        <div className="overflow-y-auto flex-grow p-4">
          <div className="space-y-4">
            {filteredLogs.length === 0 ? (
               <div className="text-center py-8 text-slate-400 text-sm font-medium">
                 Nenhum registo de auditoria encontrado.
               </div>
            ) : (
              filteredLogs.map(log => (
                <div key={log.id} className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white transition-colors group shadow-sm">
                  <div className="shrink-0 mt-1">
                    <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                      {getActionIcon(log.action)}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getActionStyle(log.action)} mb-2 inline-block`}>
                          {log.action}
                        </span>
                        <h4 className="font-bold text-slate-800 text-sm">{log.colaboradorNome}</h4>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-500">
                          {new Date(log.timestamp).toLocaleDateString('pt-PT')}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {new Date(log.timestamp).toLocaleTimeString('pt-PT')}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{log.details}</p>
                    <div className="mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                      Utilizador: <span className="text-slate-600">{log.user}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
