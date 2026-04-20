import React from 'react';
import { Search, Plus, FileSpreadsheet, MessageCircle, Filter } from 'lucide-react';
import PremiumSelect from '../ui/PremiumSelect';
import Tooltip from '../ui/Tooltip';

interface StudentFiltersProps {
    searchTerm: string;
    setSearchTerm: (val: string) => void;
    statusFilter: string;
    setStatusFilter: (val: string) => void;
    serviceFilter: string;
    setServiceFilter: (val: string) => void;
    services: string[];
    onNewStudent: () => void;
    onExport: () => void;
    onWhatsAppMass: () => void;
    selectedCount: number;
}

const StudentFilters: React.FC<StudentFiltersProps> = ({
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    serviceFilter,
    setServiceFilter,
    services,
    onNewStudent,
    onExport,
    onWhatsAppMass,
    selectedCount
}) => {
    const statusOptions = [
        { value: 'all', label: 'Todos los estados' },
        { value: 'paid', label: 'Pagos' },
        { value: 'pending', label: 'Pendientes' }
    ];

    const serviceOptions = [
        { value: 'all', label: 'Todos los servicios' },
        ...services.map(s => ({ value: s, label: s }))
    ];

    return (
        <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="relative w-full md:w-full md:max-w-2xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input 
                        type="text"
                        placeholder="Buscar por nombre, teléfono o servicio..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-surface dark:bg-[#111113] border border-border-main rounded-2xl outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 shadow-sm transition-all text-sm font-bold text-text-main placeholder:text-text-muted/50"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Tooltip content="Crear una nueva ficha de alumno">
                        <button 
                            onClick={onNewStudent}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-black rounded-2xl text-sm font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/20"
                        >
                            <Plus size={18} />
                            <span>Nuevo</span>
                        </button>
                    </Tooltip>
                    
                    <div className="flex items-center gap-2">
                        <Tooltip content="Descargar lista de alumnos a Excel">
                            <button 
                                onClick={onExport}
                                className="p-3 bg-surface dark:bg-bg-soft border border-border-main rounded-2xl text-text-muted hover:text-emerald-500 hover:border-emerald-500/30 transition-all"
                            >
                                <FileSpreadsheet size={18} />
                            </button>
                        </Tooltip>
                        <Tooltip content="Enviar mensajes a los alumnos seleccionados">
                            <button 
                                onClick={onWhatsAppMass}
                                className={`p-3 rounded-2xl transition-all ${selectedCount > 0 ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'bg-surface dark:bg-bg-soft border border-border-main text-text-muted hover:text-emerald-500 hover:border-emerald-500/30'}`}
                            >
                                <MessageCircle size={18} />
                            </button>
                        </Tooltip>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <PremiumSelect 
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={statusOptions}
                    icon={<Filter size={14} className="text-text-muted" />}
                />

                <PremiumSelect 
                    value={serviceFilter}
                    onChange={setServiceFilter}
                    options={serviceOptions}
                />

                {selectedCount > 0 && (
                    <div className="ml-auto px-4 py-1.5 bg-primary-main/10 text-primary-main rounded-xl text-[10px] font-black uppercase tracking-widest border border-primary-main/20 animate-in fade-in slide-in-from-right-4">
                        {selectedCount} seleccionados
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentFilters;
