import React from 'react';
import { Download, Shield, Database, Save, Upload } from 'lucide-react';
import { Colaborador, AuditLog } from '../types';

interface SettingsProps {
  colaboradores: Colaborador[];
  auditLogs: AuditLog[];
}

export function Settings({ colaboradores, auditLogs }: SettingsProps) {
  const handleBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        colaboradores,
        auditLogs
      }
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_rh_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col pb-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Configurações</h2>
          <p className="text-slate-500 text-sm mt-1">Gira as preferências do sistema e dados</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden max-w-4xl">
        <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Backup & Segurança</h3>
            <p className="text-sm text-slate-500 mt-1">Gira cópias de segurança locais e opções de proteção de dados.</p>
          </div>
        </div>

        <div className="p-6 space-y-8">
          <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="flex gap-4 items-start">
              <div className="shrink-0 mt-1">
                <Shield className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm mb-1">Exportar Base de Dados</h4>
                <p className="text-sm text-slate-600 mb-2 max-w-lg">
                  Descarregue um ficheiro JSON contendo todos os dados dos colaboradores ({colaboradores.length} registos) e todo o histórico de auditoria ({auditLogs.length} registos).
                </p>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  Recomendado para segurança offline
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleBackup}
              className="shrink-0 px-5 py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors shadow-sm flex items-center justify-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              Gerar Backup JSON
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-xl opacity-60">
            <div className="flex gap-4 items-start">
              <div className="shrink-0 mt-1">
                <Save className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm mb-1">Restaurar Base de Dados</h4>
                <p className="text-sm text-slate-600 mb-2 max-w-lg">
                  Carregue um ficheiro JSON previamente exportado para restaurar todos os dados do sistema. Esta ação substituirá os dados atuais.
                </p>
                <div className="text-[10px] text-amber-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  Em breve
                </div>
              </div>
            </div>
            
            <button 
              disabled
              className="shrink-0 px-5 py-2.5 bg-slate-200 text-slate-400 font-bold rounded-lg cursor-not-allowed shadow-sm flex items-center justify-center gap-2 text-sm"
            >
              <Upload className="w-4 h-4" />
              Restaurar Backup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
