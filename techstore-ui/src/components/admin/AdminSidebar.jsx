import React from 'react';
import {
    LayoutDashboard, Box, Users, ShoppingCart,
    BarChart3, Settings, Sun, Moon,
    ChevronLeft, ChevronRight, X, Layers, Truck,
    PackagePlus, LogOut, Globe, Lock, Flame,
    LayoutGrid, Star, Clock, FileText, Info
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useStockConfig } from '../../context/StockConfigContext';
import logoImg from '../../assets/logo.jpeg';

// ─── COMPOSANT AVATAR AVEC CERCEAUX ──────────────────────────────
export const UserAvatar = ({ user, isAdmin, size = 36 }) => {
    const initiale = user?.username?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || 'A';

    if (isAdmin) {
        return (
            <div className="relative shrink-0" style={{ width: size + 6, height: size + 6 }}>
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
            { icon: <LayoutGrid size={20} />, label: 'Collections',   path: '/admin/collections' },
            { icon: <Layers size={20} />,     label: 'Catégories',    path: '/admin/categories' },
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
            { icon: <Star size={20} />,         label: 'Avis & Commentaires', path: '/admin/stats', iconClass: 'text-yellow-500' },
            { icon: <BarChart3 size={20} />,    label: 'Rapports & Analyses', path: '/admin/stats' },
        ]
    },
    {
        label: 'Paramètres & Contenu',
        items: [
            { icon: <Settings size={20} />,   label: 'Paramètres',    path: '/admin/settings' },
            { icon: <FileText size={20} />,   label: 'À propos (CMS)', path: '/admin/about' },
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
        ${isDark ? 'bg-[#0f121d] border-white/5' : 'bg-white border-gray-200'}
    `;

    return (
        <>
            {isMobileOpen && (
                <div onClick={() => setIsMobileOpen(false)}
                    className="fixed inset-0 bg-black/60 z-[140] lg:hidden backdrop-blur-sm animate-in fade-in duration-300" />
            )}

            <aside style={{ width: `${width}px` }} className={sidebarClasses}>

                <button onClick={toggleCollapse}
                    className="hidden lg:flex absolute -right-3 top-20 bg-indigo-600 text-white rounded-full p-1 shadow-lg z-50 hover:scale-110 transition-transform">
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>

                {/* ── LOGO ── */}
                <div className={`px-4 py-5 flex items-center justify-between border-b ${isDark ? 'border-white/5' : 'border-gray-100'} shrink-0`}>
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-white/5 border border-white/10 p-0.5 shadow-lg shadow-indigo-500/20 shrink-0">
                            <img src={logoImg} alt="DAKORA BUSINESS" className="w-full h-full object-contain rounded-lg"
                                onError={e => { e.target.src = '/logo.png'; }} />
                        </div>
                        {(!isCollapsed || isMobileOpen) && (
                            <div className="flex flex-col min-w-0">
                                <span className={`text-sm font-black tracking-tighter leading-none truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                    DAKORA BUSINESS
                                </span>
                                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest leading-none mt-1">
                                    Administration
                                </span>
                            </div>
                        )}
                    </div>
                    <button onClick={() => setIsMobileOpen(false)} className="lg:hidden p-1 opacity-50">
                        <X size={18} />
                    </button>
                </div>

                {/* ── NAVIGATION ── */}
                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
                    {MENU_GROUPS.map((group, groupIdx) => (
                        <div key={groupIdx} className="space-y-1">
                            {(!isCollapsed || isMobileOpen) && (
                                <p className={`px-3 text-[10px] font-black uppercase tracking-wider mb-2 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
                                    {group.label}
                                </p>
                            )}

                            {group.items.map((item, itemIdx) => {
                                const isActive = location.pathname === item.path ||
                                    (item.path !== '/admin' && location.pathname.startsWith(item.path));

                                const isBlocked = item.isBlockedKey && stockConfig.requiresConfig && !stockConfig.isConfigured;

                                if (isBlocked) {
                                    return (
                                        <div
                                            key={itemIdx}
                                            onClick={() => navigate('/admin/settings?tab=stock')}
                                            title="Stock désactivé : Cliquez pour configurer"
                                            className={`
                                                w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer opacity-50
                                                ${isDark ? 'hover:bg-white/5 text-gray-500' : 'hover:bg-gray-100 text-slate-400'}
                                                ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''}
                                            `}
                                        >
                                            <div className="relative shrink-0">
                                                {item.icon}
                                                <Lock size={10} className="absolute -top-1 -right-1 text-amber-500" />
                                            </div>
                                            {(!isCollapsed || isMobileOpen) && (
                                                <span className="truncate flex-1 text-left">{item.label}</span>
                                            )}
                                        </div>
                                    );
                                }

                                return (
                                    <Link
                                        key={itemIdx}
                                        to={item.path}
                                        title={isCollapsed ? item.label : undefined}
                                        className={`
                                            w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all relative
                                            ${isActive
                                                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                                                : isDark
                                                    ? 'text-gray-400 hover:text-white hover:bg-white/5'
                                                    : 'text-slate-600 hover:text-slate-900 hover:bg-gray-100'
                                            }
                                            ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''}
                                        `}
                                    >
                                        <span className={`shrink-0 ${item.iconClass || ''}`}>
                                            {item.icon}
                                        </span>
                                        {(!isCollapsed || isMobileOpen) && (
                                            <span className="truncate">{item.label}</span>
                                        )}
                                        {isActive && !isCollapsed && (
                                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* ── FOOTER / UTILISATEUR ── */}
                <div className={`p-3 border-t ${isDark ? 'border-white/5 bg-[#0b0e14]/50' : 'border-gray-100 bg-gray-50'} shrink-0 space-y-2`}>
                    {/* Bascule Mode Sombre */}
                    <button
                        onClick={toggleTheme}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-bold transition-all ${
                            isDark ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-200 text-slate-600'
                        } ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''}`}
                    >
                        {isDark ? <Sun size={18} className="text-amber-400 shrink-0" /> : <Moon size={18} className="text-indigo-600 shrink-0" />}
                        {(!isCollapsed || isMobileOpen) && <span>{isDark ? 'Mode Clair' : 'Mode Sombre'}</span>}
                    </button>

                    {/* Carte Utilisateur */}
                    <div className={`flex items-center gap-2.5 p-2 rounded-2xl ${isDark ? 'bg-white/5 border border-white/5' : 'bg-white border border-gray-100'} ${isCollapsed && !isMobileOpen ? 'justify-center p-1' : ''}`}>
                        <UserAvatar user={user} isAdmin={isAdmin} size={28} />
                        {(!isCollapsed || isMobileOpen) && (
                            <div className="flex-1 min-w-0">
                                <p className={`text-xs font-black truncate leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                    {user?.username || user?.name || 'Admin'}
                                </p>
                                <p className="text-[10px] text-gray-500 truncate leading-tight mt-0.5">
                                    {isAdmin ? 'Administrateur' : 'Gestionnaire'}
                                </p>
                            </div>
                        )}
                        {(!isCollapsed || isMobileOpen) && (
                            <button
                                onClick={logout}
                                title="Se déconnecter"
                                className="p-1.5 rounded-xl hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                            >
                                <LogOut size={14} />
                            </button>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;
