import React, { useState, useEffect, useRef } from 'react';
import { Colaborador, Empresa, Departamento, EstadoColaborador, Sexo } from '../types';
import { X, Save, AlertCircle, Camera, Upload, User, Check } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface EmployeeModalProps {
  colaborador: Colaborador | null;
  onClose: () => void;
  onSave: (c: Colaborador) => void;
}

const EMPRESAS: Empresa[] = ['NUKE', 'PCS', 'ZMAX', 'MICC'];
const DEPARTAMENTOS: Departamento[] = ['Oficina', 'Operação', 'Administração', 'Warehouse', 'Safety'];
const ESTADOS: EstadoColaborador[] = ['Activo', 'Inactivo', 'Despedido', 'Suspenso'];
const SEXOS: Sexo[] = ['Masculino', 'Feminino'];

export function EmployeeModal({ colaborador, onClose, onSave }: EmployeeModalProps) {
  const [formData, setFormData] = useState<Colaborador>({
    id: uuidv4(),
    nome: '',
    apelido: '',
    sexo: 'Masculino',
    dataNascimento: '',
    empresa: 'NUKE',
    departamento: 'Operação',
    cargo: '',
    supervisor: '',
    dataAdmissao: new Date().toISOString().split('T')[0],
    estado: 'Activo',
    contacto: '',
    email: '',
    salario: 0,
    nuit: '',
    observacoes: '',
    foto: '',
    bi: '',
    niss: '',
    passaporte: '',
    estadoCivil: '',
    dependentes: 0,
    endereco: '',
    localizacao: '',
    banco: '',
    iban: '',
    conta: '',
    filial: '',
    centroCusto: '',
    tipoContrato: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'pessoal' | 'profissional' | 'financeiro'>('pessoal');
  
  // Camera State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (colaborador) {
      setFormData(colaborador);
    }
  }, [colaborador]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error("Erro ao aceder à câmara:", err);
      alert("Não foi possível aceder à câmara. Verifique as permissões.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setFormData(prev => ({ ...prev, foto: dataUrl }));
        stopCamera();
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'salario' ? Number(value) : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) newErrors.nome = 'O nome é obrigatório';
    if (!formData.apelido.trim()) newErrors.apelido = 'O apelido é obrigatório';
    if (!formData.dataNascimento) newErrors.dataNascimento = 'A data de nascimento é obrigatória';
    if (!formData.cargo.trim()) newErrors.cargo = 'O cargo é obrigatório';
    if (!formData.dataAdmissao) newErrors.dataAdmissao = 'A data de admissão é obrigatória';
    
    if (!formData.email.trim()) {
      newErrors.email = 'O email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Insira um endereço de email válido';
    }

    if (!formData.nuit.trim()) {
      newErrors.nuit = 'O NUIT é obrigatório';
    } else if (!/^\d{9}$/.test(formData.nuit.trim())) {
      newErrors.nuit = 'O NUIT deve conter exactamente 9 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const renderInput = (
    label: string, 
    name: keyof Colaborador, 
    type: string = 'text', 
    required: boolean = false
  ) => {
    const isError = !!errors[name];
    return (
      <div className="flex flex-col">
        <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
          {label} {required && '*'}
        </label>
        <input 
          type={type} 
          name={name} 
          value={(formData[name] as string | number) || ''} 
          onChange={handleChange} 
          className={`w-full px-3 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-colors ${
            isError ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
          }`} 
        />
        {isError && (
          <div className="flex items-center gap-1 mt-1 text-red-500">
            <AlertCircle className="w-3 h-3" />
            <span className="text-[10px] font-medium">{errors[name]}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            {colaborador ? 'Editar Colaborador' : 'Novo Colaborador'}
          </h3>
          <button onClick={() => { stopCamera(); onClose(); }} className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 bg-white">
          <form id="employee-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6" noValidate>
            
            {/* Foto e Info Pessoal */}
            <div className="md:col-span-2">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Fotografia do Colaborador</h4>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="shrink-0 relative">
                  <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-slate-200 overflow-hidden flex items-center justify-center relative shadow-sm">
                    {formData.foto ? (
                      <img src={formData.foto} alt="Colaborador" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-slate-300" />
                    )}
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col gap-3">
                  {!isCameraActive ? (
                    <div className="flex gap-2">
                      <button 
                        type="button" 
                        onClick={startCamera}
                        className="text-xs font-bold px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-2 border border-indigo-200 shadow-sm"
                      >
                        <Camera className="w-4 h-4" />
                        Usar Câmara
                      </button>
                      {formData.foto && (
                        <button 
                          type="button" 
                          onClick={() => setFormData(prev => ({ ...prev, foto: '' }))}
                          className="text-xs font-bold px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200 shadow-sm"
                        >
                          Remover Foto
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="bg-slate-900 rounded-xl p-2 relative w-full max-w-[300px]">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        className="w-full rounded-lg bg-black mirror"
                        style={{ transform: 'scaleX(-1)' }}
                      ></video>
                      <div className="mt-2 flex justify-center gap-2">
                        <button 
                          type="button" 
                          onClick={capturePhoto}
                          className="flex-1 text-xs font-bold px-3 py-1.5 bg-emerald-500 text-white hover:bg-emerald-600 rounded-md transition-colors flex items-center justify-center gap-1 shadow-sm"
                        >
                          <Check className="w-3 h-3" />
                          Capturar
                        </button>
                        <button 
                          type="button" 
                          onClick={stopCamera}
                          className="text-xs font-bold px-3 py-1.5 bg-slate-700 text-white hover:bg-slate-600 rounded-md transition-colors flex items-center gap-1 shadow-sm"
                        >
                          <X className="w-3 h-3" />
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              </div>
            </div>

            {/* Informação Pessoal */}
            <div className="md:col-span-2 mt-2">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">Informação Pessoal</h4>
            </div>
            
            {renderInput('Nome', 'nome', 'text', true)}
            {renderInput('Apelido', 'apelido', 'text', true)}
            
            <div className="flex flex-col">
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Sexo</label>
              <select name="sexo" value={formData.sexo} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm">
                {SEXOS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            
            {renderInput('Data de Nascimento', 'dataNascimento', 'date', true)}

            {/* Informação Profissional */}
            <div className="md:col-span-2 mt-2">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">Informação Profissional</h4>
            </div>

            <div className="flex flex-col">
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Empresa</label>
              <select name="empresa" value={formData.empresa} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm">
                {EMPRESAS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            
            <div className="flex flex-col">
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Departamento</label>
              <select name="departamento" value={formData.departamento} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm">
                {DEPARTAMENTOS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            
            {renderInput('Cargo', 'cargo', 'text', true)}
            {renderInput('Supervisor', 'supervisor')}
            {renderInput('Data de Admissão', 'dataAdmissao', 'date', true)}
            {renderInput('Fim do Contrato', 'dataFimContrato', 'date')}
            
            <div className="flex flex-col">
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Estado</label>
              <select name="estado" value={formData.estado} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm">
                {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {(formData.estado === 'Despedido' || formData.estado === 'Inactivo') && (
              renderInput('Data de Saída/Demissão', 'dataDemissao', 'date')
            )}
            
            {renderInput('Salário', 'salario', 'number')}
            {renderInput('NUIT', 'nuit', 'text', true)}

            {/* Contactos & Obs */}
            <div className="md:col-span-2 mt-2">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">Contactos e Observações</h4>
            </div>
            
            {renderInput('Email', 'email', 'email', true)}
            {renderInput('Contacto', 'contacto', 'text')}
            
            <div className="md:col-span-2 flex flex-col">
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Observações</label>
              <textarea name="observacoes" value={formData.observacoes} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"></textarea>
            </div>

          </form>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button type="button" onClick={() => { stopCamera(); onClose(); }} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            Cancelar
          </button>
          <button type="submit" form="employee-form" className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2">
            <Save className="w-4 h-4" />
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

