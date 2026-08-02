/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { EmployeeList } from './components/EmployeeList';
import { Reports } from './components/Reports';
import { AuditLogView } from './components/AuditLogView';
import { Settings } from './components/Settings';
import { Colaborador, AuditLog, ActionType } from './types';
import { Search, Plus, Upload } from 'lucide-react';
import { EmployeeModal } from './components/EmployeeModal';
import { ImportModal } from './components/ImportModal';
import { Layout } from './components/Layout';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  // Use state to store data fetched from API
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Fetch initial data and migrate from localStorage if needed
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resColab = await fetch('/api/colaboradores');
        const colabData = await resColab.json();
        
        const resAudit = await fetch('/api/audit-logs');
        const auditData = await resAudit.json();

        // Migration logic from localStorage
        const localColabSaved = localStorage.getItem('hr_colaboradores');
        const localAuditSaved = localStorage.getItem('hr_audit_logs');
        
        let shouldMigrateColabs = false;
        let shouldMigrateLogs = false;
        
        if (localColabSaved && (!Array.isArray(colabData) || colabData.length === 0)) {
          const localColabs = JSON.parse(localColabSaved);
          if (Array.isArray(localColabs) && localColabs.length > 0) {
            await fetch('/api/colaboradores', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(localColabs)
            });
            shouldMigrateColabs = true;
          }
        }
        
        if (localAuditSaved && (!Array.isArray(auditData) || auditData.length === 0)) {
          const localAudits = JSON.parse(localAuditSaved);
          if (Array.isArray(localAudits) && localAudits.length > 0) {
            await fetch('/api/audit-logs', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(localAudits)
            });
            shouldMigrateLogs = true;
          }
        }

        // Refetch if migrated
        if (shouldMigrateColabs) {
          const newRes = await fetch('/api/colaboradores');
          const newData = await newRes.json();
          setColaboradores(newData);
        } else {
          setColaboradores(colabData);
        }

        if (shouldMigrateLogs) {
          const newRes = await fetch('/api/audit-logs');
          const newData = await newRes.json();
          setAuditLogs(newData);
        } else {
          setAuditLogs(auditData);
        }

        // Clear local storage after successful migration or check
        if (localColabSaved) localStorage.removeItem('hr_colaboradores');
        if (localAuditSaved) localStorage.removeItem('hr_audit_logs');
        
      } catch (err) {
        console.error('Failed to fetch initial data or migrate', err);
      }
    };
    fetchData();
  }, []);

  const addAuditLog = async (action: ActionType, colaboradorNome: string, details: string, colaboradorId?: string) => {
    const newLog: AuditLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      action,
      colaboradorNome,
      details,
      colaboradorId: colaboradorId || null,
      user: 'Admin'
    };
    
    setAuditLogs(prev => [newLog, ...prev]);
    
    try {
      await fetch('/api/audit-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newLog)
      });
    } catch (err) {
      console.error('Failed to save audit log', err);
    }
  };

  const handleAddColaborador = async (newEmployee: Colaborador) => {
    setColaboradores(prev => [...prev, newEmployee]);
    addAuditLog('Criar', `${newEmployee.nome} ${newEmployee.apelido}`, `Adicionou um novo colaborador na empresa ${newEmployee.empresa}`, newEmployee.id);
    await fetch('/api/colaboradores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEmployee)
    });
  };

  const handleUpdateColaborador = async (updatedEmployee: Colaborador) => {
    setColaboradores(prev => prev.map(c => c.id === updatedEmployee.id ? updatedEmployee : c));
    addAuditLog('Editar', `${updatedEmployee.nome} ${updatedEmployee.apelido}`, `Editou os dados do colaborador (Cargo: ${updatedEmployee.cargo}, Empresa: ${updatedEmployee.empresa})`, updatedEmployee.id);
    await fetch(`/api/colaboradores/${updatedEmployee.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedEmployee)
    });
  };

  const handleDeleteColaborador = async (deletedColaborador: Colaborador) => {
    setColaboradores(prev => prev.filter(c => c.id !== deletedColaborador.id));
    addAuditLog('Eliminar', `${deletedColaborador.nome} ${deletedColaborador.apelido}`, `Eliminou o colaborador ${deletedColaborador.nome} ${deletedColaborador.apelido}`, deletedColaborador.id);
    await fetch(`/api/colaboradores/${deletedColaborador.id}`, {
      method: 'DELETE'
    });
  };
  
  const handleImportColaboradores = async (newEmployees: Colaborador[]) => {
    setColaboradores(prev => [...prev, ...newEmployees]);
    addAuditLog('Importar', 'Múltiplos Colaboradores', `Importou ${newEmployees.length} novos colaboradores via ficheiro CSV`);
    await fetch('/api/colaboradores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEmployees)
    });
  };

  const currentDate = new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' });

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard': return <Dashboard colaboradores={colaboradores} />;
      case 'colaboradores': return (
        <EmployeeList 
          colaboradores={colaboradores} 
          onAdd={handleAddColaborador} 
          onUpdate={handleUpdateColaborador} 
          onDelete={handleDeleteColaborador} 
        />
      );
      case 'relatorios': return <Reports colaboradores={colaboradores} />;
      case 'auditoria': return <AuditLogView logs={auditLogs} />;
      case 'configuracoes': return <Settings colaboradores={colaboradores} auditLogs={auditLogs} />;
      default: return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white m-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
            <Settings className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Módulo em Desenvolvimento</h2>
          <p className="text-slate-500 max-w-md">Este módulo faz parte da versão Enterprise e encontra-se atualmente em fase de implementação.</p>
        </div>
      );
    }
  };

  return (
    <Layout currentTab={currentTab} onTabChange={setCurrentTab}>
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight capitalize">{currentTab.replace('_', ' ')}</h1>
          <p className="text-sm text-slate-500 font-medium">Última atualização: {currentDate}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input type="text" placeholder="Pesquisar..." className="bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm w-64 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" />
          </div>
          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Importar</span>
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto bg-slate-50 relative">
        {renderContent()}
      </div>

      {isAddModalOpen && (
        <EmployeeModal 
          colaborador={null}
          onClose={() => setIsAddModalOpen(false)}
          onSave={(newEmployee) => {
            handleAddColaborador(newEmployee);
            setIsAddModalOpen(false);
            if (currentTab !== 'colaboradores') {
              setCurrentTab('colaboradores');
            }
          }}
        />
      )}

      {isImportModalOpen && (
        <ImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImport={(newEmployees) => {
            handleImportColaboradores(newEmployees);
            if (currentTab !== 'colaboradores') {
              setCurrentTab('colaboradores');
            }
          }}
        />
      )}
    </Layout>
  );
}
