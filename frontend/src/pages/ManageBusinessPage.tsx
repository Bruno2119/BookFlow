import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { Store, Save, Image as ImageIcon, MapPin, Phone, Info } from 'lucide-react';
import { toast } from 'sonner';
import BusinessHoursManager from '../components/BusinessHoursManager';

export default function ManageBusinessPage() {
  const { user } = useAuth();
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Função robusta de normalização (Brute Force)
  const normalize = (data: any) => {
    let rawHours: any[] = [];
    try {
      const json = data.horariosJson ?? data.HorariosJson;
      if (json) {
        rawHours = JSON.parse(json);
      } else {
        rawHours = data.horarios ?? data.Horarios ?? [];
      }
    } catch (e) {
      rawHours = data.horarios ?? data.Horarios ?? [];
    }

    // Garante que temos sempre 7 dias (0-6)
    const fullWeek = Array.from({ length: 7 }).map((_, i) => {
      const found = rawHours.find((h: any) => (h.diaSemana ?? h.DiaSemana) === i);
      if (found) {
        return {
          diaSemana: i,
          horaAbertura: found.horaAbertura ?? found.HoraAbertura ?? "09:00:00",
          horaFecho: found.horaFecho ?? found.HoraFecho ?? "18:00:00",
          estaAberto: found.estaAberto ?? found.EstaAberto ?? false
        };
      }
      // Default fallback para dias em falta no JSON/DB
      return {
        diaSemana: i,
        horaAbertura: "09:00:00",
        horaFecho: "18:00:00",
        estaAberto: i >= 1 && i <= 5 // Seg-Sex aberto por padrão
      };
    });
    
    return {
      id: data.id ?? data.Id,
      nome: data.nome ?? data.Nome ?? '',
      descricao: data.descricao ?? data.Descricao ?? '',
      endereco: data.endereco ?? data.Endereco ?? '',
      telefone: data.telefone ?? data.Telefone ?? '',
      categoria: data.categoria ?? data.Categoria ?? '',
      imagemUrl: data.imagemUrl ?? data.ImagemUrl ?? '',
      horarios: fullWeek
    };
  };

  useEffect(() => {
    if (user?.negocioId) {
      setLoading(true);
      api.get(`/businesses/${user.negocioId}`)
        .then(res => {
          const cleanData = normalize(res.data);
          console.log('[DEBUG] CARREGADO DO SQL:', cleanData);
          setBusiness(cleanData);
        })
        .catch(err => {
          console.error('ERRO AO CARREGAR:', err);
          toast.error('Erro ao carregar dados.');
        })
        .finally(() => setLoading(false));
    }
  }, [user, refreshKey]);

  const handleSave = async () => {
    if (!business) return;
    setIsSaving(true);
    
    try {
      const payload = {
        nome: business.nome,
        descricao: business.descricao,
        endereco: business.endereco,
        telefone: business.telefone,
        categoria: business.categoria,
        imagemUrl: business.imagemUrl,
        horarios: business.horarios
      };

      await api.put(`/businesses/${business.id}/full`, payload);
      toast.success('Alterações guardadas com sucesso!');
      
      // Refresh total para garantir que o visual reflete a DB
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('ERRO AO GUARDAR:', error);
      toast.error('Erro ao guardar alterações.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse font-bold text-primary">Sincronizando com a base de dados...</div>;
  if (!business) return <div className="p-20 text-center text-red-500 font-bold">Estabelecimento não encontrado.</div>;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <h2 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
            <Store className="h-8 w-8 text-primary" /> Definições do Estabelecimento
          </h2>
          <p className="text-muted-foreground mt-1 font-medium">Controle total sobre as informações e horários da {business.nome}.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isSaving ? "A guardar..." : <><Save className="h-5 w-5" /> Guardar Alterações</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-8">
          <div className="bg-card border border-border rounded-3xl p-8 shadow-card space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
              <Info className="h-5 w-5 text-primary" /> Informações Gerais
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Nome</label>
                <input
                  type="text"
                  value={business.nome}
                  onChange={(e) => setBusiness({...business, nome: e.target.value})}
                  className="w-full bg-muted/50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Descrição</label>
                <textarea
                  value={business.descricao}
                  onChange={(e) => setBusiness({...business, descricao: e.target.value})}
                  className="w-full bg-muted/50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 outline-none font-medium min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Telefone</label>
                  <input
                    type="text"
                    value={business.telefone}
                    onChange={(e) => setBusiness({...business, telefone: e.target.value})}
                    className="w-full bg-muted/50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Categoria</label>
                  <input
                    type="text"
                    value={business.categoria}
                    onChange={(e) => setBusiness({...business, categoria: e.target.value})}
                    className="w-full bg-muted/50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Endereço</label>
                <input
                  type="text"
                  value={business.endereco}
                  onChange={(e) => setBusiness({...business, endereco: e.target.value})}
                  className="w-full bg-muted/50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Imagem (URL)</label>
                <input
                  type="text"
                  value={business.imagemUrl}
                  onChange={(e) => setBusiness({...business, imagemUrl: e.target.value})}
                  className="w-full bg-muted/50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <BusinessHoursManager 
            horarios={business.horarios}
            onChange={(newHorarios) => setBusiness({...business, horarios: newHorarios})}
          />
        </div>
      </div>
    </div>
  );
}
