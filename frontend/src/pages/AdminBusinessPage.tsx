import { useState, useEffect } from 'react';
import api from '../lib/api';
import { toast } from 'sonner';
import { 
  Plus, 
  Trash2, 
  Store, 
  MapPin, 
  Phone, 
  Globe, 
  Search,
  Building2,
  X
} from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';

interface Business {
  id: number;
  nome: string;
  morada: string;
  telefone: string;
  website: string;
  categoria: string;
  imagemUrl: string;
}

export default function AdminBusinessPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    nomeNegocio: '',
    endereco: '',
    telefoneNegocio: '',
    descricao: '',
    categoria: '',
    imagemUrl: '',
    nomeDono: '',
    emailDono: '',
    passwordDono: ''
  });

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      const response = await api.get('/businesses');
      setBusinesses(response.data);
    } catch (error) {
      toast.error('Erro ao carregar estabelecimentos.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/businesses', formData);
      toast.success('Estabelecimento e Gestor criados com sucesso!');
      setIsAddModalOpen(false);
      setFormData({ 
        nomeNegocio: '', endereco: '', telefoneNegocio: '', descricao: '', 
        categoria: '', imagemUrl: '', nomeDono: '', emailDono: '', passwordDono: '' 
      });
      fetchBusinesses();
    } catch (error) {
      toast.error('Erro ao adicionar estabelecimento.');
    }
  };

  const handleDeleteBusiness = async () => {
    if (!businessToDelete) return;
    try {
      await api.delete(`/businesses/${businessToDelete}`);
      toast.success('Estabelecimento removido.');
      setBusinessToDelete(null);
      fetchBusinesses();
    } catch (error) {
      toast.error('Erro ao remover estabelecimento.');
    }
  };

  const filteredBusinesses = businesses.filter(b => 
    b.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-12 text-center animate-pulse">Carregando estabelecimentos...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Gestão de Estabelecimentos</h1>
          <p className="text-muted-foreground mt-1">Adicione ou remova estabelecimentos da plataforma.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
        >
          <Plus className="h-5 w-5" /> Novo Estabelecimento
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input 
          type="text"
          placeholder="Pesquisar por nome ou categoria..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-card border border-border rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBusinesses.map(business => (
          <div key={business.id} className="bg-card rounded-3xl border border-border shadow-card overflow-hidden group hover:shadow-elevated transition-all duration-300">
            <div className="h-40 bg-muted relative overflow-hidden">
              {business.imagemUrl ? (
                <img src={business.imagemUrl} alt={business.nome} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                  <Building2 className="h-16 w-16" />
                </div>
              )}
              <div className="absolute top-4 right-4">
                <button 
                  onClick={() => setBusinessToDelete(business.id)}
                  className="p-2 bg-white/90 backdrop-blur-sm text-red-600 rounded-xl shadow-lg hover:bg-red-600 hover:text-white transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="absolute bottom-4 left-4">
                <span className="px-3 py-1 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg">
                  {business.categoria}
                </span>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-display font-bold text-foreground">{business.nome}</h3>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {business.morada || business.endereco}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> {business.telefone}</p>
                {business.website && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> {business.website}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL ADICIONAR */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card w-full max-w-2xl rounded-3xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 bg-primary text-primary-foreground flex justify-between items-center">
              <h3 className="text-2xl font-display font-bold">Novo Estabelecimento</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleAddBusiness} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Secção Negócio */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-primary uppercase tracking-widest border-b border-border pb-2">Dados do Estabelecimento</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Nome</label>
                    <input required value={formData.nomeNegocio} onChange={e => setFormData({...formData, nomeNegocio: e.target.value})} className="w-full bg-muted/50 border-none rounded-xl p-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Categoria</label>
                    <input required value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})} className="w-full bg-muted/50 border-none rounded-xl p-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="ex: Barbearia" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Morada</label>
                  <input required value={formData.endereco} onChange={e => setFormData({...formData, endereco: e.target.value})} className="w-full bg-muted/50 border-none rounded-xl p-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Telefone</label>
                    <input required value={formData.telefoneNegocio} onChange={e => setFormData({...formData, telefoneNegocio: e.target.value})} className="w-full bg-muted/50 border-none rounded-xl p-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">URL da Imagem</label>
                    <input value={formData.imagemUrl} onChange={e => setFormData({...formData, imagemUrl: e.target.value})} className="w-full bg-muted/50 border-none rounded-xl p-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="https://..." />
                  </div>
                </div>
              </div>

              {/* Secção Gestor */}
              <div className="space-y-4 pt-4">
                <h4 className="text-sm font-bold text-primary uppercase tracking-widest border-b border-border pb-2">Dados do Gestor (Dono)</h4>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Nome do Gestor</label>
                  <input required value={formData.nomeDono} onChange={e => setFormData({...formData, nomeDono: e.target.value})} className="w-full bg-muted/50 border-none rounded-xl p-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email do Gestor</label>
                    <input required type="email" value={formData.emailDono} onChange={e => setFormData({...formData, emailDono: e.target.value})} className="w-full bg-muted/50 border-none rounded-xl p-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Senha Inicial</label>
                    <input required type="password" value={formData.passwordDono} onChange={e => setFormData({...formData, passwordDono: e.target.value})} className="w-full bg-muted/50 border-none rounded-xl p-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98] mt-4">
                Criar Estabelecimento e Gestor
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMAR REMOÇÃO */}
      <ConfirmDialog 
        isOpen={!!businessToDelete}
        title="Confirmar Remoção"
        message="Tem a certeza que deseja remover este estabelecimento? Esta ação é irreversível e todos os dados associados serão perdidos."
        onConfirm={handleDeleteBusiness}
        onCancel={() => setBusinessToDelete(null)}
      />
    </div>
  );
}
