import React from 'react';
import { Search, Filter, Plus, FileSpreadsheet, MessageCircle } from 'lucide-react';

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
    return (
        <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="relative w-full md:w-full md:max-w-2xl">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input 
                        type="text"
                        placeholder="Buscar por nombre, teléfono o servicio..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-surface dark:bg-bg-soft border border-border-main rounded-2xl pl-10 pr-4 py-3 text-sm font-bold text-text-main focus:outline-none focus:ring-2 focus:ring-primary-main/20 transition-all placeholder:text-text-muted/50"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <button 
                        onClick={onNewStudent}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-primary-main text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary-main/20"
                    >
                        <Plus size={18} />
                        <span>Nuevo</span>
                    </button>
                    
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={onExport}
                            className="p-3 bg-surface dark:bg-bg-soft border border-border-main rounded-2xl text-text-muted hover:text-primary-main transition-all"
                            title="Exportar Excel"
                        >
                            <FileSpreadsheet size={18} />
                        </button>
                        <button 
                            onClick={onWhatsAppMass}
                            className={`p-3 rounded-2xl transition-all ${selectedCount > 0 ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-surface dark:bg-bg-soft border border-border-main text-text-muted'}`}
                            title="WhatsApp Masivo"
                        >
                            <MessageCircle size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-surface dark:bg-bg-soft border border-border-main rounded-xl">
                    <Filter size={14} className="text-text-muted" />
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-transparent text-[11px] font-black uppercase tracking-widest text-text-main outline-none cursor-pointer"
                    >
                        <option value="all">Todos los estados</option>
                        <option value="paid">Pagos</option>
                        <option value="pending">Pendientes</option>
                    </select>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 bg-surface dark:bg-bg-soft border border-border-main rounded-xl">
                    <select 
                        value={serviceFilter}
                        onChange={(e) => setServiceFilter(e.target.value)}
                        className="bg-transparent text-[11px] font-black uppercase tracking-widest text-text-main outline-none cursor-pointer"
                    >
                        <option value="all">Todos los servicios</option>
                        {services.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

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
