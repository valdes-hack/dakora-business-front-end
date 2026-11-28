import React from 'react';
import {
    LayoutDashboard, Box, Users, ShoppingCart,
    BarChart3, Settings, Sun, Moon,
    ChevronLeft, ChevronRight, X, Layers, Truck,
    PackagePlus, LogOut, Globe, Lock, Flame,
    LayoutGrid, Star, Clock
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useStockConfig } from '../../context/StockConfigContext';

// ─── COMPOSANT AVATAR AVEC CERCEAUX ──────────────────────────────
const UserAvatar = ({ user, isAdmin, size = 36 }) => {
    const initiale = user?.username?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || 'A';

    if (isAdmin) {
        // Cerceau arc-en-ciel animé pour l'admin
        return (
            <div className="relative shrink-0" style={{ width: size + 6, height: size + 6 }}>
                {/* Anneau arc-en-ciel */}
                <svg
                    className="absolute inset-0 animate-spin"
                    style={{ animationDuration: '3s', width: size + 6, height: size + 6 }}
                    viewBox={`0 0 ${size + 6} ${size + 6}`}
                >
                    <defs>
                        <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%"   stopColor="#ff0080" />
                            <stop offset="20%"  stopColor="#ff8800" />
                            <stop offset="40%"  stopColor="#ffff00" />
                            <stop offset="60%"  stopColor="#00ff88" />
                            <stop offset="80%"  stopColor="#0088ff" />
                            <stop offset="100%" stopColor="#8800ff" />
                        </linearGradient>
                    </defs>
                    <circle
                        cx={(size + 6) / 2}
                        cy={(size + 6) / 2}
                        r={(size + 6) / 2 - 1.5}
                        fill="none"
                        stroke="url(#rainbow)"
                        strokeWidth="2.5"
                        strokeDasharray="80 20"
                        strokeLinecap="round"
                    />
                </svg>
                {/* Avatar */}
                <div
                    className="absolute bg-indigo-600 flex items-center justify-center text-white font-black rounded-full overflow-hidden shadow-md"
                    style={{ inset: 3, fontSize: size * 0.38 }}
                >
                    {user?.avatarUrl
                        ? <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                        : initiale}
                </div>
            </div>
        );
    }

    // Cerceau vert pour les autres rôles
    return (
        <div className="relative shrink-0" style={{ width: size + 6, height: size + 6 }}>
            <div
                className="absolute rounded-full"
                style={{ inset: 0, background: 'conic-gradient(#10b981, #34d399, #10b981)', opacity: 0.9 }}
            />
            <div
                className="absolute bg-slate-700 dark:bg-[#161926] flex items-center justify-center text-white font-black rounded-full overflow-hidden shadow-md"
                style={{ inset: 3, fontSize: size * 0.38 }}
            >
                {user?.avatarUrl
                    ? <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                    : initiale}
            </div>
        </div>
    );
};

// ─── GROUPES DE LA SIDEBAR ────────────────────────────────────────
const MENU_GROUPS = [
    {
        label: 'Principal',
        items: [
            { icon: <LayoutDashboard size={20} />, label: 'Dashboard',    path: '/admin' },
        ]
    },
    {
        label: 'Catalogue',
        items: [
            { icon: <Box size={20} />,        label: 'Produits',      path: '/admin/products' },
            { icon: <Layers size={20} />,     label: 'Catégories',    path: '/admin/categories' },
            { icon: <LayoutGrid size={20} />, label: 'Collections',   path: '/admin/collections' },
            { icon: <Flame size={20} />,       label: 'Promotions',    path: '/admin/promotions', iconClass: 'text-red-500' },
        ]
    },
    {
        label: 'Inventaire',
        items: [
            {
                icon: <PackagePlus size={20} />,
                label: 'Ravitaillement',
                path: '/admin/stock',
                isBlockedKey: true
            },
            { icon: <Truck size={20} />,      label: 'Fournisseurs',  path: '/admin/suppliers' },
        ]
    },
    {
        label: 'Clients & Ventes',
        items: [
            { icon: <ShoppingCart size={20} />, label: 'Commandes',   path: '/admin/orders' },
            { icon: <Users size={20} />,        label: 'Clients',     path: '/admin/users' },
            { icon: <Star size={20} />,         label: 'Avis produits', path: '/admin/stats', iconClass: 'text-yellow-500' },
        ]
    },
    {
        label: 'Analyse',
        items: [
            { icon: <BarChart3 size={20} />,  label: 'Statistiques',  path: '/admin/stats' },
            { icon: <Clock size={20} />,       label: 'Historique',   path: '/admin/history' },
        ]
    },
    {
        label: 'Configuration',
        items: [
            { icon: <Settings size={20} />,   label: 'Paramètres',    path: '/admin/settings' },
        ]
    },
];

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────
const AdminSidebar = ({ width, setWidth, isMobileOpen, setIsMobileOpen }) => {
    const { theme, toggleTheme } = useTheme();
    const { logout, user } = useAuth();
    const { stockConfig } = useStockConfig();
    const location = useLocation();
    const navigate = useNavigate();
    const isCollapsed = width < 140;
    const isDark = theme === 'dark';

    const isAdmin = user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN';

    const toggleCollapse = () => setWidth(isCollapsed ? 260 : 80);

    const sidebarClasses = `
        fixed lg:relative z-[150] h-full transition-all duration-300 border-r flex flex-col
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isDark ? 'bg-[#111421] border-white/5' : 'bg-white border-gray-200'}
    `;

    return (
        <>
            {/* Overlay mobile */}
            {isMobileOpen && (
                <div onClick={() => setIsMobileOpen(false)}
                    className="fixed inset-0 bg-black/60 z-[140] lg:hidden backdrop-blur-sm animate-in fade-in duration-300" />
            )}

            <aside style={{ width: `${width}px` }} className={sidebarClasses}>

                {/* Bouton réduire/étendre (desktop) */}
                <button onClick={toggleCollapse}
                    className="hidden lg:flex absolute -right-3 top-20 bg-indigo-600 text-white rounded-full p-1 shadow-lg z-50 hover:scale-110 transition-transform">
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>

                {/* ── LOGO ── */}
                <div className={`px-4 py-5 flex items-center justify-between border-b ${isDark ? 'border-white/5' : 'border-gray-100'} shrink-0`}>
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center bg-indigo-500/10 p-0.5 shadow-lg shadow-indigo-500/20 shrink-0">
                            <img src="/logo.png" alt="PEOC" className="w-full h-full object-contain rounded-lg"
                                onError={e => { e.target.style.display = 'none'; }} />
                        </div>
                        {(!isCollapsed || isMobileOpen) && (
                            <div className="flex flex-col min-w-0">
                                <span className={`text-sm font-black tracking-tighter leading-none truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                    PEOC
                                </span>
                                <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest leading-none mt-1">
                                    Administration
                                </span>
                            </div>
                        )}
                    </div>
                    <button onClick={() => setIsMobileOpen(false)} className="lg:hidden p-1 opacity-50">
                        <X size={18} />
                    </button>
                </div>

                {/* ── NAVIGATION PAR GROUPES ── */}
                <nav className="flex-1 overflow-y-auto custom-scrollbar px-2 py-3 space-y-4">
                    {MENU_GROUPS.map(group => {
                        // Filtrer les items qui ne font rien (pas de page encore)
                        const visibleItems = group.items;

                        return (
                            <div key={group.label}>
                                {/* Label du groupe (masqué si sidebar réduite) */}
                                {(!isCollapsed || isMobileOpen) && (
                                    <p className={`text-[9px] font-black uppercase tracking-[0.15em] px-3 mb-1.5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                                        {group.label}
                                    </p>
                                )}
                                <div className="space-y-0.5">
                                    {visibleItems.map(item => {
                                        const isBlocked = item.isBlockedKey && !stockConfig.manageStockViaSupply;
                                        const isCurrent = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));

                                        return (
                                            <Link
                                                key={item.path}
                                                to={item.path}
                                                onClick={() => setIsMobileOpen(false)}
                                                title={isBlocked ? 'Désactivé dans Paramètres > Stocks' : item.label}
                                                className={`flex items-center rounded-xl p-2.5 transition-all relative group
                                                    ${isBlocked
                                                        ? 'opacity-40 hover:opacity-70 border border-dashed border-red-500/30 text-red-400'
                                                        : isCurrent
                                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                                            : isDark
                                                                ? 'text-gray-500 hover:text-gray-200 hover:bg-white/5'
                                                                : 'text-slate-500 hover:text-slate-800 hover:bg-gray-50'
                                                    }
                                                    ${isCollapsed && !isMobileOpen ? 'justify-center' : 'gap-3'}
                                                `}
                                            >
                                                {/* Icône */}
                                                <span className={`shrink-0 ${item.iconClass || ''} ${isCurrent ? 'text-white' : ''}`}>
                                                    {React.cloneElement(item.icon, {
                                                        className: `${isCurrent ? 'text-white' : item.iconClass || ''}`
                                                    })}
                                                </span>
                                                {/* Label */}
                                                {(!isCollapsed || isMobileOpen) && (
                                                    <span className={`text-sm font-semibold truncate flex-1 ${isBlocked ? 'line-through' : ''}`}>
                                                        {item.label}
                                                    </span>
                                                )}
                                                {/* Badge bloqué */}
                                                {isBlocked && (!isCollapsed || isMobileOpen) && (
                                                    <Lock size={10} className="text-red-400 shrink-0" />
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </nav>

                {/* ── FOOTER ── */}
                <div className={`px-2 py-3 border-t space-y-0.5 shrink-0 ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                    {/* Retour au site */}
                    <Link to="/"
                        className={`flex items-center rounded-xl p-2.5 text-emerald-500 hover:bg-emerald-500/10 transition-all
                            ${isCollapsed && !isMobileOpen ? 'justify-center' : 'gap-3'}`}>
                        <Globe size={18} />
                        {(!isCollapsed || isMobileOpen) && <span className="text-sm font-semibold">Retour au site</span>}
                    </Link>

                    {/* Toggle thème */}
                    <button onClick={toggleTheme}
                        className={`w-full flex items-center rounded-xl p-2.5 transition-all
                            ${isDark ? 'text-yellow-400 hover:bg-white/5' : 'text-indigo-600 hover:bg-gray-50'}
                            ${isCollapsed && !isMobileOpen ? 'justify-center' : 'gap-3'}`}>
                        {isDark ? <Sun size={18} /> : <Moon size={18} />}
                        {(!isCollapsed || isMobileOpen) && (
                            <span className="text-sm font-semibold">Mode {isDark ? 'Clair' : 'Sombre'}</span>
                        )}
                    </button>

                    {/* Déconnexion */}
                    <button onClick={() => { logout(); navigate('/login'); }}
                        className={`w-full flex items-center rounded-xl p-2.5 text-red-400 hover:bg-red-500/10 transition-all
                            ${isCollapsed && !isMobileOpen ? 'justify-center' : 'gap-3'}`}>
                        <LogOut size={18} />
                        {(!isCollapsed || isMobileOpen) && <span className="text-sm font-semibold">Déconnexion</span>}
                    </button>

                    {/* Profil utilisateur */}
                    <div className={`mt-2 p-2.5 rounded-xl flex items-center ${isDark ? 'bg-white/3' : 'bg-gray-50'}
                        ${isCollapsed && !isMobileOpen ? 'justify-center' : 'gap-3'}`}>
                        <UserAvatar user={user} isAdmin={isAdmin} size={32} />
                        {(!isCollapsed || isMobileOpen) && (
                            <div className="min-w-0 flex-1">
                                <p className={`text-xs font-black truncate uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    {user?.username || user?.name || 'Admin'}
                                </p>
                                <p className={`text-[10px] truncate ${isAdmin ? 'text-indigo-400' : 'text-emerald-400'} font-bold`}>
                                    {isAdmin ? 'Administrateur' : (user?.role || 'Membre')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Poignée redimensionnement desktop */}
                <div
                    onMouseDown={e => {
                        const onMove = mv => setWidth(Math.max(80, Math.min(mv.clientX, 350)));
                        const onUp = () => window.removeEventListener('mousemove', onMove);
                        window.addEventListener('mousemove', onMove);
                        window.addEventListener('mouseup', onUp);
                    }}
                    className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-indigo-500 transition-all hidden lg:block"
                />
            </aside>
        </>
    );
};

export { UserAvatar };
export default AdminSidebar;
