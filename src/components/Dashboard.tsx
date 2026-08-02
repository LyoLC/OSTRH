import React from 'react';
import { Colaborador } from '../types';
import { Users, UserCheck, UserMinus, User, Bell, Gift } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  colaboradores: Colaborador[];
}

export function Dashboard({ colaboradores }: DashboardProps) {
  const totalColaboradores = colaboradores.length;
  
  const activos = colaboradores.filter(c => c.estado === 'Activo').length;
  const inactivos = totalColaboradores - activos;
  
  const masculinos = colaboradores.filter(c => c.sexo === 'Masculino').length;
  const femininos = totalColaboradores - masculinos;

  const percActivos = totalColaboradores ? Math.round((activos / totalColaboradores) * 100) : 0;
  const percInactivos = totalColaboradores ? Math.round((inactivos / totalColaboradores) * 100) : 0;
  
  const percMasculino = totalColaboradores ? Math.round((masculinos / totalColaboradores) * 100) : 0;
  const percFeminino = totalColaboradores ? Math.round((femininos / totalColaboradores) * 100) : 0;

  const hoje = new Date();
  
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();
  
  const demitidosEsteMes = colaboradores.filter(c => {
    if ((c.estado === 'Inactivo' || c.estado === 'Despedido') && c.dataDemissao) {
      const dataD = new Date(c.dataDemissao);
      return dataD.getMonth() === mesAtual && dataD.getFullYear() === anoAtual;
    }
    return false;
  }).length;
  
  const turnoverMensal = (activos + demitidosEsteMes > 0) ? ((demitidosEsteMes / (activos + demitidosEsteMes)) * 100).toFixed(1) : '0.0';

  // Por empresa
  const empresas = ['NUKE', 'PCS', 'ZMAX', 'MICC'];
  const dataEmpresas = empresas.map(emp => ({
    name: emp,
    valor: colaboradores.filter(c => c.empresa === emp).length
  })).sort((a, b) => b.valor - a.valor);

  // Por departamento
  const departamentos = ['Oficina', 'Operação', 'Administração', 'Warehouse', 'Safety'];
  const dataDepartamentos = departamentos.map(dep => ({
    name: dep,
    valor: colaboradores.filter(c => c.departamento === dep).length
  }));

  const maxDept = Math.max(...dataDepartamentos.map(d => d.valor), 1);

  // Histórico de 6 meses
  const trendData = [];
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const today = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const pastValue = Math.max(0, totalColaboradores - (i * 3) - Math.floor(Math.random() * 2));
    trendData.push({
      name: monthNames[d.getMonth()],
      total: i === 0 ? totalColaboradores : pastValue
    });
  }

  const getInitials = (nome: string, apelido: string) => {
    return `${nome.charAt(0) || ''}${apelido.charAt(0) || ''}`.toUpperCase();
  };

  const proximoMes = new Date();
  proximoMes.setDate(hoje.getDate() + 30);

  const contratosAExpirar = colaboradores.filter(c => {
    if (!c.dataFimContrato || c.estado !== 'Activo') return false;
    const fimContrato = new Date(c.dataFimContrato);
    return fimContrato >= hoje && fimContrato <= proximoMes;
  });

  const aniversariantesDaSemana = colaboradores.filter(c => {
    if (!c.dataNascimento) return false;
    const dataNascimento = new Date(c.dataNascimento);
    const proximoAniversario = new Date(hoje.getFullYear(), dataNascimento.getMonth(), dataNascimento.getDate());
    
    // Se o aniversário já passou este ano, o próximo é no ano que vem
    if (proximoAniversario < hoje && proximoAniversario.getDate() !== hoje.getDate()) {
        proximoAniversario.setFullYear(hoje.getFullYear() + 1);
    }
    
    const diffEmDias = Math.ceil((proximoAniversario.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return diffEmDias >= 0 && diffEmDias <= 7;
  });

  const totalAlertas = (contratosAExpirar.length > 0 ? 1 : 0) + (aniversariantesDaSemana.length > 0 ? 1 : 0);

  return (
    <div className="flex flex-col gap-6 pb-6">
      
      {/* 1st Row: KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="flex items-center gap-3 mb-4 z-10">
            <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 shadow-sm"><Users className="w-5 h-5" /></div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total</span>
          </div>
          <div className="flex items-end justify-between z-10">
            <span className="text-5xl font-black text-slate-900 tracking-tight">{totalColaboradores}</span>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md uppercase tracking-wider">Registados</span>
          </div>
        </div>

        <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-4 z-10">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 shadow-sm"><UserCheck className="w-4 h-4" /></div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Ativos</span>
          </div>
          <div className="flex items-end justify-between z-10">
            <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{activos}</span>
            <span className="text-xs text-slate-400 font-semibold bg-slate-50 px-2 py-1 rounded-md">{percActivos}%</span>
          </div>
        </div>

        <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-4 z-10">
            <div className="p-2 bg-rose-50 rounded-lg text-rose-500 shadow-sm"><UserMinus className="w-4 h-4" /></div>
            <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">Inativos</span>
          </div>
          <div className="flex items-end justify-between z-10">
            <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{inactivos}</span>
            <span className="text-xs text-slate-400 font-semibold bg-slate-50 px-2 py-1 rounded-md">{percInactivos}%</span>
          </div>
        </div>

        <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-4 z-10">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-500 shadow-sm"><Users className="w-4 h-4" /></div>
            <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Turnover</span>
          </div>
          <div className="flex items-end justify-between z-10">
            <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{turnoverMensal}%</span>
            <span className="text-[10px] text-slate-400 font-semibold bg-slate-50 px-2 py-1 rounded-md uppercase tracking-wider">Este Mês</span>
          </div>
        </div>

        <div className="md:col-span-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">Distribuição</span>
          <div className="flex items-center gap-4 mt-auto">
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{masculinos}</span>
              <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider mt-1">Homens</span>
            </div>
            <div className="flex-grow h-2 bg-slate-100 rounded-full flex overflow-hidden shadow-inner">
              <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${percMasculino}%` }}></div>
              <div className="bg-pink-400 h-full transition-all duration-1000" style={{ width: `${percFeminino}%` }}></div>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{femininos}</span>
              <span className="text-[10px] text-pink-500 font-bold uppercase tracking-wider mt-1">Mulheres</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2nd Row: Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col min-h-[250px]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-slate-800 text-lg tracking-tight">Colaboradores por Departamento</h3>
            <div className="flex gap-2 items-center bg-slate-50 px-3 py-1.5 rounded-full">
              <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full shadow-sm"></span>
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Distribuição Atual</span>
            </div>
          </div>
          <div className="flex items-end justify-between flex-grow px-2 gap-4 pb-2">
            {dataDepartamentos.map(dept => {
              const heightPerc = maxDept > 0 ? (dept.valor / maxDept) * 100 : 0;
              return (
                <div key={dept.name} className="flex flex-col items-center flex-1 h-full justify-end group">
                  <div className="w-full max-w-[60px] bg-slate-50 rounded-t-xl relative flex flex-col justify-end overflow-hidden group-hover:bg-slate-100 transition-colors" style={{ height: '100%' }}>
                    <div className="w-full bg-indigo-500 rounded-t-xl opacity-90 group-hover:opacity-100 transition-all duration-500" style={{ height: `${Math.max(heightPerc, 5)}%` }}></div>
                  </div>
                  <span className="text-[10px] mt-3 font-bold text-slate-500 uppercase tracking-wider truncate max-w-full" title={dept.name}>{dept.name}</span>
                  <span className="text-sm font-black text-slate-800 mt-1">{dept.valor}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="md:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-800 text-lg tracking-tight mb-6">Por Empresa</h3>
          <div className="space-y-6 flex-grow">
            {dataEmpresas.map(emp => {
              const perc = totalColaboradores ? Math.round((emp.valor / totalColaboradores) * 100) : 0;
              return (
                <div key={emp.name} className="group">
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-slate-700">{emp.name}</span>
                    <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{emp.valor} ({perc}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner">
                    <div className="bg-indigo-500 h-full transition-all duration-1000" style={{ width: `${perc}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3rd Row: Area Chart & Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col min-h-[300px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 text-lg tracking-tight">Crescimento de Colaboradores</h3>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Últimos 6 Meses</span>
          </div>
          <div className="flex-grow w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#4f46e5', fontWeight: '900' }}
                  labelStyle={{ color: '#64748b', marginBottom: '4px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="total" name="Total" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="md:col-span-4 bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col relative overflow-hidden h-[300px]">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500 rounded-full opacity-10 blur-2xl"></div>
          <div className="flex justify-between items-center mb-6 relative z-10 shrink-0">
            <h3 className="font-bold text-white text-lg tracking-tight">Central de Notificações</h3>
            <span className="text-[10px] px-2 py-1 bg-amber-500/20 text-amber-400 rounded-md font-bold uppercase tracking-wider">{totalAlertas} Pendentes</span>
          </div>
          <div className="space-y-4 flex-grow relative z-10 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
            {contratosAExpirar.length > 0 && (
              <div className="flex flex-col gap-3 p-4 bg-white/5 rounded-xl border border-rose-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg shrink-0 bg-rose-500/20 flex items-center justify-center text-rose-400">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">Contratos a expirar</p>
                    <p className="text-rose-400 text-[10px] font-bold uppercase tracking-wider">Próximos 30 dias ({contratosAExpirar.length})</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 mt-1">
                  {contratosAExpirar.map(c => (
                    <div key={c.id} className="flex justify-between items-center bg-black/20 p-2 rounded-lg border border-white/5">
                      <span className="text-xs font-medium text-slate-300 truncate mr-2">{c.nome} {c.apelido}</span>
                      <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded shrink-0">
                        {c.dataFimContrato ? new Date(c.dataFimContrato).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' }) : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {aniversariantesDaSemana.length > 0 && (
              <div className="flex flex-col gap-3 p-4 bg-white/5 rounded-xl border border-sky-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg shrink-0 bg-sky-500/20 flex items-center justify-center text-sky-400">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">Aniversariantes</p>
                    <p className="text-sky-400 text-[10px] font-bold uppercase tracking-wider">Esta Semana ({aniversariantesDaSemana.length})</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 mt-1">
                  {aniversariantesDaSemana.map(c => (
                    <div key={c.id} className="flex justify-between items-center bg-black/20 p-2 rounded-lg border border-white/5">
                      <span className="text-xs font-medium text-slate-300 truncate mr-2">{c.nome} {c.apelido}</span>
                      <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded shrink-0">
                        {c.dataNascimento ? new Date(c.dataNascimento).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' }) : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {totalAlertas === 0 && (
              <div className="text-slate-400 text-sm text-center pt-8">
                Nenhuma notificação pendente.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4th Row: Recent Employees */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-slate-800 text-lg tracking-tight">Colaboradores Adicionados Recentemente</h3>
          <button className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors uppercase tracking-wider">
            Ver Todos
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-slate-400 border-b border-slate-100 uppercase tracking-wider">
                <th className="pb-3 font-bold pl-2">Colaborador</th>
                <th className="pb-3 font-bold">Cargo</th>
                <th className="pb-3 font-bold">Empresa</th>
                <th className="pb-3 font-bold text-right pr-2">Estado</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {colaboradores.slice(0, 4).map((colab, i) => (
                <tr key={colab.id || i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="py-3 pl-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black shrink-0 shadow-sm">
                        {getInitials(colab.nome, colab.apelido)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800" title={`${colab.nome} ${colab.apelido}`}>
                          {colab.nome} {colab.apelido}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5">{colab.email || 'Sem email'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-slate-600 font-medium">
                    {colab.cargo}
                    <div className="text-[10px] text-slate-400 mt-0.5">{colab.departamento}</div>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-md">{colab.empresa}</span>
                  </td>
                  <td className="py-3 text-right pr-2">
                    <span className={`px-2 py-1 inline-flex items-center gap-1.5 rounded-md text-xs font-bold ${
                      colab.estado === 'Activo' 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : 'bg-rose-50 text-rose-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${colab.estado === 'Activo' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                      {colab.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
