import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface AdminUser {
  id: number;
  email: string;
  name: string;
  bizName?: string;
  plan: string;
  isPro: boolean;
  isAdmin: boolean;
  subscriptionExpiry?: string;
  createdAt: string;
  phoneNumber?: string;
  _count: { students: number };
}

interface Stats {
  totalUsers: number;
  planBreakdown: { PRO: number; BASIC: number; INITIAL: number; FREE: number };
  totalStudents: number;
  totalPayments: number;
  recentUsers: { id: number; name: string; email: string; plan: string; createdAt: string }[];
}

const PLAN_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PRO:     { label: 'Pro',        color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  BASIC:   { label: 'Básico',     color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  INITIAL: { label: 'Free Trial', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  FREE:    { label: 'Free',       color: '#6b7280', bg: 'rgba(107,114,128,0.15)' },
};

function PlanBadge({ plan }: { plan: string }) {
  const cfg = PLAN_CONFIG[plan] ?? { label: plan, color: '#6b7280', bg: 'rgba(107,114,128,0.15)' };
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600,
      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}40`
    }}>{cfg.label}</span>
  );
}

export default function AdminPanel() {
  const { token, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<'users' | 'stats' | 'landing' | 'testimonials' | 'prices'>('users');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [ratings, setRatings] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('ALL');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Plan modal
  const [planModal, setPlanModal] = useState<{ user: AdminUser } | null>(null);
  const [selectedPlan, setSelectedPlan] = useState('PRO');
  const [expiryDate, setExpiryDate] = useState('');

  // Pre-approve modal
  const [preApproveModal, setPreApproveModal] = useState(false);
  const [preApproveEmail, setPreApproveEmail] = useState('');

  // Delete modal
  const [deleteModal, setDeleteModal] = useState<{ user: AdminUser } | null>(null);

  // Landing Feature Form
  const [featureEmail, setFeatureEmail] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [testimonial, setTestimonial] = useState('');
  const [featureLoading, setFeatureLoading] = useState(false);

  // Prices Form
  const [prices, setPrices] = useState({
    base_price_basic_monthly: '5242',
    base_price_pro_monthly: '11242',
    base_price_pro_trimestral: '30352',
    ipc_multiplier: '1.0'
  });
  const [pricesLoading, setPricesLoading] = useState(false);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const apiFetch = useCallback(async (path: string, opts: RequestInit = {}) => {
    const res = await fetch(`${API_URL}/admin${path}`, {
      ...opts,
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', ...(opts.headers || {}) }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error');
    return data;
  }, [token]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '15', search, plan: planFilter });
      const data = await apiFetch(`/users?${params}`);
      setUsers(data.users);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (e: any) { showToast(e.message, 'error'); }
    finally { setLoading(false); }
  }, [apiFetch, page, search, planFilter]);

  const fetchRatings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/ratings');
      setRatings(data);
    } catch (e: any) { showToast(e.message, 'error'); }
    finally { setLoading(false); }
  }, [apiFetch]);

  const fetchPrices = useCallback(async () => {
    try {
      const data = await apiFetch('/prices');
      setPrices(data);
    } catch (e: any) { showToast(e.message, 'error'); }
  }, [apiFetch]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await apiFetch('/stats');
      setStats(data);
    } catch (e: any) { showToast(e.message, 'error'); }
  }, [apiFetch]);

  useEffect(() => {
    if (!isAdmin) { navigate('/app/dashboard'); return; }
    if (tab === 'users') fetchUsers();
    if (tab === 'stats') fetchStats();
    if (tab === 'testimonials') fetchRatings();
    if (tab === 'prices') fetchPrices();
  }, [tab, isAdmin, navigate, fetchUsers, fetchStats, fetchRatings, fetchPrices]);

  const handlePlanSave = async () => {
    if (!planModal) return;
    try {
      const body: any = { plan: selectedPlan };
      if (expiryDate) body.expiryDate = expiryDate;
      await apiFetch(`/users/${planModal.user.id}/plan`, { method: 'PATCH', body: JSON.stringify(body) });
      showToast(`Plan de ${planModal.user.email} actualizado a ${selectedPlan}`);
      setPlanModal(null);
      fetchUsers();
    } catch (e: any) { showToast(e.message, 'error'); }
  };

  const handleRegenToken = async (user: AdminUser, tokenType: 'calendarToken' | 'ratingToken') => {
    try {
      await apiFetch(`/users/${user.id}/regenerate-token`, { method: 'POST', body: JSON.stringify({ token: tokenType }) });
      showToast(`${tokenType} de ${user.email} regenerado`);
    } catch (e: any) { showToast(e.message, 'error'); }
  };

  const handlePreApprove = async () => {
    if (!preApproveEmail) return;
    try {
      await apiFetch(`/users/pre-approve`, { method: 'POST', body: JSON.stringify({ email: preApproveEmail }) });
      showToast(`Correo ${preApproveEmail} pre-aprobado para plan PRO`);
      setPreApproveModal(false);
      setPreApproveEmail('');
      fetchUsers();
    } catch (e: any) { showToast(e.message, 'error'); }
  };

  const handleDeleteRating = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta calificación?')) return;
    try {
      await apiFetch(`/ratings/${id}`, { method: 'DELETE' });
      showToast('Calificación eliminada');
      fetchRatings();
    } catch (e: any) { showToast(e.message, 'error'); }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await apiFetch(`/users/${deleteModal.user.id}`, { method: 'DELETE' });
      showToast(`Usuario ${deleteModal.user.email} eliminado`);
      setDeleteModal(null);
      fetchUsers();
    } catch (e: any) { showToast(e.message, 'error'); }
  };

  const handleUpdateFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!featureEmail) return;

    try {
        setFeatureLoading(true);
        const res = await apiFetch('/users/feature', { 
            method: 'POST', 
            body: JSON.stringify({ targetEmail: featureEmail, isFeatured, testimonial }) 
        });
        showToast(res.message || 'Estado destacado actualizado exitosamente');
        setFeatureEmail('');
        setIsFeatured(false);
        setTestimonial('');
    } catch (error: any) {
        showToast(error.message || 'Error al actualizar estado', 'error');
    } finally {
        setFeatureLoading(false);
    }
  };

  const handleUpdatePrices = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setPricesLoading(true);
      await apiFetch('/prices', {
        method: 'PATCH',
        body: JSON.stringify(prices)
      });
      showToast('Precios base actualizados correctamente');
      fetchPrices();
    } catch (error: any) {
      showToast(error.message || 'Error al actualizar precios', 'error');
    } finally {
      setPricesLoading(false);
    }
  };

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('es-AR') : '—';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app, #0f1117)', color: 'var(--text-primary, #f1f5f9)', fontFamily: 'Inter, sans-serif', padding: '32px 24px' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 9999, padding: '12px 20px', borderRadius: 12,
          background: toast.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${toast.type === 'success' ? '#10b981' : '#ef4444'}`,
          color: toast.type === 'success' ? '#10b981' : '#ef4444',
          fontWeight: 600, fontSize: 14, backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }}>{toast.msg}</div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <button onClick={() => navigate('/app/dashboard')} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '8px 14px', color: 'inherit', cursor: 'pointer', fontSize: 18 }}>←</button>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, background: 'linear-gradient(135deg, #10b981, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Panel de Administración
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary, #94a3b8)', fontSize: 14 }}>Cobralo · Gestión de usuarios y planes</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, background: 'rgba(255,255,255,0.04)', padding: 6, borderRadius: 14, width: 'fit-content', border: '1px solid rgba(255,255,255,0.08)' }}>
        {[
          { id: 'users', label: 'Usuarios', icon: '👥' },
          { id: 'stats', label: 'Estadísticas', icon: '📊' },
          { id: 'prices', label: 'Precios', icon: '💵' },
          { id: 'testimonials', label: 'Testimonios', icon: '⭐' },
          { id: 'landing', label: 'Landing Page', icon: '🌍' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)} style={{
            padding: '8px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14,
            background: tab === t.id ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
            color: tab === t.id ? '#fff' : 'var(--text-secondary, #94a3b8)',
            transition: 'all 0.2s'
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── USERS TAB ── */}
      {tab === 'users' && (
        <div>
          {/* Filters and Buttons */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', flex: 1 }}>
              <input
                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Buscar por email, nombre o negocio..."
                style={{
                  flex: 1, minWidth: 260, padding: '10px 16px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'inherit', fontSize: 14, outline: 'none'
                }}
              />
              <select
                value={planFilter} onChange={e => { setPlanFilter(e.target.value); setPage(1); }}
                style={{
                  padding: '10px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)', color: 'inherit', fontSize: 14, cursor: 'pointer'
                }}
              >
                <option value="ALL">Todos los planes</option>
                <option value="PRO">Pro</option>
                <option value="BASIC">Básico</option>
                <option value="INITIAL">Free Trial</option>
                <option value="FREE">Free expirado</option>
              </select>
              <button onClick={fetchUsers} style={{
                padding: '10px 20px', borderRadius: 12, background: 'rgba(16,185,129,0.15)',
                border: '1px solid #10b981', color: '#10b981', fontWeight: 600, cursor: 'pointer', fontSize: 14
              }}>🔄 Actualizar</button>
            </div>
            
            <button onClick={() => setPreApproveModal(true)} style={{
              padding: '10px 20px', borderRadius: 12, background: 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14, boxShadow: '0 4px 14px rgba(16,185,129,0.3)'
            }}>
              ✨ Pre-aprobar Correo (PRO)
            </button>
          </div>

          {/* Count */}
          <p style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: 13, marginBottom: 12 }}>
            {total} usuario{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
          </p>

          {/* Table */}
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-secondary, #94a3b8)' }}>Cargando...</div>
            ) : users.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-secondary, #94a3b8)' }}>No hay usuarios</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    {['Usuario', 'Plan', 'Vence', 'Alumnos', 'Registrado', 'Acciones'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{u.name} {u.isAdmin && <span style={{ fontSize: 10, background: 'rgba(251,191,36,0.2)', color: '#fbbf24', border: '1px solid #fbbf24', borderRadius: 6, padding: '1px 6px', marginLeft: 4 }}>ADMIN</span>}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary, #94a3b8)', marginTop: 2 }}>{u.email}</div>
                        {u.bizName && <div style={{ fontSize: 11, color: 'var(--text-secondary, #94a3b8)' }}>{u.bizName}</div>}
                      </td>
                      <td style={{ padding: '14px 16px' }}><PlanBadge plan={u.plan} /></td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: u.subscriptionExpiry && new Date(u.subscriptionExpiry) < new Date() ? '#ef4444' : 'inherit' }}>
                        {formatDate(u.subscriptionExpiry)}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600 }}>{u._count.students}</td>
                      <td style={{ padding: '14px 16px', fontSize: 12, color: 'var(--text-secondary, #94a3b8)' }}>{formatDate(u.createdAt)}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <button title="Cambiar plan" onClick={() => { setPlanModal({ user: u }); setSelectedPlan(u.plan); setExpiryDate(''); }}
                            style={{ padding: '5px 10px', borderRadius: 8, background: 'rgba(16,185,129,0.15)', border: '1px solid #10b981', color: '#10b981', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                            📋 Plan
                          </button>
                          <button title="Regenerar Calendar Token" onClick={() => handleRegenToken(u, 'calendarToken')}
                            style={{ padding: '5px 10px', borderRadius: 8, background: 'rgba(59,130,246,0.15)', border: '1px solid #3b82f6', color: '#3b82f6', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                            🔑 Cal
                          </button>
                          <button title="Regenerar Rating Token" onClick={() => handleRegenToken(u, 'ratingToken')}
                            style={{ padding: '5px 10px', borderRadius: 8, background: 'rgba(139,92,246,0.15)', border: '1px solid #8b5cf6', color: '#8b5cf6', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                            ⭐ Rating
                          </button>
                          {!u.isAdmin && (
                            <button title="Eliminar usuario" onClick={() => setDeleteModal({ user: u })}
                              style={{ padding: '5px 10px', borderRadius: 8, background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#ef4444', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                              🗑️
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20 }}>
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                style={{ padding: '8px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'inherit', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}>
                ← Anterior
              </button>
              <span style={{ padding: '8px 16px', color: 'var(--text-secondary, #94a3b8)', fontSize: 14 }}>Página {page} de {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                style={{ padding: '8px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'inherit', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1 }}>
                Siguiente →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── STATS TAB ── */}
      {tab === 'stats' && stats && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
            {[
              { label: 'Total Usuarios', value: stats.totalUsers, icon: '👥', color: '#3b82f6' },
              { label: 'Plan Pro', value: stats.planBreakdown.PRO, icon: '🚀', color: '#10b981' },
              { label: 'Plan Básico', value: stats.planBreakdown.BASIC, icon: '💎', color: '#3b82f6' },
              { label: 'Free Trial', value: stats.planBreakdown.INITIAL, icon: '⏳', color: '#f59e0b' },
              { label: 'Free Expirado', value: stats.planBreakdown.FREE, icon: '😴', color: '#6b7280' },
              { label: 'Total Alumnos', value: stats.totalStudents, icon: '🎓', color: '#8b5cf6' },
              { label: 'Total Pagos', value: stats.totalPayments, icon: '💰', color: '#10b981' },
            ].map(card => (
              <div key={card.label} style={{
                background: 'rgba(255,255,255,0.04)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)',
                padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 8
              }}>
                <span style={{ fontSize: 28 }}>{card.icon}</span>
                <div style={{ fontSize: 32, fontWeight: 800, color: card.color }}>{card.value}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary, #94a3b8)', fontWeight: 500 }}>{card.label}</div>
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', padding: 24 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>Últimos registros</h3>
            {stats.recentUsers.map(u => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary, #94a3b8)' }}>{u.email}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <PlanBadge plan={u.plan} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary, #94a3b8)' }}>{formatDate(u.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── LANDING TAB ── */}
      {tab === 'landing' && (
        <div style={{ maxWidth: 600 }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', padding: 32 }}>
                <h3 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800 }}>Gestión de Landing Page</h3>
                <p style={{ margin: '0 0 24px', color: 'var(--text-secondary, #94a3b8)', fontSize: 14 }}>
                    Destaca usuarios en la página principal y añade sus testimonios.
                </p>

                <form onSubmit={handleUpdateFeature} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* User Selection */}
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary, #94a3b8)' }}>
                            Email del Usuario
                        </label>
                        <input
                            type="email"
                            required
                            placeholder="Email"
                            value={featureEmail}
                            onChange={(e) => setFeatureEmail(e.target.value)}
                            style={{ width: '100%', padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'inherit', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                        />
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                        <input
                            type="checkbox"
                            checked={isFeatured}
                            onChange={(e) => setIsFeatured(e.target.checked)}
                            style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#10b981' }}
                        />
                        <span style={{ fontSize: 14, fontWeight: 600 }}>¿Mostrar como Profesor Destacado en la Landing Page?</span>
                    </label>

                    {/* Testimonial */}
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary, #94a3b8)' }}>
                            Testimonio (Opcional)
                        </label>
                        <textarea
                            placeholder="Ej: Cobralo me cambió la vida, ahora tengo el triple de alumnos y no me preocupo por cobrar..."
                            value={testimonial}
                            onChange={(e) => setTestimonial(e.target.value)}
                            style={{ width: '100%', padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'inherit', fontSize: 14, outline: 'none', minHeight: 100, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={featureLoading || !featureEmail}
                        style={{ padding: '14px', borderRadius: 12, background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', color: '#fff', fontWeight: 700, cursor: (!featureEmail || featureLoading) ? 'not-allowed' : 'pointer', fontSize: 14, boxShadow: '0 4px 14px rgba(16,185,129,0.3)', opacity: (!featureEmail || featureLoading) ? 0.5 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}
                    >
                        {featureLoading ? 'Actualizando...' : 'Actualizar Perfil Público'}
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* ── TESTIMONIALS TAB ── */}
      {tab === 'testimonials' && (
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.04)', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th style={{ padding: '16px 20px', color: 'var(--text-secondary, #94a3b8)', fontWeight: 600 }}>Alumno</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-secondary, #94a3b8)', fontWeight: 600 }}>Profesor</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-secondary, #94a3b8)', fontWeight: 600 }}>Puntuación</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-secondary, #94a3b8)', fontWeight: 600 }}>Comentario</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-secondary, #94a3b8)', fontWeight: 600 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ratings.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary, #94a3b8)' }}>
                    No hay testimonios para mostrar
                  </td>
                </tr>
              )}
              {ratings.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontWeight: 600 }}>{r.studentName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary, #94a3b8)' }}>{new Date(r.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontWeight: 600 }}>{r.owner?.bizName || r.owner?.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary, #94a3b8)' }}>{r.owner?.email}</div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', gap: 2 }}>
                        {[...Array(5)].map((_, i) => (
                            <span key={i} style={{ color: i < r.value ? '#fbbf24' : 'rgba(255,255,255,0.1)' }}>★</span>
                        ))}
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', maxWidth: 300, fontSize: 13 }}>
                    <div style={{ fontStyle: 'italic', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.4 }}>
                        "{r.comment}"
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <button 
                        onClick={() => handleDeleteRating(r.id)}
                        style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                    >
                        Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── PRICES TAB ── */}
      {tab === 'prices' && (
        <div style={{ maxWidth: 600 }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', padding: 32 }}>
                <h3 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800 }}>Precios Base de Suscripción</h3>
                <p style={{ margin: '0 0 24px', color: 'var(--text-secondary, #94a3b8)', fontSize: 14 }}>
                    Estos son los precios base de los planes. El precio final mostrado a los usuarios será el <strong style={{color: '#f1f5f9'}}>Precio Base × Multiplicador IPC ({parseFloat(prices.ipc_multiplier).toFixed(2)})</strong>. El multiplicador se actualiza automáticamente cada mes.
                </p>

                <form onSubmit={handleUpdatePrices} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div>
                        <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary, #94a3b8)' }}>
                            <span>Plan Básico (Mensual)</span>
                            <span style={{ color: '#10b981' }}>Final aprox: ${Math.round((parseFloat(prices.base_price_basic_monthly || '0') * parseFloat(prices.ipc_multiplier || '1')) / 10) * 10} ARS</span>
                        </label>
                        <input
                            type="number"
                            required
                            min="0"
                            step="1"
                            value={prices.base_price_basic_monthly}
                            onChange={(e) => setPrices({ ...prices, base_price_basic_monthly: e.target.value })}
                            style={{ width: '100%', padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'inherit', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary, #94a3b8)' }}>
                            <span>Plan PRO (Mensual)</span>
                            <span style={{ color: '#10b981' }}>Final aprox: ${Math.round((parseFloat(prices.base_price_pro_monthly || '0') * parseFloat(prices.ipc_multiplier || '1')) / 10) * 10} ARS</span>
                        </label>
                        <input
                            type="number"
                            required
                            min="0"
                            step="1"
                            value={prices.base_price_pro_monthly}
                            onChange={(e) => setPrices({ ...prices, base_price_pro_monthly: e.target.value })}
                            style={{ width: '100%', padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'inherit', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary, #94a3b8)' }}>
                            <span>Plan PRO (Trimestral)</span>
                            <span style={{ color: '#10b981' }}>Final aprox: ${Math.round((parseFloat(prices.base_price_pro_trimestral || '0') * parseFloat(prices.ipc_multiplier || '1')) / 10) * 10} ARS</span>
                        </label>
                        <input
                            type="number"
                            required
                            min="0"
                            step="1"
                            value={prices.base_price_pro_trimestral}
                            onChange={(e) => setPrices({ ...prices, base_price_pro_trimestral: e.target.value })}
                            style={{ width: '100%', padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'inherit', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={pricesLoading}
                        style={{ padding: '14px', borderRadius: 12, background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', color: '#fff', fontWeight: 700, cursor: pricesLoading ? 'not-allowed' : 'pointer', fontSize: 14, boxShadow: '0 4px 14px rgba(16,185,129,0.3)', opacity: pricesLoading ? 0.5 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 8 }}
                    >
                        {pricesLoading ? 'Guardando...' : 'Guardar Precios Base'}
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* ── PRE-APPROVE MODAL ── */}
      {preApproveModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: 'rgba(15,17,23,0.95)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 420, boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>
            <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800 }}>Pre-aprobar Acceso PRO</h2>
            <p style={{ margin: '0 0 24px', color: 'var(--text-secondary, #94a3b8)', fontSize: 14 }}>
              Ingresá el correo de tu cliente. Cuando se registre usando ese correo, obtendrá el plan PRO automáticamente de por vida.
            </p>

            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary, #94a3b8)' }}>Correo del Cliente</label>
            <input type="email" placeholder="cliente@ejemplo.com" value={preApproveEmail} onChange={e => setPreApproveEmail(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'inherit', fontSize: 14, marginBottom: 24, boxSizing: 'border-box', outline: 'none' }}
            />

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setPreApproveModal(false)} style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'inherit', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
              <button onClick={handlePreApprove} style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>Pre-aprobar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── PLAN MODAL ── */}
      {planModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: 'rgba(15,17,23,0.95)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 420, boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>
            <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800 }}>Cambiar Plan</h2>
            <p style={{ margin: '0 0 24px', color: 'var(--text-secondary, #94a3b8)', fontSize: 14 }}>{planModal.user.email}</p>

            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary, #94a3b8)' }}>Plan</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {(['FREE', 'INITIAL', 'BASIC', 'PRO'] as const).map(p => {
                const cfg = PLAN_CONFIG[p];
                return (
                  <button key={p} onClick={() => setSelectedPlan(p)} style={{
                    padding: '12px', borderRadius: 12, border: `2px solid ${selectedPlan === p ? cfg.color : 'rgba(255,255,255,0.1)'}`,
                    background: selectedPlan === p ? cfg.bg : 'transparent', color: selectedPlan === p ? cfg.color : 'inherit',
                    cursor: 'pointer', fontWeight: 700, fontSize: 14, transition: 'all 0.2s'
                  }}>{cfg.label}</button>
                );
              })}
            </div>

            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary, #94a3b8)' }}>
              Fecha de vencimiento <span style={{ fontWeight: 400 }}>(opcional, si vacío usa default)</span>
            </label>
            <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'inherit', fontSize: 14, marginBottom: 24, boxSizing: 'border-box' }}
            />

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setPlanModal(null)} style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'inherit', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
              <button onClick={handlePlanSave} style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ── */}
      {deleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: 'rgba(15,17,23,0.95)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 380, boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>
            <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 16 }}>⚠️</div>
            <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800, textAlign: 'center' }}>Eliminar Usuario</h2>
            <p style={{ margin: '0 0 24px', color: 'var(--text-secondary, #94a3b8)', fontSize: 14, textAlign: 'center' }}>
              Esta acción eliminará permanentemente a <strong>{deleteModal.user.email}</strong> y todos sus datos.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleteModal(null)} style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'inherit', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
              <button onClick={handleDelete} style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'rgba(239,68,68,0.8)', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
