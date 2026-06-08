import { useState, useEffect } from 'react';
import api from '../lib/api';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { 
  UserPlus, 
  Trash2, 
  User, 
  Mail, 
  ShieldCheck,
  Search,
  X
} from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';

interface Professional {
  id: number;
  nome: string;
  email: string;
  tipo: any;
}

export default function ManageTeamPage() {
  const { user } = useAuth();
  const [team, setTeam] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<number | null>(null);

  const [newMember, setNewMember] = useState({
    nome: '',
    email: '',
    password: '',
    tipo: 2, // 2 = PROFISSIONAL
    negocioId: user?.negocioId
  });

  useEffect(() => {
    if (user?.negocioId) fetchTeam();
  }, [user]);

  const fetchTeam = async () => {
    try {
      // In a real app, we'd have /api/businesses/{id}/team
      const response = await api.get(`/businesses/${user?.negocioId}`);
      // Assuming the business entity now includes "Funcionarios" as mapped in the backend
      setTeam(response.data.funcionarios?.filter((u: any) => u.tipo === 2 || u.tipo === 'PROFISSIONAL') || []);
    } catch (error) {
      toast.error('Erro ao carregar equipa.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create user and link to business
      await api.post('/auth/register', { ...newMember, negocioId: user?.negocioId });
      toast.success('Profissional adicionado à equipa!');
      setIsAddModalOpen(false);
      setNewMember({ nome: '', email: '', password: '', tipo: 2, negocioId: user?.negocioId });
      fetchTeam();
    } catch (error) {
      toast.error('Erro ao adicionar profissional.');
    }
  };

  const handleDeleteMember = async () => {
    if (!memberToDelete) return;
    try {
      // In a real app, this might just unlink the user from the business or disable them
      await api.delete(`/users/${memberToDelete}`); // Assuming a delete user endpoint exists or unlinks
      toast.success('Membro removido da equipa.');
      setMemberToDelete(null);
      fetchTeam();
    } catch (error) {
      toast.error('Erro ao remover membro.');
    }
  };

  if (loading) return <div className="p-12 text-center animate-pulse">Carregando equipa...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Gestão de Equipa</h1>
          <p className="text-muted-foreground mt-1">Gerencie os profissionais que trabalham no seu estabelecimento.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
        >
          <UserPlus className="h-5 w-5" /> Adicionar Profissional
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-card rounded-3xl border border-dashed border-border">
            <User className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">Ainda não tem profissionais registados.</p>
          </div>
        ) : (
          team.map(member => (
            <div key={member.id} className="bg-card p-6 rounded-3xl border border-border shadow-card hover:shadow-elevated transition-all group relative overflow-hidden">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <User className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-foreground">{member.nome}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-primary font-bold uppercase tracking-wider">
                    <ShieldCheck className="h-3 w-3" />
                    Profissional
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {member.email}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border flex justify-end">
                <button 
                  onClick={() => setMemberToDelete(member.id)}
                  className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
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
              <h3 className="text-2xl font-display font-bold">Novo Profissional</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleAddMember} className="p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Nome Completo</label>
                <input required value={newMember.nome} onChange={e => setNewMember({...newMember, nome: e.target.value})} className="w-full bg-muted/50 border-none rounded-xl p-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="Nome do profissional" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email</label>
                <input required type="email" value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} className="w-full bg-muted/50 border-none rounded-xl p-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="email@exemplo.com" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Senha Inicial</label>
                <input required type="password" value={newMember.password} onChange={e => setNewMember({...newMember, password: e.target.value})} className="w-full bg-muted/50 border-none rounded-xl p-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
              </div>

              <button type="submit" className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98] mt-4">
                Registar Profissional
              </button>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog 
        isOpen={!!memberToDelete}
        title="Remover Membro"
        message="Deseja remover este profissional da sua equipa? Ele deixará de ter acesso à agenda deste estabelecimento."
        onConfirm={handleDeleteMember}
        onCancel={() => setMemberToDelete(null)}
      />
    </div>
  );
}
