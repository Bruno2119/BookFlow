import { useState, useEffect } from 'react';
import api from '../lib/api';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, 
  Trash2, 
  Clock, 
  Euro, 
  Scissors,
  Search,
  X
} from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';

interface Service {
  id: number;
  nome: string;
  preco: number;
  duracaoMinutos: number;
  descricao: string;
}

export default function ManageServicesPage() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<number | null>(null);

  const [newService, setNewService] = useState({
    nome: '',
    preco: 0,
    duracaoMinutos: 30,
    descricao: '',
    negocioId: user?.negocioId
  });

  useEffect(() => {
    if (user?.negocioId) fetchServices();
  }, [user]);

  const fetchServices = async () => {
    try {
      // In a real app, we'd have /api/services/business/{id}
      // For now, let's fetch the business details which includes services
      const response = await api.get(`/businesses/${user?.negocioId}`);
      setServices(response.data.servicos || []);
    } catch (error) {
      toast.error('Erro ao carregar serviços.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/services', { ...newService, negocioId: user?.negocioId });
      toast.success('Serviço adicionado!');
      setIsAddModalOpen(false);
      setNewService({ nome: '', preco: 0, duracaoMinutos: 30, descricao: '', negocioId: user?.negocioId });
      fetchServices();
    } catch (error) {
      toast.error('Erro ao adicionar serviço.');
    }
  };

  const handleDeleteService = async () => {
    if (!serviceToDelete) return;
    try {
      await api.delete(`/services/${serviceToDelete}`);
      toast.success('Serviço removido.');
      setServiceToDelete(null);
      fetchServices();
    } catch (error) {
      toast.error('Erro ao remover serviço.');
    }
  };

  if (loading) return <div className="p-12 text-center animate-pulse">Carregando serviços...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Gestão de Serviços</h1>
          <p className="text-muted-foreground mt-1">Configure os serviços oferecidos pelo seu estabelecimento.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
        >
          <Plus className="h-5 w-5" /> Novo Serviço
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-card rounded-3xl border border-dashed border-border">
            <Scissors className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">Nenhum serviço registado ainda.</p>
          </div>
        ) : (
          services.map(service => (
            <div key={service.id} className="bg-card p-6 rounded-3xl border border-border shadow-card hover:shadow-elevated transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                  <Scissors className="h-6 w-6" />
                </div>
                <button 
                  onClick={() => setServiceToDelete(service.id)}
                  className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              <h3 className="text-xl font-display font-bold text-foreground mb-2">{service.nome}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-6 h-10">{service.descricao || 'Sem descrição.'}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-sm font-bold text-primary">
                  <Euro className="h-4 w-4" />
                  {service.preco.toFixed(2)}€
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {service.duracaoMinutos} min
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL ADICIONAR */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card w-full max-w-md rounded-3xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 bg-primary text-primary-foreground flex justify-between items-center">
              <h3 className="text-2xl font-display font-bold">Novo Serviço</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleAddService} className="p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Nome do Serviço</label>
                <input required value={newService.nome} onChange={e => setNewService({...newService, nome: e.target.value})} className="w-full bg-muted/50 border-none rounded-xl p-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="ex: Corte de Cabelo" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Preço (€)</label>
                  <input required type="number" step="0.01" value={newService.preco} onChange={e => setNewService({...newService, preco: parseFloat(e.target.value)})} className="w-full bg-muted/50 border-none rounded-xl p-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Duração (min)</label>
                  <input required type="number" value={newService.duracaoMinutos} onChange={e => setNewService({...newService, duracaoMinutos: parseInt(e.target.value)})} className="w-full bg-muted/50 border-none rounded-xl p-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Descrição</label>
                <textarea rows={3} value={newService.descricao} onChange={e => setNewService({...newService, descricao: e.target.value})} className="w-full bg-muted/50 border-none rounded-xl p-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none" />
              </div>

              <button type="submit" className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98] mt-4">
                Salvar Serviço
              </button>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog 
        isOpen={!!serviceToDelete}
        title="Remover Serviço"
        message="Deseja mesmo remover este serviço? Esta ação impedirá novas marcações para este serviço."
        onConfirm={handleDeleteService}
        onCancel={() => setServiceToDelete(null)}
      />
    </div>
  );
}
