import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    Search, ShoppingBag, User, Menu, X, ChevronDown, Package,
    Sun, Moon, Settings, LogOut, ClipboardList, Truck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '../../assets/logo.jpeg';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import ProductService from '../../services/product.service';
import NotificationBell from '../admin/NotificationBell';
import { useTheme } from '../../context/ThemeContext';
import { useAppContext } from '../../context/AppContext';
import SpotlightSearch from './SpotlightSearch';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isProductsOpen, setIsProductsOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [categories, setCategories] = useState([]);

    const { isAuthenticated, user, isAdmin, logout } = useAuth();
    const { setIsOpen, cart } = useCart();
    const { settings } = useAppContext();
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 12);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const fetchCats = async () => {
            try {
                const res = await ProductService.getCategories();
                if (res && res.data) setCategories(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchCats();
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Fermer les menus au changement de route
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsProductsOpen(false);
        setIsUserMenuOpen(false);
    }, [location.pathname]);

    // Fermer le dropdown profil au clic extérieur
    useEffect(() => {
        if (!isUserMenuOpen) return;
        const close = () => setIsUserMenuOpen(false);
        window.addEventListener('click', close);
        return () => window.removeEventListener('click', close);
    }, [isUserMenuOpen]);

    // Bloquer scroll body quand menu mobile ouvert
    useEffect(() => {
        document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isMobileMenuOpen]);

    if (location.pathname.startsWith('/admin')) return null;

    const isDark = theme === 'dark';
    const rawSiteName = settings?.siteName || 'DAKORA BUSINESS';
    const siteName =
        rawSiteName &&
        !rawSiteName.toUpperCase().includes('ELECTRONIQUE') &&
        !rawSiteName.toUpperCase().includes('TECHSTORE')
            ? rawSiteName
            : 'DAKORA BUSINESS';

    const displayName = user?.firstName || user?.username || user?.name || 'Mon compte';
    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.username || user?.name || 'Utilisateur';
    const userInitial = (displayName[0] || 'U').toUpperCase();

    const navLinks = [
        { to: '/', label: 'Accueil' },
        { to: '/catalog', label: 'Boutique' },
        { to: '/collections', label: 'Collections' },
        { to: '/promotions', label: 'Promos 🔥' },
        { to: '/a-propos', label: 'À propos' },
    ];

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-[100] transition-all duration-300 px-0 md:px-5 pt-0 md:pt-3">
                <nav
                    className={`mx-auto max-w-[1380px] transition-all duration-300 border ${
                        isScrolled
                            ? 'md:rounded-2xl bg-white/95 dark:bg-[#0d101b]/95 backdrop-blur-xl border-slate-200/80 dark:border-white/10 shadow-xl shadow-black/5 dark:shadow-black/40 py-2.5 px-4 md:px-6'
                            : 'md:rounded-2xl bg-white/90 dark:bg-[#0d101b]/85 backdrop-blur-lg border-slate-200/60 dark:border-white/10 shadow-md shadow-black/5 py-2.5 px-4 md:px-6'
                    }`}
                >
                    <div className="flex items-center justify-between gap-3">

                        {/* ── 1. LOGO & IDENTITÉ (shrink-0 pour zéro superposition) ── */}
                        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
                            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl overflow-hidden flex items-center justify-center bg-white dark:bg-[#161926] border border-slate-200 dark:border-white/10 shadow-sm group-hover:scale-105 transition-transform p-0.5 shrink-0">
                                <img
                                    src={logoImg}
                                    alt={siteName}
                                    className="w-full h-full object-contain rounded-lg"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            </div>
                            <div className="hidden sm:flex flex-col min-w-0">
                                <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none whitespace-nowrap">
                                    {siteName}
                                </span>
                                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 tracking-wide leading-none mt-1 whitespace-nowrap">
                                    Élevage &amp; Agro-business
                                </span>
                            </div>
                        </Link>

                        {/* ── 2. NAVIGATION CENTRALE DESKTOP ── */}
                        <div className="hidden lg:flex items-center gap-0.5 bg-slate-100/90 dark:bg-white/[0.04] rounded-full px-1.5 py-1 border border-slate-200/70 dark:border-white/5 shrink-0">
                            {navLinks.map(({ to, label }) => {
                                const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
                                return (
                                    <Link
                                        key={to}
                                        to={to}
                                        className={`px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all rounded-full whitespace-nowrap ${
                                            active
                                                ? 'text-indigo-600 dark:text-white bg-white dark:bg-indigo-600 shadow-sm'
                                                : 'text-slate-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/5'
                                        }`}
                                    >
                                        {label}
                                    </Link>
                                );
                            })}

                            {/* Dropdown Rayons */}
                            <div
                                className="relative"
                                onMouseEnter={() => setIsProductsOpen(true)}
                                onMouseLeave={() => setIsProductsOpen(false)}
                            >
                                <button className="flex items-center gap-1 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-white transition-colors rounded-full whitespace-nowrap">
                                    Rayons
                                    <ChevronDown size={13} className={`transition-transform duration-300 ${isProductsOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {isProductsOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 8 }}
                                            transition={{ duration: 0.18 }}
                                            className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-[#161926] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 p-2 overflow-hidden z-50"
                                        >
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 px-3 pt-2 pb-1.5">
                                                Nos Rayons
                                            </p>
                                            <div className="max-h-72 overflow-y-auto custom-scrollbar">
                                                {categories.map((cat) => (
                                                    <Link
                                                        key={cat.id}
                                                        to={`/category/${cat.slug}`}
                                                        onClick={() => setIsProductsOpen(false)}
                                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-xs font-bold text-slate-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-white transition-all"
                                                    >
                                                        {cat.iconUrl ? (
                                                            cat.iconUrl.startsWith('bx') ? (
                                                                <i className={`${cat.iconUrl} text-base text-indigo-500 shrink-0`} />
                                                            ) : cat.iconUrl.startsWith('http') || cat.iconUrl.startsWith('/') ? (
                                                                <img src={cat.iconUrl} className="w-5 h-5 object-cover rounded-md shrink-0" alt="" />
                                                            ) : (
                                                                <span className="text-base shrink-0 select-none">{cat.iconUrl}</span>
                                                            )
                                                        ) : (
                                                            <Package size={15} className="text-indigo-500 shrink-0" />
                                                        )}
                                                        <span className="truncate">{cat.name}</span>
                                                    </Link>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* ── 3. RECHERCHE COMPACTE (tablette & desktop) ── */}
                        <button
                            type="button"
                            onClick={() => setIsSearchOpen(true)}
                            className="hidden md:flex flex-1 max-w-[230px] xl:max-w-[270px] items-center justify-between gap-2 bg-slate-100/90 dark:bg-white/[0.05] hover:bg-slate-200/70 dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-500 dark:text-gray-400 transition-all cursor-pointer"
                        >
                            <span className="flex items-center gap-2 truncate">
                                <Search size={15} className="text-slate-400 dark:text-gray-400 shrink-0" />
                                <span className="truncate">Rechercher...</span>
                            </span>
                            <span className="hidden xl:inline-flex items-center gap-0.5 text-[10px] font-bold bg-white dark:bg-white/10 text-slate-500 dark:text-gray-300 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-white/10 shrink-0">
                                ⌘K
                            </span>
                        </button>

                        {/* ── 4. ACTIONS DROITE ── */}
                        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

                            {/* Recherche icône — mobile uniquement */}
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white border border-slate-200/70 dark:border-white/10 transition-colors"
                                aria-label="Rechercher"
                            >
                                <Search size={18} />
                            </button>

                            {/* Toggle Thème */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200/70 dark:hover:bg-white/10 transition-all text-slate-700 dark:text-white border border-slate-200/70 dark:border-white/10"
                                aria-label="Changer le thème"
                                title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
                            >
                                {isDark ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-indigo-600" />}
                            </button>

                            {/* Admin — tablette+ */}
                            {isAdmin() && (
                                <Link
                                    to="/admin"
                                    className="hidden sm:flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white px-3 py-2 rounded-xl font-bold text-[11px] transition-all border border-indigo-200/80 dark:border-indigo-500/25 uppercase tracking-wider whitespace-nowrap"
                                >
                                    <Settings size={14} />
                                    <span className="hidden xl:inline">Gestion</span>
                                </Link>
                            )}

                            {/* Notifications admin */}
                            {isAdmin() && (
                                <div className="relative hidden sm:block">
                                    <NotificationBell theme={theme} />
                                </div>
                            )}

                            {/* Panier */}
                            <button
                                onClick={() => setIsOpen(true)}
                                className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200/70 dark:hover:bg-white/10 transition-all text-slate-700 dark:text-white relative border border-slate-200/70 dark:border-white/10"
                                aria-label="Panier"
                            >
                                <ShoppingBag size={18} />
                                {cart?.totalItems > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-black shadow-md ring-2 ring-white dark:ring-[#0d101b]">
                                        {cart.totalItems > 9 ? '9+' : cart.totalItems}
                                    </span>
                                )}
                            </button>

                            {/* Profil Utilisateur Professionnel (desktop & tablette) */}
                            {isAuthenticated ? (
                                <div className="relative hidden sm:block" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={() => setIsUserMenuOpen((prev) => !prev)}
                                        className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full bg-slate-100/90 dark:bg-white/[0.06] hover:bg-slate-200/80 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-all"
                                    >
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center text-xs font-black shadow-sm overflow-hidden shrink-0 ring-2 ring-indigo-500/20">
                                            {user?.avatarUrl ? (
                                                <img src={user.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                                            ) : (
                                                userInitial
                                            )}
                                        </div>
                                        <div className="hidden md:flex flex-col items-start text-left min-w-0">
                                            <span className="text-xs font-bold text-slate-800 dark:text-white leading-none truncate max-w-[95px]">
                                                {displayName}
                                            </span>
                                            <span className="text-[9px] font-semibold text-indigo-600 dark:text-indigo-400 leading-none mt-0.5">
                                                {isAdmin() ? 'Admin' : 'Client'}
                                            </span>
                                        </div>
                                        <ChevronDown
                                            size={14}
                                            className={`text-slate-400 dark:text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}
                                        />
                                    </button>

                                    <AnimatePresence>
                                        {isUserMenuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute right-0 top-full mt-2 w-60 bg-white dark:bg-[#161926] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden z-50"
                                            >
                                                <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5 flex items-center gap-3 bg-slate-50/70 dark:bg-white/[0.02]">
                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center text-sm font-black shrink-0 overflow-hidden">
                                                        {user?.avatarUrl ? (
                                                            <img src={user.avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                                                        ) : (
                                                            userInitial
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-black text-slate-900 dark:text-white truncate">{fullName}</p>
                                                        <p className="text-[11px] text-slate-500 dark:text-gray-400 truncate">
                                                            {user?.email || 'Compte client'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="p-1.5 space-y-0.5">
                                                    <Link
                                                        to="/profile"
                                                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-white/5 hover:text-indigo-600 dark:hover:text-white transition-colors"
                                                    >
                                                        <User size={15} className="text-indigo-500" /> Mon Profil
                                                    </Link>
                                                    <Link
                                                        to="/my-orders"
                                                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-white/5 hover:text-indigo-600 dark:hover:text-white transition-colors"
                                                    >
                                                        <ClipboardList size={15} className="text-blue-500" /> Mes Commandes
                                                    </Link>
                                                    <Link
                                                        to="/track"
                                                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-white/5 hover:text-indigo-600 dark:hover:text-white transition-colors"
                                                    >
                                                        <Truck size={15} className="text-emerald-500" /> Suivre un colis
                                                    </Link>
                                                    {isAdmin() && (
                                                        <Link
                                                            to="/admin"
                                                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                                                        >
                                                            <Settings size={15} /> Espace Admin
                                                        </Link>
                                                    )}
                                                    <div className="h-px bg-slate-100 dark:bg-white/5 my-1" />
                                                    <button
                                                        onClick={() => { setIsUserMenuOpen(false); logout(); navigate('/'); }}
                                                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                                    >
                                                        <LogOut size={15} /> Se déconnecter
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <Link
                                    to="/login"
                                    className="hidden sm:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-full font-bold text-xs transition-all shadow-md shadow-indigo-600/20 whitespace-nowrap"
                                >
                                    <User size={14} />
                                    <span>Connexion</span>
                                </Link>
                            )}

                            {/* Burger menu — mobile uniquement */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-white border border-slate-200/70 dark:border-white/10 transition-colors"
                                aria-label={isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                            >
                                <AnimatePresence mode="wait" initial={false}>
                                    <motion.div
                                        key={isMobileMenuOpen ? 'close' : 'open'}
                                        initial={{ rotate: -90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: 90, opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                                    </motion.div>
                                </AnimatePresence>
                            </button>
                        </div>
                    </div>
                </nav>
            </header>

            {/* ══════════════════════════════════════
                MENU MOBILE — DRAWER
            ══════════════════════════════════════ */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            key="mobile-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm lg:hidden"
                        />

                        <motion.div
                            key="mobile-menu"
                            initial={{ opacity: 0, y: -16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.22, ease: 'easeOut' }}
                            className={`fixed top-0 left-0 right-0 z-[95] lg:hidden pt-20 pb-8 px-5 rounded-b-[2rem] border-b shadow-2xl max-h-[90vh] overflow-y-auto ${
                                isDark
                                    ? 'bg-[#0d1019] border-white/10'
                                    : 'bg-white border-slate-200'
                            }`}
                        >
                            {/* Liens principaux */}
                            <div className="space-y-1 mb-5">
                                {navLinks.map(({ to, label }) => {
                                    const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
                                    return (
                                        <Link
                                            key={to}
                                            to={to}
                                            className={`flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm uppercase tracking-wider transition-colors ${
                                                active
                                                    ? 'bg-indigo-600 text-white'
                                                    : isDark
                                                        ? 'text-white/80 hover:bg-white/5'
                                                        : 'text-slate-800 hover:bg-slate-100'
                                            }`}
                                        >
                                            {label}
                                            {active && <span className="w-1.5 h-1.5 rounded-full bg-white/70" />}
                                        </Link>
                                    );
                                })}

                                {/* Rayons (accordéon mobile) */}
                                <div>
                                    <button
                                        onClick={() => setIsProductsOpen(!isProductsOpen)}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm uppercase tracking-wider transition-colors ${
                                            isDark ? 'text-white/80 hover:bg-white/5' : 'text-slate-800 hover:bg-slate-100'
                                        }`}
                                    >
                                        Rayons
                                        <ChevronDown size={16} className={`transition-transform duration-300 ${isProductsOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {isProductsOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <div className={`mx-2 mt-1 mb-2 rounded-2xl overflow-hidden border ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                                                    {categories.map((cat) => (
                                                        <Link
                                                            key={cat.id}
                                                            to={`/category/${cat.slug}`}
                                                            className={`flex items-center gap-3 px-4 py-2.5 text-sm font-bold transition-colors ${
                                                                isDark
                                                                    ? 'text-white/70 hover:bg-white/5 hover:text-white'
                                                                    : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-600'
                                                            }`}
                                                        >
                                                            <Package size={14} className="text-indigo-500 shrink-0" />
                                                            <span className="truncate">{cat.name}</span>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            <div className={`h-px mb-5 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />

                            {/* Actions utilisateur */}
                            <div className="space-y-2.5">
                                <Link
                                    to={isAuthenticated ? '/profile' : '/login'}
                                    className="flex items-center gap-3 px-4 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:opacity-90 transition-all"
                                >
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 font-black">
                                        {isAuthenticated ? userInitial : <User size={16} />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate">{isAuthenticated ? fullName : 'Se connecter'}</p>
                                        {isAuthenticated && (
                                            <p className="text-[11px] text-indigo-200 truncate">Voir mon profil</p>
                                        )}
                                    </div>
                                </Link>

                                {isAuthenticated && (
                                    <Link
                                        to="/my-orders"
                                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm border ${
                                            isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                                        }`}
                                    >
                                        <ClipboardList size={16} className="text-blue-500" />
                                        Mes Commandes
                                    </Link>
                                )}

                                {isAdmin() && (
                                    <Link
                                        to="/admin"
                                        className="flex items-center gap-3 px-4 py-3 bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 rounded-2xl font-bold text-sm border border-indigo-500/20"
                                    >
                                        <Settings size={16} />
                                        Administration
                                    </Link>
                                )}

                                {isAuthenticated && (
                                    <button
                                        onClick={() => { logout(); navigate('/'); setIsMobileMenuOpen(false); }}
                                        className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl font-bold text-sm"
                                    >
                                        <LogOut size={16} />
                                        Se déconnecter
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Spotlight Search */}
            <SpotlightSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
};

export default Navbar;
