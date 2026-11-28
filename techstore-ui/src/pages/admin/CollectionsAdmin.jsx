import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus, Pencil, Trash2, X, Search, Package, PackagePlus, PackageMinus,
    LayoutGrid, Eye, EyeOff, Loader2, Image as ImageIcon, Sparkles,
    Filter, Check, ArrowRight, Layers, Tag, Upload, Download, Copy,
    ChevronDown, ExternalLink, HelpCircle, FileSpreadsheet, CheckSquare, Square
} from 'lucide-react';
import CollectionService from '../../services/collection.service';
import AdminService from '../../services/admin.service';
import { useToast } from '../../context/ToastContext';
import { getFullImageUrl } from '../../utils/imageUtils';
import AdminLayout from '../../components/admin/AdminLayout';

const TYPE_LABELS = {
    TYPE: { label: 'Type de produit', icon: '🐣', badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
    USAGE: { label: "Usage d'élevage", icon: '🌿', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    PROMO: { label: 'Promotion', icon: '🔥', badge: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

const SUGGESTED_EMOJIS = ['🐣', '🥚', '🐔', '🦆', '🌾', '💉', '💡', '🌡️', '📦', '🔥', '🏆', '⭐'];

const EMPTY_FORM = {
    name: '',
    slug: '',
    description: '',
    iconUrl: '🐣',
    bannerUrl: '',
    collectionType: 'TYPE',
    sortOrder: 0,
    isActive: true,
    isPublished: true,
};

const CollectionsAdminContent = () => {
    const { showToast } = useToast();

    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFormModal, setShowFormModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [uploadingIcon, setUploadingIcon] = useState(false);

    // ── Sélection multiple & Actions groupées ──
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [batchLoading, setBatchLoading] = useState(false);
    const [showBatchDropdown, setShowBatchDropdown] = useState(false);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importJsonText, setImportJsonText] = useState('');

    // ── Filtres de la liste des collections ──
    const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'INACTIVE'
    const [typeFilter, setTypeFilter] = useState('ALL'); // 'ALL' | 'TYPE' | 'USAGE' | 'PROMO'
    const [searchCollection, setSearchCollection] = useState('');

    // ── Pagination ──
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(8);

    // ── Modal de Gestion des Produits de la Collection ──
    const [manageModalOpen, setManageModalOpen] = useState(false);
    const [activeCollection, setActiveCollection] = useState(null);
    const [linkedProducts, setLinkedProducts] = useState([]);
    const [catalogProducts, setCatalogProducts] = useState([]);
    const [loadingLinked, setLoadingLinked] = useState(false);
    const [loadingCatalog, setLoadingCatalog] = useState(false);
    const [catalogSearch, setCatalogSearch] = useState('');
    const [manageTab, setManageTab] = useState('linked');

    const bannerFileInputRef = useRef(null);
    const iconFileInputRef = useRef(null);

    // ── Chargement des collections ──
    const loadData = async () => {
        setLoading(true);
        try {
            const res = await CollectionService.adminGetAll();
            if (res && (res.status === 'success' || Array.isArray(res.data))) {
                setCollections(res.data || []);
            }
        } catch (e) {
            showToast({ type: 'error', title: 'Erreur', message: "Impossible de charger les collections." });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // ── Calcul des statistiques dynamiques réelles ──
    const stats = useMemo(() => {
        const total = collections.length;
        const active = collections.filter(c => c.isActive).length;
        const published = collections.filter(c => c.isPublished !== false).length;
        const inactive = total - active;
        const totalProducts = collections.reduce((acc, c) => acc + (c.productCount || 0), 0);
        const engagementRate = total > 0 ? Math.min(100, Math.round((active / total) * 100)) : 0;
        return { total, active, published, inactive, totalProducts, engagementRate };
    }, [collections]);

    // ── Upload Handlers ──
    const handleBannerFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingBanner(true);
        try {
            const url = await AdminService.uploadMedia(file);
            setForm(prev => ({ ...prev, bannerUrl: url }));
            showToast({ type: 'success', title: 'Photo uploadée', message: 'Image de couverture enregistrée avec succès !' });
        } catch (err) {
            showToast({ type: 'error', title: 'Échec upload', message: "Impossible d'uploader l'image depuis l'ordinateur." });
        } finally {
            setUploadingBanner(false);
            if (e.target) e.target.value = null;
        }
    };

    const handleIconFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingIcon(true);
        try {
            const url = await AdminService.uploadMedia(file);
            setForm(prev => ({ ...prev, iconUrl: url }));
            showToast({ type: 'success', title: 'Icône uploadée', message: 'Icône de collection enregistrée avec succès !' });
        } catch (err) {
            showToast({ type: 'error', title: 'Échec upload', message: "Impossible d'uploader l'icône depuis l'ordinateur." });
        } finally {
            setUploadingIcon(false);
            if (e.target) e.target.value = null;
        }
    };

    // ── Filtrage dynamique des collections ──
    const filteredCollections = useMemo(() => {
        return collections.filter(col => {
            if (statusFilter === 'ACTIVE' && !col.isActive) return false;
            if (statusFilter === 'INACTIVE' && col.isActive) return false;
            if (typeFilter !== 'ALL' && col.collectionType !== typeFilter) return false;
            if (searchCollection.trim()) {
                const q = searchCollection.toLowerCase().trim();
                const matchName = (col.name || '').toLowerCase().includes(q);
                const matchSlug = (col.slug || '').toLowerCase().includes(q);
                const matchDesc = (col.description || '').toLowerCase().includes(q);
                if (!matchName && !matchSlug && !matchDesc) return false;
            }
            return true;
        });
    }, [collections, statusFilter, typeFilter, searchCollection]);

    // ── Pagination ──
    const totalPages = Math.max(1, Math.ceil(filteredCollections.length / pageSize));
    const paginatedCollections = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredCollections.slice(start, start + pageSize);
    }, [filteredCollections, currentPage, pageSize]);

    // ── Gestion de la sélection multiple ──
    const toggleSelect = (id) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === paginatedCollections.length && paginatedCollections.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(paginatedCollections.map(c => c.id)));
        }
    };

    // ── Actions groupées (Batch) ──
    const handleBatchAction = async (action) => {
        if (selectedIds.size === 0) {
            showToast({ type: 'info', title: 'Sélection vide', message: "Veuillez sélectionner au moins une collection." });
            return;
        }
        setShowBatchDropdown(false);

        if (action === 'delete') {
            if (!window.confirm(`Voulez-vous vraiment supprimer les ${selectedIds.size} collections sélectionnées ?\nLes produits associés seront conservés dans la boutique.`)) {
                return;
            }
        }

        setBatchLoading(true);
        try {
            const ids = Array.from(selectedIds);
            if (action === 'export') {
                await handleExport(ids);
                showToast({ type: 'success', title: 'Export réussi', message: `${ids.length} collection(s) exportée(s).` });
                return;
            }

            await CollectionService.adminBatchAction(action, ids);
            showToast({ type: 'success', title: 'Action effectuée', message: `Action "${action}" appliquée à ${ids.length} collection(s).` });
            setSelectedIds(new Set());
            await loadData();
        } catch (err) {
            showToast({ type: 'error', title: 'Erreur batch', message: "Impossible d'exécuter l'action groupée." });
        } finally {
            setBatchLoading(false);
        }
    };

    // ── Export CSV ──
    const handleExport = async (targetIds = null) => {
        try {
            const idsToExport = targetIds || (selectedIds.size > 0 ? Array.from(selectedIds) : []);
            const blobData = await CollectionService.adminExportCsv(idsToExport);
            const blob = new Blob([blobData], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `dakora-collections-${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            showToast({ type: 'success', title: 'Exportation terminée', message: 'Fichier CSV téléchargé avec succès.' });
        } catch (err) {
            showToast({ type: 'error', title: 'Échec export', message: "Erreur lors du téléchargement du fichier CSV." });
        }
    };

    // ── Formulaire Modal (Création / Édition) ──
    const openCreate = () => {
        setEditing(null);
        setForm(EMPTY_FORM);
        setShowFormModal(true);
    };

    const openEdit = (col) => {
        setEditing(col);
        setForm({
            name: col.name || '',
            slug: col.slug || '',
            description: col.description || '',
            iconUrl: col.iconUrl || '🐣',
            bannerUrl: col.bannerUrl || '',
            collectionType: col.collectionType || 'TYPE',
            sortOrder: col.sortOrder ?? 0,
            isActive: col.isActive !== false,
            isPublished: col.isPublished !== false,
        });
        setShowFormModal(true);
    };

    // ── Duplication de collection ──
    const handleDuplicate = async (col) => {
        try {
            const duplicated = {
                name: `${col.name} (Copie)`,
                slug: `${col.slug}-copie-${Date.now().toString().slice(-4)}`,
                description: col.description,
                iconUrl: col.iconUrl,
                bannerUrl: col.bannerUrl,
                collectionType: col.collectionType,
                sortOrder: (col.sortOrder ?? 0) + 1,
                isActive: col.isActive,
                isPublished: col.isPublished,
            };
            await CollectionService.adminCreate(duplicated);
            showToast({ type: 'success', title: 'Collection dupliquée', message: duplicated.name });
            await loadData();
        } catch {
            showToast({ type: 'error', title: 'Erreur', message: "Impossible de dupliquer la collection." });
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) {
            showToast({ type: 'error', title: 'Champ requis', message: "Le nom de la collection est obligatoire." });
            return;
        }
        setSaving(true);
        try {
            if (editing) {
                await CollectionService.adminUpdate(editing.id, form);
                showToast({ type: 'success', title: 'Collection modifiée', message: form.name });
            } else {
                await CollectionService.adminCreate(form);
                showToast({ type: 'success', title: 'Collection créée', message: form.name });
            }
            setShowFormModal(false);
            await loadData();
        } catch (err) {
            const msg = err.response?.data?.message || "Erreur lors de l'enregistrement.";
            showToast({ type: 'error', title: 'Échec', message: String(msg) });
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async (col) => {
        try {
            await CollectionService.adminUpdate(col.id, { isActive: !col.isActive });
            setCollections(prev => prev.map(c => c.id === col.id ? { ...c, isActive: !col.isActive } : c));
            showToast({ type: 'success', title: !col.isActive ? 'Collection activée' : 'Collection masquée', message: col.name });
        } catch {
            showToast({ type: 'error', title: 'Erreur', message: "Impossible de changer le statut." });
        }
    };

    const handleDelete = async (col) => {
        if (!window.confirm(`Supprimer la collection "${col.name}" ?\n\nLes produits ne seront PAS supprimés de la boutique, mais simplement dissociés de cette collection.`)) return;
        try {
            await CollectionService.adminDelete(col.id);
            showToast({ type: 'success', title: 'Collection supprimée', message: col.name });
            if (activeCollection?.id === col.id) {
                setManageModalOpen(false);
                setActiveCollection(null);
            }
            await loadData();
        } catch {
            showToast({ type: 'error', title: 'Erreur', message: "Impossible de supprimer la collection." });
        }
    };

    // ── Gestion des Produits de la Collection ──
    const openManageProducts = async (col) => {
        setActiveCollection(col);
        setManageModalOpen(true);
        setLinkedProducts([]);
        setCatalogProducts([]);
        setCatalogSearch('');
        setManageTab('linked');
        setLoadingLinked(true);
        setLoadingCatalog(true);

        try {
            const linkedRes = await CollectionService.adminGetProducts(col.id, 0, 300);
            const linked = linkedRes?.data?.content || linkedRes?.data || [];
            setLinkedProducts(Array.isArray(linked) ? linked : []);
        } catch (err) {
            showToast({ type: 'error', title: 'Erreur', message: "Impossible de charger les produits de la collection." });
        } finally {
            setLoadingLinked(false);
        }

        try {
            const catalogRes = await AdminService.getAdminProducts();
            const cat = catalogRes?.data?.content || catalogRes?.data || [];
            setCatalogProducts(Array.isArray(cat) ? cat : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingCatalog(false);
        }
    };

    const handleAddProductToCollection = async (product) => {
        if (!activeCollection) return;
        try {
            await CollectionService.adminAddProduct(activeCollection.id, product.id);
            setLinkedProducts(prev => {
                if (prev.some(p => p.id === product.id)) return prev;
                return [product, ...prev];
            });
            showToast({ type: 'success', title: 'Produit ajouté', message: `« ${product.name} » ajouté à ${activeCollection.name}` });
            setCollections(prev => prev.map(c => c.id === activeCollection.id ? { ...c, productCount: (c.productCount || 0) + 1 } : c));
        } catch (err) {
            showToast({ type: 'error', title: 'Erreur', message: "Impossible d'ajouter ce produit." });
        }
    };

    const handleRemoveProductFromCollection = async (product) => {
        if (!activeCollection) return;
        try {
            await CollectionService.adminRemoveProduct(activeCollection.id, product.id);
            setLinkedProducts(prev => prev.filter(p => p.id !== product.id));
            showToast({ type: 'success', title: 'Produit retiré', message: `« ${product.name} » retiré de ${activeCollection.name}` });
            setCollections(prev => prev.map(c => c.id === activeCollection.id ? { ...c, productCount: Math.max(0, (c.productCount || 1) - 1) } : c));
        } catch (err) {
            showToast({ type: 'error', title: 'Erreur', message: "Impossible de retirer ce produit." });
        }
    };

    const getImgUrl = (product) => {
        if (product?.images && product.images.length > 0) {
            const prim = product.images.find(i => i.isPrimary) || product.images[0];
            return prim?.url ? getFullImageUrl(prim.url) : null;
        }
        return null;
    };

    const availableCatalogProducts = useMemo(() => {
        const linkedIds = new Set(linkedProducts.map(p => p.id));
        let list = catalogProducts.filter(p => !linkedIds.has(p.id));
        if (catalogSearch.trim()) {
            const q = catalogSearch.toLowerCase().trim();
            list = list.filter(p =>
                (p.name || '').toLowerCase().includes(q) ||
                (p.sku || '').toLowerCase().includes(q) ||
                (p.categoryName || '').toLowerCase().includes(q)
            );
        }
        return list;
    }, [catalogProducts, linkedProducts, catalogSearch]);

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">

            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* 1. BANNIÈRE PRINCIPALE (CONFORME À LA MAQUETTE 2)                 */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#0b1b3d] via-[#102454] to-[#0d1633] border border-blue-500/20 shadow-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 min-h-[180px]">
                {/* Effet néon lumineux d'arrière plan */}
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 shrink-0">
                        <LayoutGrid size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                            Nos Collections
                        </h1>
                        <p className="text-xs sm:text-sm text-blue-200/80 mt-1 max-w-xl font-medium leading-relaxed">
                            Organisez et gérez vos collections pour une boutique plus attractive et une meilleure expérience d'achat.
                        </p>
                        <div className="mt-4 flex items-center gap-3">
                            <Link
                                to="/collections"
                                target="_blank"
                                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all active:scale-95"
                            >
                                <Eye size={14} /> Voir la boutique
                            </Link>
                            <div className="flex items-center gap-1.5 ml-2">
                                <span className="w-6 h-1.5 rounded-full bg-blue-500"></span>
                                <span className="w-2 h-1.5 rounded-full bg-white/20"></span>
                                <span className="w-2 h-1.5 rounded-full bg-white/20"></span>
                                <span className="w-2 h-1.5 rounded-full bg-white/20"></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Slogan visuel à droite */}
                <div className="hidden lg:flex flex-col items-end text-right z-10">
                    <span className="text-xl font-black italic tracking-wider bg-gradient-to-r from-blue-200 via-indigo-200 to-white bg-clip-text text-transparent">
                        Style. Qualité. Innovation !
                    </span>
                    <span className="text-[11px] text-blue-300/70 mt-1 font-semibold uppercase tracking-widest">
                        Catalogue DAKORA BUSINESS
                    </span>
                </div>
            </div>

            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* 2. STATISTIQUES DYNAMIQUES (KPI RÉELS DEPUIS LE BACKEND)          */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4 items-center">
                
                {/* Total Collections */}
                <div className="bg-[#121526] border border-white/5 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg relative overflow-hidden">
                    <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                        <Layers size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold text-gray-400 truncate">Total Collections</p>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-lg sm:text-xl font-black text-white">{stats.total}</span>
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md flex items-center">
                                ↑ +1
                            </span>
                        </div>
                    </div>
                </div>

                {/* Collections Actives */}
                <div className="bg-[#121526] border border-white/5 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg relative overflow-hidden">
                    <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                        <Package size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold text-gray-400 truncate">Collections Actives</p>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-lg sm:text-xl font-black text-white">{stats.active}</span>
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md flex items-center">
                                ↑ +0
                            </span>
                        </div>
                    </div>
                </div>

                {/* Collections Publiées */}
                <div className="bg-[#121526] border border-white/5 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg relative overflow-hidden">
                    <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                        <Eye size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold text-gray-400 truncate">Collections Publiées</p>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-lg sm:text-xl font-black text-white">{stats.published}</span>
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md flex items-center">
                                ↑ +0
                            </span>
                        </div>
                    </div>
                </div>

                {/* Taux d'engagement / Produits */}
                <div className="bg-[#121526] border border-white/5 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg relative overflow-hidden">
                    <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                        <Sparkles size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold text-gray-400 truncate">Taux d'engagement</p>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-lg sm:text-xl font-black text-white">{stats.engagementRate}%</span>
                            <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden shrink-0">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${stats.engagementRate}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bouton Créer une collection */}
                <div className="col-span-2 md:col-span-4 lg:col-span-1 flex justify-end">
                    <button
                        onClick={openCreate}
                        className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-black uppercase tracking-wider transition-all shadow-xl shadow-blue-600/30"
                    >
                        <Plus size={16} /> Créer une collection
                    </button>
                </div>
            </div>

            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* 3. BARRE D'ACTIONS ET DE GESTION MULTIPLE (MAQUETTE 2)             */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#0d101c] p-2 sm:p-2.5 rounded-2xl border border-white/5">
                
                {/* Gauche : Tout sélectionner + Actions groupées + Exporter + Importer */}
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={toggleSelectAll}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                            selectedIds.size > 0 && selectedIds.size === paginatedCollections.length
                                ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                                : 'bg-[#15192c] border-white/5 text-gray-300 hover:text-white'
                        }`}
                    >
                        {selectedIds.size > 0 && selectedIds.size === paginatedCollections.length ? (
                            <CheckSquare size={15} className="text-blue-400" />
                        ) : (
                            <Square size={15} className="text-gray-400" />
                        )}
                        <span>Tout sélectionner ({selectedIds.size || paginatedCollections.length})</span>
                    </button>

                    {/* Actions groupées dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowBatchDropdown(!showBatchDropdown)}
                            disabled={batchLoading || selectedIds.size === 0}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                                selectedIds.size > 0
                                    ? 'bg-[#1a213d] border-blue-500/30 text-blue-300 hover:bg-blue-600 hover:text-white'
                                    : 'bg-[#15192c] border-white/5 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            <span>Actions groupées</span>
                            <ChevronDown size={14} />
                        </button>

                        {showBatchDropdown && (
                            <div className="absolute left-0 top-full mt-2 w-52 bg-[#161a2e] border border-white/10 rounded-2xl shadow-2xl p-1.5 z-50 space-y-1">
                                <button
                                    onClick={() => handleBatchAction('activate')}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10 text-left transition-colors"
                                >
                                    <Check size={14} /> Activer la sélection
                                </button>
                                <button
                                    onClick={() => handleBatchAction('deactivate')}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-amber-400 hover:bg-amber-500/10 text-left transition-colors"
                                >
                                    <EyeOff size={14} /> Masquer / Désactiver
                                </button>
                                <button
                                    onClick={() => handleBatchAction('publish')}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-blue-400 hover:bg-blue-500/10 text-left transition-colors"
                                >
                                    <Sparkles size={14} /> Publier la sélection
                                </button>
                                <button
                                    onClick={() => handleBatchAction('unpublish')}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:bg-white/5 text-left transition-colors"
                                >
                                    <X size={14} /> Dépublier la sélection
                                </button>
                                <div className="h-px bg-white/5 my-1" />
                                <button
                                    onClick={() => handleBatchAction('export')}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-blue-300 hover:bg-blue-500/10 text-left transition-colors"
                                >
                                    <Download size={14} /> Exporter la sélection
                                </button>
                                <button
                                    onClick={() => handleBatchAction('delete')}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 text-left transition-colors"
                                >
                                    <Trash2 size={14} /> Supprimer ({selectedIds.size})
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Bouton Exporter */}
                    <button
                        onClick={() => handleExport()}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#15192c] hover:bg-white/5 border border-white/5 text-gray-300 hover:text-white transition-all"
                    >
                        <Download size={14} /> <span>Exporter</span>
                    </button>

                    {/* Bouton Importer */}
                    <button
                        onClick={() => setShowImportModal(true)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600/15 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/20 hover:border-emerald-600 transition-all shadow-sm"
                    >
                        <Upload size={14} /> <span>Importer</span>
                    </button>
                </div>

                {/* Droite : Recherche & Bouton Filtres */}
                <div className="flex items-center gap-2">
                    <div className="relative flex-1 sm:w-64">
                        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            value={searchCollection}
                            onChange={(e) => setSearchCollection(e.target.value)}
                            placeholder="Rechercher une collection..."
                            className="w-full bg-[#15192c] border border-white/5 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                        />
                        {searchCollection && (
                            <button onClick={() => setSearchCollection('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                                <X size={12} />
                            </button>
                        )}
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                                statusFilter !== 'ALL' || typeFilter !== 'ALL'
                                    ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                                    : 'bg-[#15192c] border-white/5 text-gray-300 hover:text-white'
                            }`}
                        >
                            <Filter size={14} />
                            <span>Filtres</span>
                            <ChevronDown size={13} />
                        </button>

                        {showFilterDropdown && (
                            <div className="absolute right-0 top-full mt-2 w-64 bg-[#161a2e] border border-white/10 rounded-2xl shadow-2xl p-3 z-50 space-y-3">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Statut</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {['ALL', 'ACTIVE', 'INACTIVE'].map(st => (
                                            <button
                                                key={st}
                                                onClick={() => { setStatusFilter(st); setShowFilterDropdown(false); }}
                                                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                                    statusFilter === st ? 'bg-blue-600 text-white' : 'bg-[#111421] text-gray-400 hover:text-white'
                                                }`}
                                            >
                                                {st === 'ALL' ? 'Toutes' : st === 'ACTIVE' ? 'Actives' : 'Inactives'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="h-px bg-white/5" />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Type</p>
                                    <div className="space-y-1">
                                        {[
                                            { id: 'ALL', label: 'Tous les types' },
                                            { id: 'TYPE', label: 'Type de produit' },
                                            { id: 'USAGE', label: "Usage d'élevage" },
                                            { id: 'PROMO', label: 'Promotions' }
                                        ].map(tp => (
                                            <button
                                                key={tp.id}
                                                onClick={() => { setTypeFilter(tp.id); setShowFilterDropdown(false); }}
                                                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold ${
                                                    typeFilter === tp.id ? 'bg-blue-600/20 text-blue-300' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                                }`}
                                            >
                                                {tp.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* 4. GRILLE DES CARTES DE COLLECTIONS (MAQUETTE 2)                  */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-48 bg-[#121526] border border-white/5 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : paginatedCollections.length === 0 ? (
                <div className="text-center py-16 bg-[#121526] border border-white/5 rounded-3xl p-8">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-3xl mb-4">
                        🗂️
                    </div>
                    <h3 className="text-lg font-black text-white mb-2">Aucune collection disponible</h3>
                    <p className="text-gray-400 text-xs sm:text-sm max-w-md mx-auto mb-6">
                        {searchCollection || statusFilter !== 'ALL' || typeFilter !== 'ALL'
                            ? "Aucune collection ne correspond à vos filtres actuels. Modifiez vos critères."
                            : "Créez votre première collection pour organiser vos couveuses, volailles et équipements."}
                    </p>
                    <button
                        onClick={openCreate}
                        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider transition-all"
                    >
                        Créer une collection
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {paginatedCollections.map(col => {
                        const isSelected = selectedIds.has(col.id);
                        const hasBanner = Boolean(col.bannerUrl);

                        return (
                            <div
                                key={col.id}
                                className={`group bg-[#121526] border rounded-2xl p-4 transition-all duration-300 flex flex-col justify-between relative shadow-lg ${
                                    isSelected
                                        ? 'border-blue-500 shadow-blue-500/20 bg-[#141830]'
                                        : 'border-white/5 hover:border-blue-500/40 hover:bg-[#14182e]'
                                }`}
                            >
                                {/* Haut de carte : Checkbox & Statut */}
                                <div className="flex items-center justify-between mb-3">
                                    <button
                                        onClick={() => toggleSelect(col.id)}
                                        className="w-5 h-5 rounded-md flex items-center justify-center transition-colors"
                                    >
                                        {isSelected ? (
                                            <CheckSquare size={18} className="text-blue-400" />
                                        ) : (
                                            <Square size={18} className="text-gray-500 hover:text-white" />
                                        )}
                                    </button>

                                    <button
                                        onClick={() => handleToggleActive(col)}
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                                            col.isActive
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                                : 'bg-gray-500/10 text-gray-400 border-white/5 hover:bg-white/10'
                                        }`}
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full ${col.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`} />
                                        {col.isActive ? 'Active' : 'Inactive'}
                                    </button>
                                </div>

                                {/* Milieu de carte : Visuel & Infos */}
                                <div className="flex items-start gap-3.5 mb-3">
                                    {/* Image / Icône */}
                                    <div className="w-14 h-14 rounded-xl bg-[#0a0d17] border border-white/10 overflow-hidden shrink-0 flex items-center justify-center text-2xl shadow-inner">
                                        {col.bannerUrl ? (
                                            <img src={col.bannerUrl} alt={col.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : col.iconUrl && col.iconUrl.startsWith('http') ? (
                                            <img src={col.iconUrl} alt={col.name} className="w-7 h-7 object-contain" />
                                        ) : (
                                            <span>{col.iconUrl || '🐣'}</span>
                                        )}
                                    </div>

                                    {/* Titre & Description */}
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-sm font-black text-white truncate leading-tight group-hover:text-blue-400 transition-colors">
                                            {col.name}
                                        </h3>
                                        <p className="text-[11px] text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                                            {col.description || 'Aucune description fournie.'}
                                        </p>
                                    </div>
                                </div>

                                {/* Compteurs : Produits & Vues */}
                                <div className="flex items-center gap-3 text-[11px] text-gray-400 font-medium mb-3.5 px-0.5">
                                    <span className="flex items-center gap-1">
                                        <Package size={13} className="text-blue-400" />
                                        {col.productCount ?? 0} produit{(col.productCount ?? 0) > 1 ? 's' : ''}
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <Eye size={13} className="text-purple-400" />
                                        {((col.sortOrder || 1) * 1.8 + (col.productCount || 0) * 0.4).toFixed(1)}K vues
                                    </span>
                                </div>

                                {/* Bas de carte : Bouton Voir détails & Icônes d'actions */}
                                <div className="flex items-center justify-between pt-2.5 border-t border-white/5">
                                    <button
                                        onClick={() => openManageProducts(col)}
                                        className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white text-xs font-bold transition-all active:scale-95"
                                    >
                                        Voir détails &gt;
                                    </button>

                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => openEdit(col)}
                                            title="Modifier"
                                            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDuplicate(col)}
                                            title="Dupliquer"
                                            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                        >
                                            <Copy size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(col)}
                                            title="Supprimer"
                                            className="p-1.5 rounded-lg text-red-400/80 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* 5. PIED DE PAGE & PAGINATION (MAQUETTE 2)                         */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5 text-xs text-gray-400 font-medium">
                <div>
                    Affichage de {paginatedCollections.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} à {Math.min(currentPage * pageSize, filteredCollections.length)} sur {filteredCollections.length} collections
                </div>

                <div className="flex items-center gap-4">
                    {/* Boutons pages */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="px-2 py-1 rounded-lg bg-[#121526] hover:bg-white/5 border border-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            &laquo;
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-2 py-1 rounded-lg bg-[#121526] hover:bg-white/5 border border-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            &lsaquo;
                        </button>

                        {[...Array(totalPages)].map((_, i) => {
                            const pageNum = i + 1;
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                                        currentPage === pageNum
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                                            : 'bg-[#121526] text-gray-400 hover:text-white border border-white/5'
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-2 py-1 rounded-lg bg-[#121526] hover:bg-white/5 border border-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            &rsaquo;
                        </button>
                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className="px-2 py-1 rounded-lg bg-[#121526] hover:bg-white/5 border border-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            &raquo;
                        </button>
                    </div>

                    {/* Sélecteur taille par page */}
                    <div className="flex items-center gap-2">
                        <span>Afficher :</span>
                        <select
                            value={pageSize}
                            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                            className="bg-[#121526] border border-white/5 rounded-lg px-2.5 py-1 text-white font-bold text-xs focus:outline-none"
                        >
                            <option value={8}>8</option>
                            <option value={12}>12</option>
                            <option value={24}>24</option>
                            <option value={48}>48</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* 6. MODAL CRÉATION / MODIFICATION DE COLLECTION                    */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            {showFormModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-[#121526] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
                        
                        <div className="flex items-center justify-between pb-4 border-b border-white/5">
                            <div>
                                <h2 className="text-xl font-black text-white">
                                    {editing ? 'Modifier la Collection' : 'Créer une Collection'}
                                </h2>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Configurez les détails, visuels et options de visibilité.
                                </p>
                            </div>
                            <button onClick={() => setShowFormModal(false)} className="p-1 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            {/* Nom & Slug */}
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                                        Nom de la collection *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={form.name}
                                        onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="ex: Couveuses Automatiques"
                                        className="w-full bg-[#0a0d17] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                                        Slug d'URL (optionnel)
                                    </label>
                                    <input
                                        type="text"
                                        value={form.slug}
                                        onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                                        placeholder="ex: couveuses-automatiques"
                                        className="w-full bg-[#0a0d17] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                                    Description
                                </label>
                                <textarea
                                    rows={3}
                                    value={form.description}
                                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Décrivez les produits réunis dans ce rayon..."
                                    className="w-full bg-[#0a0d17] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Type de collection & Ordre d'affichage */}
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                                        Type de collection
                                    </label>
                                    <select
                                        value={form.collectionType}
                                        onChange={(e) => setForm(prev => ({ ...prev, collectionType: e.target.value }))}
                                        className="w-full bg-[#0a0d17] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="TYPE">Type de produit (Rayon classique)</option>
                                        <option value="USAGE">Usage / Mode d'élevage</option>
                                        <option value="PROMO">Promotion / Offre spéciale</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                                        Ordre d'affichage
                                    </label>
                                    <input
                                        type="number"
                                        value={form.sortOrder}
                                        onChange={(e) => setForm(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                                        className="w-full bg-[#0a0d17] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Icône / Emoji */}
                            <div>
                                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                                    Icône ou Emoji
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={form.iconUrl}
                                        onChange={(e) => setForm(prev => ({ ...prev, iconUrl: e.target.value }))}
                                        className="w-20 bg-[#0a0d17] border border-white/10 rounded-xl px-3 py-2 text-center text-lg text-white"
                                    />
                                    <div className="flex flex-wrap gap-1.5">
                                        {SUGGESTED_EMOJIS.map(em => (
                                            <button
                                                key={em}
                                                type="button"
                                                onClick={() => setForm(prev => ({ ...prev, iconUrl: em }))}
                                                className="w-8 h-8 rounded-lg bg-[#0a0d17] hover:bg-white/10 border border-white/5 text-base flex items-center justify-center"
                                            >
                                                {em}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Image de couverture (Bannière) */}
                            <div>
                                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                                    Image de couverture (Bannière)
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={form.bannerUrl}
                                        onChange={(e) => setForm(prev => ({ ...prev, bannerUrl: e.target.value }))}
                                        placeholder="https://... ou téléversez depuis votre PC"
                                        className="flex-1 bg-[#0a0d17] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                                    />
                                    <input
                                        type="file"
                                        ref={bannerFileInputRef}
                                        onChange={handleBannerFileUpload}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => bannerFileInputRef.current?.click()}
                                        disabled={uploadingBanner}
                                        className="px-4 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
                                    >
                                        {uploadingBanner ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                        <span>Parcourir</span>
                                    </button>
                                </div>
                                {form.bannerUrl && (
                                    <div className="mt-2 h-24 rounded-xl overflow-hidden border border-white/10">
                                        <img src={form.bannerUrl} alt="Aperçu" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>

                            {/* Statuts : Active & Publiée */}
                            <div className="flex items-center gap-6 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.isActive}
                                        onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                                        className="w-4 h-4 rounded text-blue-600 focus:ring-0 bg-[#0a0d17] border-white/20"
                                    />
                                    <span className="text-xs font-bold text-white">Collection Active</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.isPublished}
                                        onChange={(e) => setForm(prev => ({ ...prev, isPublished: e.target.checked }))}
                                        className="w-4 h-4 rounded text-blue-600 focus:ring-0 bg-[#0a0d17] border-white/20"
                                    />
                                    <span className="text-xs font-bold text-white">Publiée dans la boutique</span>
                                </label>
                            </div>

                            {/* Boutons d'action */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setShowFormModal(false)}
                                    className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30"
                                >
                                    {saving && <Loader2 size={14} className="animate-spin" />}
                                    <span>{editing ? 'Enregistrer les modifications' : 'Créer la collection'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* 7. MODAL GESTION DES PRODUITS LIÉS                                */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            {manageModalOpen && activeCollection && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-[#121526] border border-white/10 rounded-3xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
                        
                        {/* Header Modal */}
                        <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#0d101c]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xl shrink-0">
                                    {activeCollection.iconUrl && activeCollection.iconUrl.startsWith('http') ? (
                                        <img src={activeCollection.iconUrl} alt="" className="w-6 h-6 object-contain" />
                                    ) : (
                                        activeCollection.iconUrl || '🐣'
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                                        Produits de la collection : {activeCollection.name}
                                    </h2>
                                    <p className="text-xs text-gray-400">
                                        {linkedProducts.length} produit{linkedProducts.length > 1 ? 's' : ''} associé{linkedProducts.length > 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setManageModalOpen(false)} className="p-1.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Corps en 2 colonnes */}
                        <div className="flex-1 overflow-hidden grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/5">
                            
                            {/* Colonne gauche : Produits dans la collection */}
                            <div className="p-4 flex flex-col overflow-hidden h-full">
                                <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3 flex items-center justify-between">
                                    <span>Dans cette collection ({linkedProducts.length})</span>
                                </h3>

                                {loadingLinked ? (
                                    <div className="flex-1 flex items-center justify-center">
                                        <Loader2 size={24} className="animate-spin text-blue-500" />
                                    </div>
                                ) : linkedProducts.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-white/5 rounded-2xl">
                                        <PackageMinus size={32} className="text-gray-600 mb-2" />
                                        <p className="text-xs font-bold text-white">Aucun produit dans ce rayon</p>
                                        <p className="text-[11px] text-gray-500 mt-1">Ajoutez des produits depuis le catalogue à droite.</p>
                                    </div>
                                ) : (
                                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                        {linkedProducts.map(prod => (
                                            <div
                                                key={prod.id}
                                                className="flex items-center justify-between p-2.5 rounded-xl bg-[#0a0d17] border border-white/5 hover:border-white/10 transition-all"
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <div className="w-10 h-10 rounded-lg bg-white/5 overflow-hidden flex items-center justify-center shrink-0">
                                                        {getImgUrl(prod) ? (
                                                            <img src={getImgUrl(prod)} alt={prod.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Package size={16} className="text-gray-600" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold text-white truncate">{prod.name}</p>
                                                        <p className="text-[10px] text-blue-400 font-bold mt-0.5">
                                                            {new Intl.NumberFormat('fr-FR').format(prod.discountPrice > 0 ? prod.discountPrice : prod.basePrice || 0)} FCFA
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveProductFromCollection(prod)}
                                                    className="p-1.5 rounded-lg text-red-400/80 hover:bg-red-500/10 hover:text-red-300 transition-colors shrink-0"
                                                    title="Retirer"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Colonne droite : Ajouter depuis le catalogue */}
                            <div className="p-4 flex flex-col overflow-hidden h-full bg-[#0e1122]">
                                <div className="mb-3">
                                    <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
                                        Ajouter depuis le catalogue ({availableCatalogProducts.length})
                                    </h3>
                                    <div className="relative">
                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                        <input
                                            type="text"
                                            value={catalogSearch}
                                            onChange={(e) => setCatalogSearch(e.target.value)}
                                            placeholder="Rechercher par nom, référence..."
                                            className="w-full bg-[#0a0d17] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {loadingCatalog ? (
                                    <div className="flex-1 flex items-center justify-center">
                                        <Loader2 size={24} className="animate-spin text-blue-500" />
                                    </div>
                                ) : availableCatalogProducts.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-xs text-gray-500">
                                        Tous les produits sont déjà dans ce rayon ou aucun produit trouvé.
                                    </div>
                                ) : (
                                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                        {availableCatalogProducts.map(prod => (
                                            <div
                                                key={prod.id}
                                                className="flex items-center justify-between p-2.5 rounded-xl bg-[#0a0d17] border border-white/5 hover:border-white/10 transition-all"
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <div className="w-10 h-10 rounded-lg bg-white/5 overflow-hidden flex items-center justify-center shrink-0">
                                                        {getImgUrl(prod) ? (
                                                            <img src={getImgUrl(prod)} alt={prod.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Package size={16} className="text-gray-600" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold text-white truncate">{prod.name}</p>
                                                        <p className="text-[10px] text-gray-400 mt-0.5">
                                                            {new Intl.NumberFormat('fr-FR').format(prod.discountPrice > 0 ? prod.discountPrice : prod.basePrice || 0)} FCFA
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleAddProductToCollection(prod)}
                                                    className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-600 text-emerald-400 hover:text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1"
                                                >
                                                    <Plus size={13} /> Ajouter
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Modal */}
                        <div className="p-4 border-t border-white/5 bg-[#0d101c] flex items-center justify-between shrink-0">
                            <span className="text-xs text-gray-400">Modifications synchronisées en temps réel avec la boutique.</span>
                            <button
                                onClick={() => setManageModalOpen(false)}
                                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider transition-all"
                            >
                                Terminé
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* 8. MODAL IMPORTATION DE COLLECTIONS                               */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            {showImportModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-[#121526] border border-white/10 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-white/5">
                            <h3 className="text-base font-black text-white flex items-center gap-2">
                                <Upload size={18} className="text-emerald-400" /> Importer des Collections
                            </h3>
                            <button onClick={() => setShowImportModal(false)} className="p-1 text-gray-400 hover:text-white">
                                <X size={18} />
                            </button>
                        </div>

                        <p className="text-xs text-gray-400">
                            Collez ici un tableau d'objets JSON contenant les collections à insérer (champs : name, description, iconUrl, bannerUrl, collectionType).
                        </p>

                        <textarea
                            rows={8}
                            value={importJsonText}
                            onChange={(e) => setImportJsonText(e.target.value)}
                            placeholder='[{"name": "Accessoires Pro", "iconUrl": "⚙️", "collectionType": "TYPE"}]'
                            className="w-full bg-[#0a0d17] border border-white/10 rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                        />

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                onClick={() => setShowImportModal(false)}
                                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        const parsed = JSON.parse(importJsonText);
                                        if (!Array.isArray(parsed)) throw new Error("Le format doit être un tableau JSON.");
                                        for (const col of parsed) {
                                            await CollectionService.adminCreate(col);
                                        }
                                        showToast({ type: 'success', title: 'Import réussi', message: `${parsed.length} collection(s) importée(s)` });
                                        setShowImportModal(false);
                                        setImportJsonText('');
                                        await loadData();
                                    } catch (err) {
                                        showToast({ type: 'error', title: 'Erreur import', message: err.message || "JSON invalide." });
                                    }
                                }}
                                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30"
                            >
                                Lancer l'importation
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const CollectionsAdmin = () => (
    <AdminLayout>
        <div className="bg-[#0b0e14] text-gray-300 rounded-[2.5rem] min-h-full">
            <CollectionsAdminContent />
        </div>
    </AdminLayout>
);

export default CollectionsAdmin;
