import React, { useState } from 'react';
import { Colaborador } from '../types';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { EmployeeModal } from './EmployeeModal';
import { ConfirmModal } from './ConfirmModal';

interface EmployeeListProps {
  colaboradores: Colaborador[];
  onAdd: (colaborador: Colaborador) => void;
  onUpdate: (colaborador: Colaborador) => void;
  onDelete: (colaborador: Colaborador) => void;
}

export function EmployeeList({ colaboradores, onAdd, onUpdate, onDelete }: EmployeeListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingColaborador, setEditingColaborador] = useState<Colaborador | null>(null);
  
  // State for confirm modal
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [colaboradorToDelete, setColaboradorToDelete] = useState<Colaborador | null>(null);

  const filteredColaboradores = colaboradores.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.apelido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.nuit.includes(searchTerm)
  );

  const handleEdit = (c: Colaborador) => {
    setEditingColaborador(c);
    setIsModalOpen(true);
  };

  const requestDelete = (c: Colaborador) => {
    setColaboradorToDelete(c);
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (colaboradorToDelete) {
      onDelete(colaboradorToDelete);
      setIsConfirmOpen(false);
      setColaboradorToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsConfirmOpen(false);
    setColaboradorToDelete(null);
  };

  const openNew = () => {
    setEditingColaborador(null);
    setIsModalOpen(true);
  };

  const saveColaborador = (colaborador: Colaborador) => {
    if (editingColaborador) {
      onUpdate(colaborador);
    } else {
      onAdd(colaborador);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="h-full flex flex-col pb-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Colaboradores</h2>
          <p className="text-slate-500 text-sm mt-1">Gerir a base de dados de colaboradores</p>
        </div>
        <button 
          onClick={openNew}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Adicionar
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col flex-grow min-h-0">
        <div className="p-4 border-b border-slate-100 flex items-center gap-4 shrink-0">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Filtrar nesta lista..."
              className="block w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-xs text-slate-500 font-medium">
            {filteredColaboradores.length} resultados
          </div>
        </div>
        
        <div className="overflow-y-auto flex-grow">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50 shadow-[0_1px_0_0_#e2e8f0]">
              <tr className="text-slate-500 text-xs tracking-wider border-b border-slate-200 uppercase">
                <th className="px-6 py-3 font-bold">Nome</th>
                <th className="px-6 py-3 font-bold">Empresa / Dept</th>
                <th className="px-6 py-3 font-bold">Cargo</th>
                <th className="px-6 py-3 font-bold">Estado</th>
                <th className="px-6 py-3 font-bold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredColaboradores.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm border border-slate-200">
                        {c.foto ? (
                          <img src={c.foto} alt={c.nome} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            {c.nome.charAt(0)}{c.apelido.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{c.nome} {c.apelido}</div>
                        <div className="text-slate-400 text-[10px]">NUIT: {c.nuit}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <div className="font-bold text-slate-700">{c.empresa}</div>
                    <div className="text-slate-500 text-xs">{c.departamento}</div>
                  </td>
                  <td className="px-6 py-3 text-slate-600 font-medium">{c.cargo}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold
                      ${c.estado === 'Activo' ? 'bg-green-50 text-green-600' : ''}
                      ${c.estado === 'Inactivo' ? 'bg-slate-100 text-slate-600' : ''}
                      ${c.estado === 'Despedido' ? 'bg-red-50 text-red-600' : ''}
                      ${c.estado === 'Suspenso' ? 'bg-yellow-50 text-yellow-600' : ''}
                    `}>
                      {c.estado}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right whitespace-nowrap">
                    <button onClick={() => handleEdit(c)} className="text-indigo-600 hover:bg-indigo-50 p-2 rounded transition-colors mr-1">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => requestDelete(c)} className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredColaboradores.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400 text-sm font-medium">
                    Nenhum colaborador encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <EmployeeModal 
          colaborador={editingColaborador} 
          onClose={() => setIsModalOpen(false)}
          onSave={saveColaborador}
        />
      )}

      <ConfirmModal 
        isOpen={isConfirmOpen}
        title="Eliminar Colaborador"
        message={`Tem a certeza que deseja eliminar o colaborador ${colaboradorToDelete?.nome} ${colaboradorToDelete?.apelido}? Esta ação não pode ser desfeita.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}
