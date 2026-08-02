import React from 'react';
import { 
  LayoutDashboard, Users, UserPlus, Briefcase, Clock, CalendarClock, 
  Banknote, CalendarDays, CalendarOff, LineChart, GraduationCap, 
  Award, Heart, FileText, AlertTriangle, Stethoscope, ShieldAlert, 
  Workflow, PieChart, BarChart3, BrainCircuit, Settings, Shield
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

const mainItems: SidebarItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'colaboradores', label: 'Colaboradores', icon: Users },
  { id: 'recrutamento', label: 'Recrutamento', icon: UserPlus },
  { id: 'onboarding', label: 'Onboarding', icon: Briefcase },
  { id: 'assiduidade', label: 'Assiduidade', icon: Clock },
  { id: 'escalas', label: 'Escalas', icon: CalendarClock },
  { id: 'folha_salarial', label: 'Folha Salarial', icon: Banknote },
  { id: 'ferias', label: 'Férias', icon: CalendarDays },
  { id: 'licencas', label: 'Licenças', icon: CalendarOff },
  { id: 'avaliacoes', label: 'Avaliações', icon: LineChart },
  { id: 'treinamentos', label: 'Treinamentos', icon: GraduationCap },
  { id: 'competencias', label: 'Competências', icon: Award },
  { id: 'beneficios', label: 'Benefícios', icon: Heart },
  { id: 'documentos', label: 'Documentos', icon: FileText },
  { id: 'disciplinar', label: 'Proc. Disciplinares', icon: AlertTriangle },
  { id: 'saude', label: 'Saúde Ocupacional', icon: Stethoscope },
  { id: 'seguranca', label: 'Segurança', icon: ShieldAlert },
  { id: 'workflows', label: 'Workflows', icon: Workflow },
];

const analyticItems: SidebarItem[] = [
  { id: 'relatorios', label: 'Relatórios', icon: PieChart },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'ia', label: 'Centro de IA', icon: BrainCircuit },
];

const adminItems: SidebarItem[] = [
  { id: 'configuracoes', label: 'Configurações', icon: Settings },
  { id: 'administracao', label: 'Administração', icon: Shield },
];

interface LayoutProps {
  children: React.ReactNode;
  currentTab: string;
  onTabChange: (tabId: string) => void;
}

export function Layout({ children, currentTab, onTabChange }: LayoutProps) {
  const NavItem = ({ item }: { item: SidebarItem }) => {
    const isActive = currentTab === item.id;
    return (
      <button
        onClick={() => onTabChange(item.id)}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
          isActive 
            ? 'bg-indigo-50 text-indigo-700 font-semibold' 
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`}
      >
        <item.icon className={`w-4 h-4 ${isActive ? 'text-indigo-700' : 'text-slate-400'}`} />
        <span className="truncate">{item.label}</span>
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 transition-all duration-300">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">OST RH</h1>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Enterprise HCM</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          <div>
            <h2 className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Core HR</h2>
            <div className="space-y-0.5">
              {mainItems.map(item => <NavItem key={item.id} item={item} />)}
            </div>
          </div>

          <div>
            <h2 className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Insights & IA</h2>
            <div className="space-y-0.5">
              {analyticItems.map(item => <NavItem key={item.id} item={item} />)}
            </div>
          </div>

          <div>
            <h2 className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sistema</h2>
            <div className="space-y-0.5">
              {adminItems.map(item => <NavItem key={item.id} item={item} />)}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen min-w-0 bg-slate-50/50">
        {children}
      </main>
    </div>
  );
}
