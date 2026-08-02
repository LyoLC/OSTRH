import React, { useState } from 'react';
import { Colaborador } from '../types';
import { Filter, Printer, Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportsProps {
  colaboradores: Colaborador[];
}

export function Reports({ colaboradores }: ReportsProps) {
  const [tipoRelatorio, setTipoRelatorio] = useState<string>('Lista Geral');
  const [filterEmpresa, setFilterEmpresa] = useState<string>('Todas');
  const [filterDept, setFilterDept] = useState<string>('Todos');
  const [filterEstado, setFilterEstado] = useState<string>('Todos');

  const TIPOS_RELATORIO = ['Lista Geral', 'Colaboradores Inativos', 'Aniversariantes do Mês', 'Recibos de Vencimento'];
  const EMPRESAS = ['Todas', 'NUKE', 'PCS', 'ZMAX', 'MICC'];
  const DEPARTAMENTOS = ['Todos', 'Oficina', 'Operação', 'Administração', 'Warehouse', 'Safety'];
  const ESTADOS = ['Todos', 'Activo', 'Inactivo', 'Despedido', 'Suspenso'];

  const filtered = colaboradores.filter(c => {
    if (filterEmpresa !== 'Todas' && c.empresa !== filterEmpresa) return false;
    if (filterDept !== 'Todos' && c.departamento !== filterDept) return false;
    
    if (tipoRelatorio === 'Lista Geral' || tipoRelatorio === 'Recibos de Vencimento') {
      if (filterEstado !== 'Todos' && c.estado !== filterEstado) return false;
    }
    
    if (tipoRelatorio === 'Colaboradores Inativos') {
      if (c.estado === 'Activo') return false;
      if (filterEstado !== 'Todos' && filterEstado !== 'Activo' && c.estado !== filterEstado) return false;
    }
    
    if (tipoRelatorio === 'Aniversariantes do Mês') {
      if (!c.dataNascimento) return false;
      const bday = new Date(c.dataNascimento);
      const today = new Date();
      if (bday.getMonth() !== today.getMonth()) return false;
      if (filterEstado !== 'Todos' && c.estado !== filterEstado) return false;
    }
    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text(`Relatório: ${tipoRelatorio}`, 14, 15);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Filtros: Empresa (${filterEmpresa}) | Departamento (${filterDept}) | Estado (${tipoRelatorio === 'Colaboradores Inativos' ? 'Inativos' : filterEstado})`, 14, 22);
    doc.text(`Total: ${filtered.length} colaboradores`, 14, 28);
    
    const tableColumn = ["Nome", "NUIT", "Empresa", "Departamento", "Cargo", "Estado"];
    const tableRows = filtered.map(c => [
      `${c.nome} ${c.apelido}`,
      c.nuit,
      c.empresa,
      c.departamento,
      c.cargo,
      c.estado
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [79, 70, 229] },
    });

    doc.save(`relatorio_${tipoRelatorio.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportPaySlip = (c: Colaborador) => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('RECIBO DE VENCIMENTO', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Empresa: ${c.empresa}`, 14, 40);
    doc.text(`Mês/Ano: ${new Date().toLocaleString('pt-PT', { month: 'long', year: 'numeric' })}`, 14, 48);
    
    doc.text(`Nome do Colaborador: ${c.nome} ${c.apelido}`, 14, 64);
    doc.text(`NUIT: ${c.nuit}`, 14, 72);
    doc.text(`Cargo: ${c.cargo}`, 14, 80);
    doc.text(`Departamento: ${c.departamento}`, 14, 88);
    
    const salario = c.salario || 0;
    const irps = salario * 0.15; // 15% de imposto simulado
    const inss = salario * 0.03; // 3% INSS simulado
    const liquido = salario - irps - inss;
    
    autoTable(doc, {
      startY: 100,
      head: [['Descrição', 'Abonos (MZN)', 'Descontos (MZN)']],
      body: [
        ['Vencimento Base', salario.toLocaleString('pt-PT', { minimumFractionDigits: 2 }), ''],
        ['Imposto (IRPS 15%)', '', irps.toLocaleString('pt-PT', { minimumFractionDigits: 2 })],
        ['Segurança Social (INSS 3%)', '', inss.toLocaleString('pt-PT', { minimumFractionDigits: 2 })],
      ],
      foot: [['LÍQUIDO A RECEBER', '', liquido.toLocaleString('pt-PT', { minimumFractionDigits: 2 })]],
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
      footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' }
    });
    
    doc.save(`recibo_vencimento_${c.nome}_${c.apelido}.pdf`);
  };

  return (
    <div className="h-full flex flex-col pb-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Relatórios</h2>
          <p className="text-slate-500 text-sm mt-1">Gerar e exportar listas de colaboradores e recibos</p>
        </div>
        <div className="flex items-center gap-2">
          {tipoRelatorio !== 'Recibos de Vencimento' && (
            <button onClick={exportPDF} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors text-sm shadow-sm">
              <Download className="w-4 h-4" />
              Exportar Lista PDF
            </button>
          )}
          <button onClick={handlePrint} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors text-sm shadow-sm">
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 mb-4 shrink-0">
        <div className="flex items-center gap-2 mb-4 text-slate-700 font-bold text-sm uppercase tracking-wider">
          <Filter className="w-4 h-4" />
          Configurações do Relatório
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-[10px] font-bold text-indigo-500 mb-1 uppercase tracking-wider">Tipo de Relatório</label>
            <select value={tipoRelatorio} onChange={e => setTipoRelatorio(e.target.value)} className="w-full px-3 py-2 border border-indigo-200 bg-indigo-50/30 font-bold text-indigo-900 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm">
              {TIPOS_RELATORIO.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Empresa</label>
            <select value={filterEmpresa} onChange={e => setFilterEmpresa(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm">
              {EMPRESAS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Departamento</label>
            <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm">
              {DEPARTAMENTOS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Estado</label>
            <select 
              value={tipoRelatorio === 'Colaboradores Inativos' ? 'Todos Inativos' : filterEstado} 
              onChange={e => setFilterEstado(e.target.value)} 
              disabled={tipoRelatorio === 'Colaboradores Inativos'}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm disabled:bg-slate-100 disabled:text-slate-400"
            >
              {tipoRelatorio === 'Colaboradores Inativos' ? (
                 <option>Todos Inativos</option>
              ) : (
                ESTADOS.map(s => <option key={s} value={s}>{s}</option>)
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Relatório de impressão (printable area) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-0 flex-grow print:shadow-none print:border-none">
        <div className="p-4 border-b border-slate-100 bg-slate-50 shrink-0 print:bg-white print:border-b-2 print:border-black flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{tipoRelatorio}</h3>
            <p className="text-[10px] text-slate-500 mt-1 font-bold">
              Filtros: Empresa ({filterEmpresa}) | Dept ({filterDept}) | Estado ({tipoRelatorio === 'Colaboradores Inativos' ? 'Inativos' : filterEstado}) - Total: {filtered.length}
            </p>
          </div>
        </div>
        
        <div className="overflow-y-auto flex-grow">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white shadow-[0_1px_0_0_#e2e8f0]">
              <tr className="text-slate-500 text-[10px] tracking-wider uppercase border-b border-slate-200 print:bg-white print:text-black">
                <th className="px-6 py-2 font-bold print:px-2">Nome</th>
                <th className="px-6 py-2 font-bold print:px-2">NUIT</th>
                <th className="px-6 py-2 font-bold print:px-2">Empresa</th>
                <th className="px-6 py-2 font-bold print:px-2">Departamento</th>
                <th className="px-6 py-2 font-bold print:px-2">Cargo</th>
                <th className="px-6 py-2 font-bold print:px-2">Estado</th>
                {tipoRelatorio === 'Recibos de Vencimento' && (
                  <th className="px-6 py-2 font-bold text-right print:hidden">Ações</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs print:divide-slate-300">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 print:px-2">
                    <div className="font-bold text-slate-900">{c.nome} {c.apelido}</div>
                    {tipoRelatorio === 'Aniversariantes do Mês' && c.dataNascimento && (
                      <div className="text-[10px] text-indigo-500 font-bold mt-0.5">
                        🎂 {new Date(c.dataNascimento).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-3 print:px-2 text-slate-500">{c.nuit}</td>
                  <td className="px-6 py-3 print:px-2 font-bold text-slate-700">{c.empresa}</td>
                  <td className="px-6 py-3 print:px-2 text-slate-600">{c.departamento}</td>
                  <td className="px-6 py-3 print:px-2 text-slate-600">{c.cargo}</td>
                  <td className="px-6 py-3 print:px-2">
                    <span className={`px-1.5 py-0.5 rounded font-bold inline-block
                      ${c.estado === 'Activo' ? 'bg-emerald-50 text-emerald-600' : ''}
                      ${c.estado === 'Inactivo' ? 'bg-slate-100 text-slate-600' : ''}
                      ${c.estado === 'Despedido' ? 'bg-rose-50 text-rose-600' : ''}
                      ${c.estado === 'Suspenso' ? 'bg-amber-50 text-amber-600' : ''}
                    `}>
                      {c.estado}
                    </span>
                  </td>
                  {tipoRelatorio === 'Recibos de Vencimento' && (
                    <td className="px-6 py-3 text-right print:hidden">
                      <button 
                        onClick={() => exportPaySlip(c)}
                        className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Gerar Recibo
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={tipoRelatorio === 'Recibos de Vencimento' ? 7 : 6} className="px-6 py-8 text-center font-medium text-slate-400 text-sm">
                    Nenhum colaborador encontrado para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

