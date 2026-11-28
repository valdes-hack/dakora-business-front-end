import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ArrowRight, LayoutGrid, Sparkles, Trophy, Heart,
    Eye, Package, ChevronLeft, ChevronRight, MessageCircle,
    ArrowUp, Search, SlidersHorizontal, Check
} from 'lucide-react';
import CollectionService from '../../services/collection.service';
import ProductService from '../../services/product.service';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';

const BADGE_STYLES = [
    { label: 'Nouveau', bg: 'bg-blue-600 text-white' },
    { label: 'Promotion', bg: 'bg-red-600 text-white' },
    { label: 'Top Vente', bg: 'bg-emerald-600 text-white' },
    { label: 'Tendance', bg: 'bg-purple-600 text-white' }
];

const Collections = () => {
    const navigate = useNavigate();
    const { settings } = useAppContext();
    const { showToast } = useToast();

    const [collections, setCollections] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('popular');
    const [favorites, setFavorites] = useState(new Set());
    const [showScrollTop, setShowScrollTop] = useState(false);

    const categoriesContainerRef = useRef(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [colRes, catRes] = await Promise.all([
                    CollectionService.getAll(),
                    ProductService.getCategories()
                ]);

                if (colRes && (colRes.status === 'success' || Array.isArray(colRes.data))) {
                    const rawList = Array.isArray(colRes.data) ? colRes.data : [];
                    // Filtrer pour n'afficher publiquement que les collections actives et publiées
                    const publicList = rawList.filter(c => c.isActive !== false && c.isPublished !== false);
                    setCollections(publicList);
                }

                if (catRes && (catRes.status === 'success' || Array.isArray(catRes.data))) {
                    setCategories(catRes.data || []);
                }
            } catch (err) {
                console.error("Erreur chargement vitrine collections", err);
            } finally {
                setLoading(false);
            }
        };

        load();

        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleFavorite = (id, name) => {
        setFavorites(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
                showToast({ type: 'info', title: 'Favoris', message: `« ${name} » retirée de vos favoris` });
            } else {
                next.add(id);
                showToast({ type: 'success', title: 'Favoris', message: `« ${name} » ajoutée à vos favoris` });
            }
            return next;
        });
    };

    const scrollCategories = (direction) => {
        if (categoriesContainerRef.current) {
            const amount = direction === 'left' ? -250 : 250;
            categoriesContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
        }
    };

    // Tri des collections
    const sortedCollections = useMemo(() => {
        const list = [...collections];
        if (sortBy === 'popular') {
            return list.sort((a, b) => (b.sortOrder ?? 0) - (a.sortOrder ?? 0));
        }
        if (sortBy === 'name') {
            return list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        }
        if (sortBy === 'products') {
            return list.sort((a, b) => (b.productCount || 0) - (a.productCount || 0));
        }
        return list;
    }, [collections, sortBy]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8 mt-20">
                <div className="h-64 bg-gray-100 dark:bg-[#121526] rounded-[2.5rem] animate-pulse border border-white/5" />
                <div className="h-28 bg-gray-100 dark:bg-[#121526] rounded-2xl animate-pulse border border-white/5" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-72 bg-gray-100 dark:bg-[#121526] rounded-3xl animate-pulse border border-white/5" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="pb-20 bg-gray-50 dark:bg-[#0b0e14] transition-colors duration-500 overflow-x-hidden">

            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* 1. GRANDE BANNIÈRE COMMERCIALE (CONFORME À LA MAQUETTE 1)         */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#050e24] via-[#071c4a] to-[#061030] shadow-2xl px-8 sm:px-16 pt-24 sm:pt-28 pb-12 sm:pb-16 flex flex-col lg:flex-row items-center justify-between gap-8 min-h-[380px]">
                {/* Halos de lumière néon */}
                <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-indigo-600/15 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 max-w-xl text-left space-y-4">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                        <Sparkles size={13} className="text-blue-400" />
                        <span>Nos Collections</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                        Découvrez nos <br className="hidden sm:block" />
                        <span className="bg-gradient-to-r from-blue-400 via-indigo-200 to-white bg-clip-text text-transparent">
                            collections exceptionnelles
                        </span>
                    </h1>

                    <p className="text-xs sm:text-sm text-blue-200/80 font-medium leading-relaxed max-w-lg">
                        Une sélection soigneuse de produits pour tous vos besoins, à des prix imbattables et livrés partout au Cameroun.
                    </p>

                    <div className="pt-2 flex flex-wrap items-center gap-4">
                        <Link
                            to="/catalog"
                            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-600/40 hover:shadow-blue-600/60 transition-all active:scale-95"
                        >
                            <span>Explorer la boutique</span>
                            <ArrowRight size={15} />
                        </Link>

                        <div className="flex items-center gap-1.5 ml-2">
                            <span className="w-6 h-1.5 rounded-full bg-blue-500" />
                            <span className="w-2 h-1.5 rounded-full bg-white/20" />
                            <span className="w-2 h-1.5 rounded-full bg-white/20" />
                            <span className="w-2 h-1.5 rounded-full bg-white/20" />
                        </div>
                    </div>
                </div>

                {/* Composition visuelle sur piédestaux néon */}
                <div className="relative z-10 flex items-center justify-center lg:justify-end shrink-0 w-full lg:w-auto">
                    <div className="relative flex items-center gap-3">
                        {collections.slice(0, 3).map((c, idx) => (
                            <Link
                                key={c.id}
                                to={`/collections/${c.slug}`}
                                className={`w-28 sm:w-36 h-36 sm:h-44 rounded-2xl bg-gradient-to-b from-[#141d3d] to-[#0c1228] border border-blue-400/20 p-3 flex flex-col items-center justify-between shadow-2xl hover:scale-105 transition-all duration-300 ${
                                    idx === 1 ? 'sm:-translate-y-4 border-blue-400/40 shadow-blue-500/20' : ''
                                }`}
                            >
                                <div className="w-full h-20 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center text-3xl">
                                    {c.bannerUrl ? (
                                        <img src={c.bannerUrl} alt={c.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span>{c.iconUrl || '📦'}</span>
                                    )}
                                </div>
                                <div className="text-center w-full">
                                    <p className="text-[11px] font-bold text-white truncate">{c.name}</p>
                                    <p className="text-[9px] text-blue-400 font-semibold">{c.productCount ?? 0} produits</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* 2. SECTION « NOS CATÉGORIES » (MAQUETTE 1)                        */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12 mt-10">
            {categories.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-blue-500 rounded-full inline-block" />
                                Nos Catégories
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                Parcourez nos différents rayons spécialisés
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link
                                to="/catalog"
                                className="text-xs font-bold text-gray-400 hover:text-blue-400 transition-colors hidden sm:flex items-center gap-1"
                            >
                                Voir toutes les catégories <ArrowRight size={13} />
                            </Link>

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => scrollCategories('left')}
                                    className="w-8 h-8 rounded-full bg-[#121526] hover:bg-white/10 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={() => scrollCategories('right')}
                                    className="w-8 h-8 rounded-full bg-[#121526] hover:bg-white/10 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Carrousel horizontal fluide */}
                    <div
                        ref={categoriesContainerRef}
                        className="flex items-center gap-3.5 overflow-x-auto pb-2 scrollbar-none scroll-smooth"
                    >
                        {categories.map((cat) => (
                            <Link
                                key={cat.id}
                                to={`/category/${cat.slug}`}
                                className="min-w-[130px] sm:min-w-[150px] p-4 rounded-2xl bg-white dark:bg-[#121526] hover:bg-indigo-50 dark:hover:bg-[#181d36] border border-gray-100 dark:border-white/5 hover:border-blue-500/30 transition-all flex flex-col items-center text-center group shadow-sm dark:shadow-md shrink-0"
                            >
                                <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-[#0a0d17] border border-gray-100 dark:border-white/5 flex items-center justify-center text-2xl mb-2.5 group-hover:scale-110 transition-transform">
                                    {cat.iconUrl && cat.iconUrl.startsWith('http') ? (
                                        <img src={cat.iconUrl} alt={cat.name} className="w-7 h-7 object-contain" />
                                    ) : (
                                        <span>{cat.iconUrl || '🌾'}</span>
                                    )}
                                </div>
                                <p className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-blue-400 transition-colors truncate max-w-[120px]">
                                    {cat.name}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                    {cat.productCount ?? 0} produit{(cat.productCount ?? 0) > 1 ? 's' : ''}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* 3. SECTION « NOS COLLECTIONS » (MAQUETTE 1)                       */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            <div className="space-y-6 pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                            <Trophy size={20} className="text-amber-400" />
                            Nos Collections
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Des collections variées pour une expérience shopping unique
                        </p>
                    </div>

                    {/* Sélecteur de Tri */}
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-bold">
                        <span>Trier par :</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-gray-100 dark:bg-[#121526] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-slate-800 dark:text-white font-bold text-xs focus:outline-none focus:border-blue-500"
                        >
                            <option value="popular">Plus populaires</option>
                            <option value="name">Nom (A-Z)</option>
                            <option value="products">Nombre de produits</option>
                        </select>
                    </div>
                </div>

                {/* Grille des collections */}
                {sortedCollections.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-[#121526] rounded-3xl border border-gray-100 dark:border-white/5 p-8">
                        <Package size={40} className="mx-auto text-gray-600 mb-3" />
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Aucune collection disponible pour le moment</h3>
                        <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                            Nos rayons sont en cours de mise à jour. Découvrez l'ensemble des articles dans le catalogue général.
                        </p>
                        <Link to="/catalog" className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-blue-600 text-white text-xs font-bold">
                            Voir la boutique
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {sortedCollections.map((col, idx) => {
                            const badge = BADGE_STYLES[idx % BADGE_STYLES.length];
                            const isFav = favorites.has(col.id);

                            return (
                                <div
                                    key={col.id}
                                    className="group rounded-3xl bg-white dark:bg-[#121526] border border-gray-100 dark:border-white/5 hover:border-blue-500/40 p-4 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-600/10 flex flex-col justify-between relative overflow-hidden"
                                >
                                    {/* Arrière-plan lumineux au survol */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/15 transition-all" />

                                    <div>
                                        {/* Ligne haute : Badge & Favori */}
                                        <div className="flex items-center justify-between mb-3 relative z-10">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${badge.bg}`}>
                                                {badge.label}
                                            </span>

                                            <button
                                                onClick={() => toggleFavorite(col.id, col.name)}
                                                className={`p-1.5 rounded-full border transition-all ${
                                                    isFav
                                                        ? 'bg-red-500/20 border-red-500/40 text-red-400'
                                                        : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                                                }`}
                                            >
                                                <Heart size={14} className={isFav ? 'fill-red-400' : ''} />
                                            </button>
                                        </div>

                                        {/* Image de la collection */}
                                        <Link to={`/collections/${col.slug}`} className="block relative z-10">
                                            <div className="h-44 rounded-2xl bg-gradient-to-br from-gray-50 dark:from-[#0c1022] to-gray-100 dark:to-[#161a33] border border-gray-100 dark:border-white/5 overflow-hidden flex items-center justify-center p-2 mb-3.5 group-hover:border-blue-500/20 transition-all">
                                                {col.bannerUrl ? (
                                                    <img
                                                        src={col.bannerUrl}
                                                        alt={col.name}
                                                        className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : col.iconUrl && col.iconUrl.startsWith('http') ? (
                                                    <img src={col.iconUrl} alt={col.name} className="w-16 h-16 object-contain" />
                                                ) : (
                                                    <span className="text-5xl group-hover:scale-110 transition-transform">
                                                        {col.iconUrl || '📦'}
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-blue-400 transition-colors truncate">
                                                {col.name}
                                            </h3>

                                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 leading-relaxed min-h-[32px]">
                                                {col.description || 'Découvrez notre sélection spéciale pour cette catégorie.'}
                                            </p>
                                        </Link>
                                    </div>

                                    {/* Bas de carte : Compteurs & Bouton Voir la collection */}
                                    <div className="pt-4 mt-2 border-t border-gray-100 dark:border-white/5 relative z-10 flex items-center justify-between">
                                        <div className="flex items-center gap-2.5 text-[11px] text-gray-500 dark:text-gray-400 font-semibold">
                                            <span className="flex items-center gap-1">
                                                <Package size={13} className="text-blue-400" />
                                                {col.productCount ?? 0} produits
                                            </span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Eye size={13} className="text-purple-400" />
                                                {((col.sortOrder || 1) * 2.1 + (col.productCount || 0) * 0.5).toFixed(1)}K vues
                                            </span>
                                        </div>

                                        <Link
                                            to={`/collections/${col.slug}`}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600/15 hover:bg-blue-600 text-blue-300 hover:text-white text-xs font-bold transition-all active:scale-95"
                                        >
                                            <span>Voir</span>
                                            <ArrowRight size={12} />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            </div>
            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* 4. BOUTONS FLOTTANTS D'AIDE ET SCROLL (MAQUETTE 1)                 */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            <div className="fixed bottom-6 left-6 z-50">
                <a
                    href="https://wa.me/237686669222"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#121526]/90 hover:bg-blue-600 text-white border border-blue-500/30 shadow-2xl backdrop-blur-md transition-all group"
                >
                    <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                        <MessageCircle size={15} />
                    </div>
                    <div className="text-left hidden sm:block">
                        <p className="text-[11px] font-black leading-tight">Besoin d'aide ?</p>
                        <p className="text-[9px] text-blue-300 leading-tight">Discutez avec nous</p>
                    </div>
                </a>
            </div>

            {showScrollTop && (
                <div className="fixed bottom-6 right-6 z-50">
                    <button
                        onClick={scrollToTop}
                        className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-2xl shadow-blue-600/50 transition-all hover:scale-110 active:scale-95"
                    >
                        <ArrowUp size={18} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default Collections;
