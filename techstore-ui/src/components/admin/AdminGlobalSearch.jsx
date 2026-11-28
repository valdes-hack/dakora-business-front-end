import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, X, ArrowRight, LayoutDashboard, Box, LayoutGrid, Layers,
    Flame, PackagePlus, Truck, ShoppingCart, Users, BarChart3, Settings,
    FileText, Loader2, Package
} from 'lucide-react';
import AdminService from '../../services/admin.service';
import CollectionService from '../../services/collection.service';
import { useTheme } from '../../context/ThemeContext';

const ADMIN_PAGES = [
    { label: 'Tableau de bord', path: '/admin', keywords: 'dashboard accueil stats kpi', icon: LayoutDashboard },
    { label: 'Produits', path: '/admin/products', keywords: 'catalogue articles stock prix', icon: Box },
    { label: 'Collections', path: '/admin/collections', keywords: 'groupes rayons sélections', icon: LayoutGrid },
    { label: 'Catégories', path: '/admin/categories', keywords: 'rayons familles', icon: Layers },
    { label: 'Promotions', path: '/admin/promotions', keywords: 'remises soldes réductions', icon: Flame },
    { label: 'Ravitaillement', path: '/admin/stock', keywords: 'inventaire stock approvisionnement', icon: PackagePlus },
    { label: 'Fournisseurs', path: '/admin/suppliers', keywords: 'partenaires', icon: Truck },
    { label: 'Commandes', path: '/admin/orders', keywords: 'ventes livraisons clients', icon: ShoppingCart },
    { label: 'Clients & Utilisateurs', path: '/admin/users', keywords: 'comptes rôles', icon: Users },
    { label: 'Rapports & Analyses', path: '/admin/stats', keywords: 'statistiques avis graphiques', icon: BarChart3 },
    { label: 'Paramètres', path: '/admin/settings', keywords: 'configuration boutique logo collections', icon: Settings },
    { label: 'À propos (CMS)', path: '/admin/about', keywords: 'contenu histoire équipe mission', icon: FileText },
];

const AdminGlobalSearch = ({ isOpen, onClose }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const navigate = useNavigate();
    const inputRef = useRef(null);

    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [data, setData] = useState({
        products: [],
        collections: [],
        categories: [],
        orders: [],
        users: [],
    });

    useEffect(() => {
        if (!isOpen) return;
        setQuery('');
        setTimeout(() => inputRef.current?.focus(), 60);

        if (!loaded) {
            const fetchAllAdminData = async () => {
                setLoading(true);
                try {
                    const [prods, cols, cats, orders, users] = await Promise.allSettled([
                        AdminService.getAdminProducts(),
                        CollectionService.adminGetAll(),
                        AdminService.getAllAdminCategories(),
                        AdminService.getOrders(),
                        AdminService.getUsers(),
                    ]);
                    setData({
                        products: prods.status === 'fulfilled' ? (prods.value?.data?.content || prods.value?.data || []) : [],
                        collections: cols.status === 'fulfilled' ? (cols.value?.data || []) : [],
                        categories: cats.status === 'fulfilled' ? (cats.value?.data || []) : [],
                        orders: orders.status === 'fulfilled' ? (orders.value?.data?.content || orders.value?.data || []) : [],
                        users: users.status === 'fulfilled' ? (users.value?.data || []) : [],
                    });
                    setLoaded(true);
                } catch (err) {
                    console.error('Erreur recherche globale admin:', err);
                } finally {
                    setLoading(false);
                }
            };
            fetchAllAdminData();
        }
    }, [isOpen, loaded]);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) {
            return {
                pages: ADMIN_PAGES.slice(0, 6),
                products: [],
                collections: [],
                categories: [],
                orders: [],
                users: [],
            };
        }

        return {
            pages: ADMIN_PAGES.filter(
                (p) => p.label.toLowerCase().includes(q) || p.keywords.toLowerCase().includes(q)
            ).slice(0, 5),
            products: (Array.isArray(data.products) ? data.products : [])
                .filter((p) => (p.name || '').toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q))
                .slice(0, 5),
            collections: (Array.isArray(data.collections) ? data.collections : [])
                .filter((c) => (c.name || '').toLowerCase().includes(q) || (c.slug || '').toLowerCase().includes(q))
                .slice(0, 5),
            categories: (Array.isArray(data.categories) ? data.categories : [])
                .filter((c) => (c.name || '').toLowerCase().includes(q))
                .slice(0, 4),
            orders: (Array.isArray(data.orders) ? data.orders : [])
                .filter(
                    (o) =>
                        String(o.id || '').includes(q) ||
                        (o.orderNumber || '').toLowerCase().includes(q) ||
                        (o.customerName || o.userName || '').toLowerCase().includes(q)
                )
                .slice(0, 4),
            users: (Array.isArray(data.users) ? data.users : [])
                .filter(
                    (u) =>
                        (u.username || '').toLowerCase().includes(q) ||
                        (u.email || '').toLowerCase().includes(q) ||
                        (u.firstName || '').toLowerCase().includes(q)
                )
                .slice(0, 4),
        };
    }, [query, data]);

    if (!isOpen) return null;

    const go = (path) => {
        onClose();
        navigate(path);
    };

    const hasAnyResult =
        results.pages.length > 0 ||
        results.products.length > 0 ||
        results.collections.length > 0 ||
        results.categories.length > 0 ||
        results.orders.length > 0 ||
        results.users.length > 0;

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 px-4"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden ${
                    isDark ? 'bg-[#121526] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                }`}
            >
                {/* Input de recherche */}
                <div className={`flex items-center gap-3 px-5 py-4 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                    <Search size={18} className="text-indigo-500 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Rechercher partout (pages, produits, collections, commandes, clients...)"
                        className={`flex-1 bg-transparent text-sm font-medium focus:outline-none ${
                            isDark ? 'text-white placeholder-gray-500' : 'text-slate-900 placeholder-slate-400'
                        }`}
                    />
                    {loading && <Loader2 size={16} className="animate-spin text-indigo-500" />}
                    <button
                        onClick={onClose}
                        className={`p-1.5 rounded-xl transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-slate-100 text-slate-500'}`}
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Résultats */}
                <div className="max-h-[65vh] overflow-y-auto p-3 space-y-4 custom-scrollbar">
                    {!hasAnyResult ? (
                        <div className="text-center py-10 text-xs text-slate-500 dark:text-gray-400">
                            Aucun résultat trouvé pour « {query} »
                        </div>
                    ) : (
                        <>
                            {results.pages.length > 0 && (
                                <div>
                                    <p className="px-3 text-[10px] font-black uppercase tracking-wider text-indigo-500 mb-1.5">
                                        {query ? 'Pages & Modules' : 'Accès rapide Admin'}
                                    </p>
                                    <div className="space-y-1">
                                        {results.pages.map((p) => {
                                            const Icon = p.icon;
                                            return (
                                                <button
                                                    key={p.path}
                                                    onClick={() => go(p.path)}
                                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                                                        isDark ? 'hover:bg-white/5 text-gray-200' : 'hover:bg-slate-100 text-slate-700'
                                                    }`}
                                                >
                                                    <span className="flex items-center gap-2.5">
                                                        <Icon size={15} className="text-indigo-500" />
                                                        {p.label}
                                                    </span>
                                                    <ArrowRight size={13} className="opacity-40" />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {results.collections.length > 0 && (
                                <div>
                                    <p className="px-3 text-[10px] font-black uppercase tracking-wider text-blue-500 mb-1.5">
                                        Collections
                                    </p>
                                    <div className="space-y-1">
                                        {results.collections.map((c) => (
                                            <button
                                                key={c.id}
                                                onClick={() => go('/admin/collections')}
                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                                                    isDark ? 'hover:bg-white/5 text-gray-200' : 'hover:bg-slate-100 text-slate-700'
                                                }`}
                                            >
                                                <span className="flex items-center gap-2.5 truncate">
                                                    <LayoutGrid size={14} className="text-blue-500 shrink-0" />
                                                    <span className="truncate">{c.name}</span>
                                                </span>
                                                <span className="text-[10px] text-slate-400 shrink-0">{c.productCount ?? 0} produits</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {results.products.length > 0 && (
                                <div>
                                    <p className="px-3 text-[10px] font-black uppercase tracking-wider text-emerald-500 mb-1.5">
                                        Produits
                                    </p>
                                    <div className="space-y-1">
                                        {results.products.map((p) => (
                                            <button
                                                key={p.id}
                                                onClick={() => go('/admin/products')}
                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                                                    isDark ? 'hover:bg-white/5 text-gray-200' : 'hover:bg-slate-100 text-slate-700'
                                                }`}
                                            >
                                                <span className="flex items-center gap-2.5 truncate">
                                                    <Package size={14} className="text-emerald-500 shrink-0" />
                                                    <span className="truncate">{p.name}</span>
                                                </span>
                                                <span className="text-[10px] text-indigo-500 font-black shrink-0">
                                                    {p.basePrice ? `${Number(p.basePrice).toLocaleString()} F` : ''}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {results.categories.length > 0 && (
                                <div>
                                    <p className="px-3 text-[10px] font-black uppercase tracking-wider text-amber-500 mb-1.5">
                                        Catégories
                                    </p>
                                    <div className="space-y-1">
                                        {results.categories.map((c) => (
                                            <button
                                                key={c.id}
                                                onClick={() => go('/admin/categories')}
                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                                                    isDark ? 'hover:bg-white/5 text-gray-200' : 'hover:bg-slate-100 text-slate-700'
                                                }`}
                                            >
                                                <span className="flex items-center gap-2.5 truncate">
                                                    <Layers size={14} className="text-amber-500 shrink-0" />
                                                    <span className="truncate">{c.name}</span>
                                                </span>
                                                <ArrowRight size={13} className="opacity-40" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {results.orders.length > 0 && (
                                <div>
                                    <p className="px-3 text-[10px] font-black uppercase tracking-wider text-purple-500 mb-1.5">
                                        Commandes
                                    </p>
                                    <div className="space-y-1">
                                        {results.orders.map((o) => (
                                            <button
                                                key={o.id}
                                                onClick={() => go('/admin/orders')}
                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                                                    isDark ? 'hover:bg-white/5 text-gray-200' : 'hover:bg-slate-100 text-slate-700'
                                                }`}
                                            >
                                                <span className="flex items-center gap-2.5 truncate">
                                                    <ShoppingCart size={14} className="text-purple-500 shrink-0" />
                                                    <span className="truncate">
                                                        #{o.orderNumber || o.id} — {o.customerName || o.userName || 'Client'}
                                                    </span>
                                                </span>
                                                <span className="text-[10px] text-slate-400">{o.status}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {results.users.length > 0 && (
                                <div>
                                    <p className="px-3 text-[10px] font-black uppercase tracking-wider text-cyan-500 mb-1.5">
                                        Clients &amp; Utilisateurs
                                    </p>
                                    <div className="space-y-1">
                                        {results.users.map((u) => (
                                            <button
                                                key={u.id}
                                                onClick={() => go('/admin/users')}
                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                                                    isDark ? 'hover:bg-white/5 text-gray-200' : 'hover:bg-slate-100 text-slate-700'
                                                }`}
                                            >
                                                <span className="flex items-center gap-2.5 truncate">
                                                    <Users size={14} className="text-cyan-500 shrink-0" />
                                                    <span className="truncate">{u.username || u.firstName} ({u.email})</span>
                                                </span>
                                                <span className="text-[10px] text-slate-400">{u.role}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminGlobalSearch;
