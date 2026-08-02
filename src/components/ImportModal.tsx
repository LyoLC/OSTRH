import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { X, Upload, Check, AlertCircle } from 'lucide-react';
import { Colaborador, Empresa, Departamento, EstadoColaborador } from '../types';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (newEmployees: Colaborador[]) => void;
}

const COLABORADOR_FIELDS = [
  { key: 'nome', label: 'Nome (Obrigatório)', required: true },
  { key: 'apelido', label: 'Apelido (Obrigatório)', required: true },
  { key: 'nuit', label: 'NUIT (Obrigatório)', required: true },
  { key: 'email', label: 'Email (Obrigatório)', required: true },
  { key: 'nacionalidade', label: 'Nacionalidade' },
  { key: 'empresa', label: 'Empresa' },
  { key: 'departamento', label: 'Departamento' },
  { key: 'cargo', label: 'Cargo' },
  { key: 'supervisor', label: 'Supervisor' },
  { key: 'dataAdmissao', label: 'Data de Admissão' },
  { key: 'dataFimContrato', label: 'Fim do Contrato' },
  { key: 'estado', label: 'Estado' },
  { key: 'contacto', label: 'Contacto' },
  { key: 'dataNascimento', label: 'Data de Nascimento' },
  { key: 'salario', label: 'Salário' }
];

export function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0 && results.errors[0].type !== 'Delimiter') {
          setError('Erro ao processar o ficheiro CSV.');
          return;
        }
        
        if (results.meta.fields) {
          setCsvHeaders(results.meta.fields);
          setCsvData(results.data);
          
          // Auto-map based on similar names
          const initialMapping: Record<string, string> = {};
          COLABORADOR_FIELDS.forEach(field => {
            const match = results.meta.fields?.find(
              h => h.toLowerCase().trim() === field.key.toLowerCase() || 
                   h.toLowerCase().trim().includes(field.key.toLowerCase()) ||
                   field.label.toLowerCase().includes(h.toLowerCase().trim())
            );
            if (match) {
              initialMapping[field.key] = match;
            }
          });
          setMapping(initialMapping);
        } else {
          setError('Nenhum cabeçalho encontrado no ficheiro.');
        }
      },
      error: () => {
        setError('Erro ao ler o ficheiro.');
      }
    });
  };

  const handleMappingChange = (colaboradorField: string, csvHeader: string) => {
    setMapping(prev => ({
      ...prev,
      [colaboradorField]: csvHeader
    }));
  };

  const handleImport = () => {
    // Validate required fields
    const requiredKeys = COLABORADOR_FIELDS.filter(f => f.required).map(f => f.key);
    const missingRequired = requiredKeys.filter(k => !mapping[k]);
    
    if (missingRequired.length > 0) {
      setError(`Por favor mapeie os seguintes campos obrigatórios: ${missingRequired.join(', ')}`);
      return;
    }

    const newEmployees: Colaborador[] = csvData.map((row) => {
      // Helper to safely get mapped value
      const getMappedVal = (key: string) => {
        const header = mapping[key];
        return header ? row[header] : undefined;
      };

      return {
        id: crypto.randomUUID(),
        nome: getMappedVal('nome') || '',
        apelido: getMappedVal('apelido') || '',
        nuit: getMappedVal('nuit') || '',
        email: getMappedVal('email') || '',
        nacionalidade: getMappedVal('nacionalidade') || 'Moçambicana',
        empresa: (getMappedVal('empresa') as Empresa) || 'NUKE',
        departamento: (getMappedVal('departamento') as Departamento) || 'Operação',
        cargo: getMappedVal('cargo') || 'Colaborador',
        supervisor: getMappedVal('supervisor') || '',
        dataAdmissao: getMappedVal('dataAdmissao') || new Date().toISOString().split('T')[0],
        dataFimContrato: getMappedVal('dataFimContrato'),
        estado: (getMappedVal('estado') as EstadoColaborador) || 'Activo',
        contacto: getMappedVal('contacto') || '',
        dataNascimento: getMappedVal('dataNascimento'),
        salario: getMappedVal('salario') ? Number(getMappedVal('salario')) : undefined
      };
    });

    onImport(newEmployees);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setFile(null);
    setCsvHeaders([]);
    setCsvData([]);
    setMapping({});
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Importar Colaboradores</h2>
          <button 
            onClick={() => { handleReset(); onClose(); }}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-grow">
          {!file ? (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-12 bg-slate-50">
              <Upload className="w-12 h-12 text-slate-400 mb-4" />
              <p className="text-slate-600 mb-2 font-medium">Selecione um ficheiro CSV</p>
              <p className="text-slate-400 text-sm mb-6">O ficheiro deve conter cabeçalhos na primeira linha.</p>
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileUpload} 
                className="hidden" 
                ref={fileInputRef}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors"
              >
                Procurar Ficheiro
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-emerald-50 text-emerald-700 p-4 rounded-lg border border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 p-2 rounded-md">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Ficheiro Carregado</p>
                    <p className="text-xs opacity-80">{file.name} ({csvData.length} registos)</p>
                  </div>
                </div>
                <button 
                  onClick={handleReset}
                  className="text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-md transition-colors uppercase tracking-wider"
                >
                  Trocar
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-600 rounded-lg text-sm font-medium">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div>
                <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Mapeamento de Colunas</h3>
                <p className="text-xs text-slate-500 mb-4">Associe as colunas do seu ficheiro aos campos do sistema.</p>
                
                <div className="space-y-3">
                  {COLABORADOR_FIELDS.map(field => (
                    <div key={field.key} className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div className="w-1/2 flex items-center gap-1">
                        <span className={`text-sm font-semibold ${field.required ? 'text-indigo-900' : 'text-slate-700'}`}>
                          {field.label}
                        </span>
                        {field.required && <span className="text-rose-500">*</span>}
                      </div>
                      <div className="w-1/2">
                        <select 
                          value={mapping[field.key] || ''}
                          onChange={(e) => handleMappingChange(field.key, e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        >
                          <option value="">-- Ignorar este campo --</option>
                          {csvHeaders.map(header => (
                            <option key={header} value={header}>{header}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {file && (
          <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
            <button 
              onClick={() => { handleReset(); onClose(); }}
              className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={handleImport}
              className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition-colors"
            >
              Importar {csvData.length} Registos
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
