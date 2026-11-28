import React, { useState, useCallback, useEffect } from 'react';
import AdminSidebar, { UserAvatar } from './AdminSidebar';
import NotificationBell from './NotificationBell';
import AdminGlobalSearch from './AdminGlobalSearch';
import { ListFilter, Menu, Sun, Moon, ChevronDown, LogOut, Settings, Search } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminLayout = ({ children, filters }) => {
    // ---------------------------------------------------------
    // 1. ÉTATS : STRUCTURE & RÉACTIVITÉ
    // ---------------------------------------------------------
    const [sideWidth, setSideWidth] = useState(260);
    const [filterWidth, setFilterWidth] = useState(320);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(true);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [isAdminSearchOpen, setIsAdminSearchOpen] = useState(false);

    const { theme, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const isDark = theme === 'dark';

    // Raccourci Ctrl+K / Cmd+K pour recherche globale admin
    useEffect(() => {
        const onKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setIsAdminSearchOpen(true);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    // Fermer le menu user en cliquant ailleurs
    useEffect(() => {
        if (!userMenuOpen) return;
        const close = () => setUserMenuOpen(false);
        window.addEventListener('click', close);
        return () => window.removeEventListener('click', close);
    }, [userMenuOpen]);

    // ---------------------------------------------------------
    // 2. LOGIQUE DE REDIMENSIONNEMENT DYNAMIQUE
    // ---------------------------------------------------------
    const startResizeLeft = useCallback((e) => {
        e.preventDefault();
        const onMove = (m) => {
            if (m.clientX >= 80 && m.clientX <= 400) setSideWidth(m.clientX);
        };
        const onUp = () => window.removeEventListener('mousemove', onMove);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    }, []);

    const startResizeRight = useCallback((e) => {
        e.preventDefault();
        const onMove = (m) => {
            const newWidth = window.innerWidth - m.clientX;
            if (newWidth >= 280 && newWidth <= 500) setFilterWidth(newWidth);
        };
        const onUp = () => window.removeEventListener('mousemove', onMove);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    }, []);

    // Responsive : Fermeture auto des filtres si l'écran est petit
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1280) setIsFilterOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className={`flex h-screen overflow-hidden transition-all duration-500 ${
            isDark ? 'bg-[#0b0e14] text-gray-300' : 'bg-[#f4f7fe] text-slate-700'
        }`}>
            
            {/* OVERLAY FLOU (Z-INDEX 140) */}
            {(isMobileNavOpen || (isFilterOpen && filters && window.innerWidth < 1024)) && (
                <div 
                    onClick={() => { setIsMobileNavOpen(false); setIsFilterOpen(false); }} 
                    className="fixed inset-0 bg-black/60 backdrop-blur-md z-[140] lg:hidden animate-in fade-in duration-300" 
                />
            )}
            
            {/* SEGMENT 1 : NAVIGATION GAUCHE */}
            <AdminSidebar 
                width={sideWidth} 
                setWidth={setSideWidth}
                onResize={startResizeLeft}
                isMobileOpen={isMobileNavOpen}
                setIsMobileOpen={setIsMobileNavOpen}
            />

            {/* SEGMENT 2 : ZONE CENTRALE (DASHBOARD) */}
            <div className="flex-1 flex flex-col min-w-0 relative h-full">
                
                {/* HEADER SUPÉRIEUR (GÉRER TEMPS RÉEL) */}
                <header className={`flex justify-between items-center p-4 lg:px-8 border-b transition-all ${
                    isDark ? 'bg-[#0b0e14]/50 border-white/5' : 'bg-white/80 border-slate-200'
                } backdrop-blur-md z-30`}>
                    
                    <div className="flex items-center space-x-4">
                        <button onClick={() => setIsMobileNavOpen(true)} className="lg:hidden p-2.5 bg-indigo-600/10 text-indigo-500 rounded-xl">
                            <Menu size={22}/>
                        </button>
                        <h1 className="font-black italic tracking-tighter text-indigo-500 text-xl sm:text-2xl select-none uppercase">AdminHub</h1>
                    </div>

                    {/* 🔍 BARRE DE RECHERCHE GLOBALE ADMIN */}
                    <button
                        type="button"
                        onClick={() => setIsAdminSearchOpen(true)}
                        className={`hidden md:flex items-center justify-between gap-3 flex-1 max-w-md mx-4 px-4 py-2 rounded-2xl border text-xs font-semibold transition-all cursor-pointer ${
                            isDark
                                ? 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                                : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200/70 hover:text-slate-800'
                        }`}
                    >
                        <span className="flex items-center gap-2.5 truncate">
                            <Search size={15} className="text-indigo-500 shrink-0" />
                            <span className="truncate">Rechercher dans l'admin (produits, collections, commandes...)</span>
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border shrink-0 ${
                            isDark ? 'bg-white/10 border-white/10 text-gray-300' : 'bg-white border-slate-200 text-slate-500'
                        }`}>
                            Ctrl K
                        </span>
                    </button>

                    <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
                        {/* 🔍 Bouton recherche mobile */}
                        <button
                            onClick={() => setIsAdminSearchOpen(true)}
                            className={`md:hidden p-2.5 rounded-xl border transition-all flex items-center justify-center ${
                                isDark
                                    ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                            }`}
                            title="Rechercher dans l'admin"
                        >
                            <Search size={18} />
                        </button>
                        {/* 🌙 / ☀️ TOGGLE THÈME */}
                        <button
                            onClick={toggleTheme}
                            className={`p-2.5 rounded-xl border transition-all hover:scale-105 active:scale-95 flex items-center justify-center ${
                                isDark
                                    ? 'bg-white/5 border-white/10 text-yellow-400 hover:bg-white/10'
                                    : 'bg-slate-100 border-slate-200 text-indigo-600 hover:bg-slate-200'
                            }`}
                            title={`Passer en mode ${isDark ? 'Clair' : 'Sombre'}`}
                        >
                            {isDark ? <Sun size={18} /> : <Moon size={18} />}
                        </button>

                        {/* 🔔 NOTIFICATIONS */}
                        <NotificationBell />

                        {/* TOGGLE FILTRES */}
                        {filters && (
                            <button 
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${
                                    isFilterOpen 
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                                    : 'bg-indigo-600/10 text-indigo-500 hover:bg-indigo-600/20'
                                }`}
                            >
                                <ListFilter size={16} />
                                <span className="hidden sm:inline">{isFilterOpen ? 'Fermer' : 'Filtres'}</span>
                            </button>
                        )}

                        {/* 👤 PROFIL UTILISATEUR */}
                        <div className="relative" onClick={e => e.stopPropagation()}>
                            <button
                                onClick={() => setUserMenuOpen(p => !p)}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all hover:scale-105 ${
                                    isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                                }`}
                            >
                                {/* Avatar avec cerceau */}
                                <UserAvatar
                                    user={user}
                                    isAdmin={user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN'}
                                    size={30}
                                />
                                {/* Nom + rôle (masqué mobile) */}
                                <div className="hidden md:flex flex-col text-left min-w-0">
                                    <span className={`text-xs font-black truncate max-w-[100px] ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                        {user?.username || user?.name || 'Administrateur'}
                                    </span>
                                    <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider truncate">
                                        {user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN' ? 'Administrateur' : user?.role || 'Administrateur'}
                                    </span>
                                </div>
                                <ChevronDown size={14} className={`text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Menu déroulant profil */}
                            {userMenuOpen && (
                                <div className={`absolute right-0 top-full mt-2 w-52 rounded-2xl border shadow-2xl z-50 overflow-hidden ${
                                    isDark ? 'bg-[#161926] border-white/10' : 'bg-white border-gray-200'
                                }`}>
                                    <div className={`px-4 py-3 border-b flex items-center gap-3 ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                                        <UserAvatar
                                            user={user}
                                            isAdmin={user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN'}
                                            size={36}
                                        />
                                        <div>
                                            <p className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                                {user?.username || user?.name || 'Administrateur'}
                                            </p>
                                            <p className="text-[10px] text-indigo-500 font-bold">
                                                {user?.email || 'admin@peoc.cm'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="p-2">
                                        <button
                                            onClick={() => { setUserMenuOpen(false); navigate('/admin/settings'); }}
                                            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                                isDark ? 'text-gray-300 hover:bg-white/5 hover:text-white' : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            <Settings size={14} /> Paramètres
                                        </button>
                                        <button
                                            onClick={() => { logout(); navigate('/login'); }}
                                            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-all"
                                        >
                                            <LogOut size={14} /> Déconnexion
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* CONTENU DE LA PAGE (MAIN) */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 custom-scrollbar scroll-smooth">
                    {children}
                </main>
            </div>

            {/* SEGMENT 3 : PANNEAU DES FILTRES (DROIT) */}
            {filters && isFilterOpen && (
                <aside 
                    style={{ width: `${filterWidth}px` }}
                    className={`fixed lg:relative top-0 right-0 z-[150] h-full flex flex-col transition-all duration-300 border-l animate-in slide-in-from-right-full ${
                        isDark ? 'bg-[#111421] border-white/5 shadow-2xl' : 'bg-white border-gray-200 shadow-xl'
                    }`}
                >
                    {/* Poignée de redimensionnement Desktop */}
                    <div 
                        onMouseDown={startResizeRight} 
                        className="absolute left-0 top-0 w-1.5 h-full cursor-col-resize hover:bg-indigo-500 transition-colors hidden lg:block z-50" 
                    />
                    
                    <div className="p-8 flex flex-col h-full overflow-hidden">
                        {/* Injection dynamique de la logique de filtrage par page */}
                        {React.cloneElement(filters, { 
                            onClose: () => setIsFilterOpen(false)
                        })}
                    </div>
                </aside>
            )}
            <AdminGlobalSearch isOpen={isAdminSearchOpen} onClose={() => setIsAdminSearchOpen(false)} />
        </div>
    );
};

export default AdminLayout;