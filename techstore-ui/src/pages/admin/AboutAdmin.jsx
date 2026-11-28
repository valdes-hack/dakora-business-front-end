import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AboutService from '../../services/about.service';
import AdminService from '../../services/admin.service';
import { useToast } from '../../context/ToastContext';
import { getFullImageUrl } from '../../utils/imageUtils';
import {
    FileText, Save, Send, Eye, Plus, Trash2, Edit3, Image as ImageIcon,
    Check, Sparkles, History, Target, Heart, Award, Users, ShieldCheck,
    Camera, Share2, Search, Loader2, ArrowRight, ExternalLink
} from 'lucide-react';

const SECTIONS = [
    { id: 'general', label: '1. Présentation générale', icon: FileText },
    { id: 'history', label: '2. Notre histoire', icon: History },
    { id: 'mission', label: '3. Mission & Vision', icon: Target },
    { id: 'values', label: '4. Nos valeurs', icon: Heart },
    { id: 'stats', label: '5. Chiffres clés', icon: Award },
    { id: 'team', label: '6. Notre équipe', icon: Users },
    { id: 'commitments', label: '7. Engagements & SAV', icon: ShieldCheck },
    { id: 'gallery', label: '8. Galerie & Médias', icon: Camera },
    { id: 'contact', label: '9. Réseaux & Contact', icon: Share2 },
    { id: 'seo', label: '10. Référencement SEO', icon: Search },
];

const AboutAdmin = () => {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Données du CMS
    const [content, setContent] = useState({
        companyName: 'DAKORA BUSINESS',
        mainTitle: "Leader en technologies et solutions pour l'élevage",
        subtitle: 'Votre partenaire de confiance pour des équipements modernes et des couveuses haute performance.',
        generalDescription: '',
        logoUrl: '',
        mainImageUrl: '',
        ctaText: 'Explorer nos collections',
        ctaUrl: '/collections',
        historyTitle: 'Notre Histoire',
        historyText: '',
        historyYear: '2020',
        missionText: '',
        visionText: '',
        missionVisible: true,
        visionVisible: true,
        valuesJson: '[]',
        statsJson: '[]',
        teamJson: '[]',
        commitmentsJson: '[]',
        galleryJson: '[]',
        socialLinksJson: '{}',
        seoJson: '{}',
        isPublished: true,
    });

    // Parsed JSON sub-lists
    const [valuesList, setValuesList] = useState([]);
    const [teamList, setTeamList] = useState([]);
    const [commitmentsList, setCommitmentsList] = useState([]);
    const [galleryList, setGalleryList] = useState([]);

    const mainImageInputRef = useRef(null);

    // Chargement initial
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await AboutService.adminGet();
                if (res && (res.status === 'success' || res.data)) {
                    const data = res.data || res;
                    setContent(data);
                    try { setValuesList(JSON.parse(data.valuesJson || '[]')); } catch { setValuesList([]); }
                    try { setTeamList(JSON.parse(data.teamJson || '[]')); } catch { setTeamList([]); }
                    try { setCommitmentsList(JSON.parse(data.commitmentsJson || '[]')); } catch { setCommitmentsList([]); }
                    try { setGalleryList(JSON.parse(data.galleryJson || '[]')); } catch { setGalleryList([]); }
                }
            } catch (err) {
                showToast({ type: 'error', title: 'Erreur', message: "Impossible de charger le contenu À Propos." });
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // Enregistrement (Brouillon ou Publication)
    const handleSave = async (publish = false) => {
        if (publish) setPublishing(true);
        else setSaving(true);

        try {
            const payload = {
                ...content,
                valuesJson: JSON.stringify(valuesList),
                teamJson: JSON.stringify(teamList),
                commitmentsJson: JSON.stringify(commitmentsList),
                galleryJson: JSON.stringify(galleryList),
            };

            const res = await AboutService.adminSave(payload, publish);
            if (res && (res.status === 'success' || res.data)) {
                setContent(res.data || payload);
                showToast({
                    type: 'success',
                    title: publish ? 'Page Publiée !' : 'Brouillon enregistré',
                    message: publish ? 'Les modifications sont visibles sur la boutique.' : 'Modifications enregistrées avec succès.'
                });
            }
        } catch (err) {
            showToast({ type: 'error', title: 'Échec sauvegarde', message: "Une erreur est survenue lors de l'enregistrement." });
        } finally {
            setSaving(false);
            setPublishing(false);
        }
    };

    // Upload image principale
    const handleMainImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await AdminService.uploadMedia(file);
            setContent(prev => ({ ...prev, mainImageUrl: url }));
            showToast({ type: 'success', title: 'Image enregistrée', message: "L'image principale a été mise à jour." });
        } catch {
            showToast({ type: 'error', title: 'Erreur upload', message: "Impossible d'uploader l'image." });
        } finally {
            setUploading(false);
            if (e.target) e.target.value = null;
        }
    };

    // ── Handlers pour les listes dynamiques (Valeurs, Équipe, Engagements) ──
    const addValue = () => {
        setValuesList(prev => [...prev, { title: 'Nouvelle valeur', description: 'Description de la valeur...', icon: 'Sparkles' }]);
    };
    const removeValue = (index) => {
        setValuesList(prev => prev.filter((_, i) => i !== index));
    };

    const addTeamMember = () => {
        setTeamList(prev => [...prev, { id: Date.now(), name: 'Nom du membre', role: 'Fonction', bio: 'Courte biographie...', photoUrl: '', isVisible: true }]);
    };
    const removeTeamMember = (index) => {
        setTeamList(prev => prev.filter((_, i) => i !== index));
    };

    const addCommitment = () => {
        setCommitmentsList(prev => [...prev, { title: 'Nouvel engagement', description: 'Description de cet engagement...', icon: 'ShieldCheck' }]);
    };
    const removeCommitment = (index) => {
        setCommitmentsList(prev => prev.filter((_, i) => i !== index));
    };

    const addGalleryItem = () => {
        const url = window.prompt("URL de l'image :");
        if (url) {
            const caption = window.prompt("Légende de l'image (optionnel) :") || '';
            setGalleryList(prev => [...prev, { imageUrl: url, caption }]);
        }
    };
    const removeGalleryItem = (index) => {
        setGalleryList(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <AdminLayout>
            <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 text-slate-800 dark:text-gray-300 min-h-full rounded-[2.5rem]">

                {/* ── HEADER CMS ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-400 text-xs font-black uppercase tracking-widest mb-1">
                            <Sparkles size={14} /> Gestionnaire de Contenu (CMS)
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black italic tracking-tighter uppercase text-slate-900 dark:text-white flex items-center gap-3">
                            <FileText size={28} className="text-indigo-500" /> Page « À Propos »
                        </h1>
                        <p className="text-xs text-gray-400 mt-1">
                            Configurez l'ensemble du contenu de présentation de DAKORA BUSINESS visible par vos clients.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                        <a
                            href="/a-propos"
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 hover:text-slate-900 dark:text-white transition-all border border-white/5"
                        >
                            <Eye size={14} /> Voir en direct
                        </a>
                        <button
                            onClick={() => handleSave(false)}
                            disabled={saving || publishing}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-900 dark:text-white transition-all border border-white/10"
                        >
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Enregistrer brouillon
                        </button>
                        <button
                            onClick={() => handleSave(true)}
                            disabled={saving || publishing}
                            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
                        >
                            {publishing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                            Publier en ligne
                        </button>
                    </div>
                </div>

                {/* ── ZONE PRINCIPALE : NAVIGATION GAUCHE + ÉDITEUR DROITE ── */}
                <div className="grid lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Menu des 10 sections */}
                    <div className="lg:col-span-4 bg-white dark:bg-[#121526] border border-slate-200 dark:border-white/5 shadow-sm rounded-3xl p-3 space-y-1 shadow-xl">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-3 py-2">
                            Sections de la page
                        </p>
                        {SECTIONS.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-left transition-all ${
                                    activeTab === id
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                                        : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                                }`}
                            >
                                <Icon size={16} />
                                <span className="truncate">{label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Zone de formulaire pour la section active */}
                    <div className="lg:col-span-8 bg-white dark:bg-[#121526] border border-slate-200 dark:border-white/5 shadow-sm rounded-3xl p-6 sm:p-8 shadow-xl min-h-[450px]">
                        {loading ? (
                            <div className="py-20 flex flex-col items-center justify-center">
                                <Loader2 size={32} className="animate-spin text-indigo-500 mb-3" />
                                <p className="text-xs text-gray-400">Chargement du contenu...</p>
                            </div>
                        ) : (
                            <div className="space-y-6">

                                {/* 1. PRÉSENTATION GÉNÉRALE */}
                                {activeTab === 'general' && (
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-white/5 pb-2">
                                            1. Présentation générale & Accroche
                                        </h3>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 mb-1">Nom de l'entreprise</label>
                                            <input
                                                type="text"
                                                value={content.companyName || ''}
                                                onChange={e => setContent(p => ({ ...p, companyName: e.target.value }))}
                                                className="w-full bg-slate-50 dark:bg-[#0a0d17] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 mb-1">Titre principal</label>
                                            <input
                                                type="text"
                                                value={content.mainTitle || ''}
                                                onChange={e => setContent(p => ({ ...p, mainTitle: e.target.value }))}
                                                className="w-full bg-slate-50 dark:bg-[#0a0d17] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 mb-1">Sous-titre d'accroche</label>
                                            <textarea
                                                rows={2}
                                                value={content.subtitle || ''}
                                                onChange={e => setContent(p => ({ ...p, subtitle: e.target.value }))}
                                                className="w-full bg-slate-50 dark:bg-[#0a0d17] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 mb-1">Description détaillée</label>
                                            <textarea
                                                rows={4}
                                                value={content.generalDescription || ''}
                                                onChange={e => setContent(p => ({ ...p, generalDescription: e.target.value }))}
                                                className="w-full bg-slate-50 dark:bg-[#0a0d17] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 mb-1">Image principale / Bannière</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={content.mainImageUrl || ''}
                                                    onChange={e => setContent(p => ({ ...p, mainImageUrl: e.target.value }))}
                                                    placeholder="https://..."
                                                    className="flex-1 bg-slate-50 dark:bg-[#0a0d17] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white"
                                                />
                                                <input
                                                    type="file"
                                                    ref={mainImageInputRef}
                                                    onChange={handleMainImageUpload}
                                                    accept="image/*"
                                                    className="hidden"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => mainImageInputRef.current?.click()}
                                                    disabled={uploading}
                                                    className="px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-slate-900 dark:text-white text-xs font-bold transition-all"
                                                >
                                                    {uploading ? <Loader2 size={14} className="animate-spin" /> : 'Parcourir'}
                                                </button>
                                            </div>
                                            {content.mainImageUrl && (
                                                <div className="mt-2 h-32 rounded-xl overflow-hidden border border-white/10">
                                                    <img src={content.mainImageUrl} alt="Aperçu" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* 2. NOTRE HISTOIRE */}
                                {activeTab === 'history' && (
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-white/5 pb-2">
                                            2. Notre Histoire & Genèse
                                        </h3>
                                        <div className="grid sm:grid-cols-3 gap-4">
                                            <div className="sm:col-span-2">
                                                <label className="block text-xs font-bold text-gray-400 mb-1">Titre de la section</label>
                                                <input
                                                    type="text"
                                                    value={content.historyTitle || ''}
                                                    onChange={e => setContent(p => ({ ...p, historyTitle: e.target.value }))}
                                                    className="w-full bg-slate-50 dark:bg-[#0a0d17] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-400 mb-1">Année de création</label>
                                                <input
                                                    type="text"
                                                    value={content.historyYear || ''}
                                                    onChange={e => setContent(p => ({ ...p, historyYear: e.target.value }))}
                                                    className="w-full bg-slate-50 dark:bg-[#0a0d17] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 mb-1">Texte de l'histoire</label>
                                            <textarea
                                                rows={6}
                                                value={content.historyText || ''}
                                                onChange={e => setContent(p => ({ ...p, historyText: e.target.value }))}
                                                className="w-full bg-slate-50 dark:bg-[#0a0d17] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* 3. MISSION & VISION */}
                                {activeTab === 'mission' && (
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-white/5 pb-2">
                                            3. Mission & Vision
                                        </h3>
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="text-xs font-bold text-gray-400">Contenu de la Mission</label>
                                                <label className="flex items-center gap-1 text-[11px] text-gray-400 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={content.missionVisible !== false}
                                                        onChange={e => setContent(p => ({ ...p, missionVisible: e.target.checked }))}
                                                        className="rounded text-indigo-600"
                                                    /> Activer
                                                </label>
                                            </div>
                                            <textarea
                                                rows={3}
                                                value={content.missionText || ''}
                                                onChange={e => setContent(p => ({ ...p, missionText: e.target.value }))}
                                                className="w-full bg-slate-50 dark:bg-[#0a0d17] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="text-xs font-bold text-gray-400">Contenu de la Vision</label>
                                                <label className="flex items-center gap-1 text-[11px] text-gray-400 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={content.visionVisible !== false}
                                                        onChange={e => setContent(p => ({ ...p, visionVisible: e.target.checked }))}
                                                        className="rounded text-indigo-600"
                                                    /> Activer
                                                </label>
                                            </div>
                                            <textarea
                                                rows={3}
                                                value={content.visionText || ''}
                                                onChange={e => setContent(p => ({ ...p, visionText: e.target.value }))}
                                                className="w-full bg-slate-50 dark:bg-[#0a0d17] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* 4. NOS VALEURS */}
                                {activeTab === 'values' && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                                                4. Nos Valeurs Fondamentales ({valuesList.length})
                                            </h3>
                                            <button
                                                type="button"
                                                onClick={addValue}
                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                                            >
                                                <Plus size={14} /> Ajouter une valeur
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {valuesList.map((val, idx) => (
                                                <div key={idx} className="p-3.5 rounded-2xl bg-[#0a0d17] border border-white/5 space-y-2">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <input
                                                            type="text"
                                                            value={val.title}
                                                            onChange={e => {
                                                                const copy = [...valuesList];
                                                                copy[idx].title = e.target.value;
                                                                setValuesList(copy);
                                                            }}
                                                            placeholder="Titre de la valeur"
                                                            className="flex-1 bg-transparent border-b border-white/10 pb-1 text-xs font-bold text-slate-900 dark:text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                                                        />
                                                        <button onClick={() => removeValue(idx)} className="text-red-400 hover:text-red-300 p-1">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                    <textarea
                                                        rows={2}
                                                        value={val.description}
                                                        onChange={e => {
                                                            const copy = [...valuesList];
                                                            copy[idx].description = e.target.value;
                                                            setValuesList(copy);
                                                        }}
                                                        placeholder="Description de la valeur..."
                                                        className="w-full bg-white/5 border border-white/5 rounded-xl p-2 text-xs text-gray-300"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 5. CHIFFRES CLÉS */}
                                {activeTab === 'stats' && (
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-white/5 pb-2">
                                            5. Chiffres Clés Dynamiques
                                        </h3>
                                        <p className="text-xs text-gray-400">
                                            Les compteurs (produits en ligne, catégories, clients inscrits, commandes traitées) sont automatiquement calculés en temps réel depuis votre base de données.
                                        </p>
                                        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 space-y-1">
                                            <p className="font-bold">✓ Calcul automatique activé :</p>
                                            <p>• Produits : Calculé depuis le catalogue actif</p>
                                            <p>• Clients : Calculé depuis les comptes utilisateurs</p>
                                            <p>• Années d'expérience : Calculé depuis l'année de fondation ({content.historyYear})</p>
                                        </div>
                                    </div>
                                )}

                                {/* 6. NOTRE ÉQUIPE */}
                                {activeTab === 'team' && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                                                6. Membres de l'Équipe ({teamList.length})
                                            </h3>
                                            <button
                                                type="button"
                                                onClick={addTeamMember}
                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                                            >
                                                <Plus size={14} /> Ajouter un membre
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {teamList.map((m, idx) => (
                                                <div key={idx} className="p-3.5 rounded-2xl bg-[#0a0d17] border border-white/5 space-y-2">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <input
                                                            type="text"
                                                            value={m.name}
                                                            onChange={e => {
                                                                const copy = [...teamList];
                                                                copy[idx].name = e.target.value;
                                                                setTeamList(copy);
                                                            }}
                                                            placeholder="Nom et prénom"
                                                            className="flex-1 bg-transparent border-b border-white/10 pb-1 text-xs font-bold text-slate-900 dark:text-slate-900 dark:text-white focus:outline-none"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={m.role}
                                                            onChange={e => {
                                                                const copy = [...teamList];
                                                                copy[idx].role = e.target.value;
                                                                setTeamList(copy);
                                                            }}
                                                            placeholder="Fonction"
                                                            className="flex-1 bg-transparent border-b border-white/10 pb-1 text-xs text-indigo-400 focus:outline-none"
                                                        />
                                                        <button onClick={() => removeTeamMember(idx)} className="text-red-400 hover:text-red-300 p-1">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                    <textarea
                                                        rows={2}
                                                        value={m.bio}
                                                        onChange={e => {
                                                            const copy = [...teamList];
                                                            copy[idx].bio = e.target.value;
                                                            setTeamList(copy);
                                                        }}
                                                        placeholder="Courte présentation..."
                                                        className="w-full bg-white/5 border border-white/5 rounded-xl p-2 text-xs text-gray-300"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 7. ENGAGEMENTS & SAV */}
                                {activeTab === 'commitments' && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                                                7. Engagements & Avantages ({commitmentsList.length})
                                            </h3>
                                            <button
                                                type="button"
                                                onClick={addCommitment}
                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                                            >
                                                <Plus size={14} /> Ajouter un engagement
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {commitmentsList.map((comm, idx) => (
                                                <div key={idx} className="p-3.5 rounded-2xl bg-[#0a0d17] border border-white/5 space-y-2">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <input
                                                            type="text"
                                                            value={comm.title}
                                                            onChange={e => {
                                                                const copy = [...commitmentsList];
                                                                copy[idx].title = e.target.value;
                                                                setCommitmentsList(copy);
                                                            }}
                                                            placeholder="Titre de l'engagement"
                                                            className="flex-1 bg-transparent border-b border-white/10 pb-1 text-xs font-bold text-slate-900 dark:text-slate-900 dark:text-white focus:outline-none"
                                                        />
                                                        <button onClick={() => removeCommitment(idx)} className="text-red-400 hover:text-red-300 p-1">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                    <textarea
                                                        rows={2}
                                                        value={comm.description}
                                                        onChange={e => {
                                                            const copy = [...commitmentsList];
                                                            copy[idx].description = e.target.value;
                                                            setCommitmentsList(copy);
                                                        }}
                                                        placeholder="Description de l'engagement..."
                                                        className="w-full bg-white/5 border border-white/5 rounded-xl p-2 text-xs text-gray-300"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 8. GALERIE */}
                                {activeTab === 'gallery' && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                                                8. Galerie & Médias ({galleryList.length})
                                            </h3>
                                            <button
                                                type="button"
                                                onClick={addGalleryItem}
                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                                            >
                                                <Plus size={14} /> Ajouter une photo
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {galleryList.map((img, idx) => (
                                                <div key={idx} className="relative rounded-xl overflow-hidden border border-white/10 h-32 group">
                                                    <img src={img.imageUrl} alt={img.caption} className="w-full h-full object-cover" />
                                                    <button
                                                        onClick={() => removeGalleryItem(idx)}
                                                        className="absolute top-2 right-2 p-1 rounded-full bg-red-600 text-slate-900 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 9. RÉSEAUX & CONTACT */}
                                {activeTab === 'contact' && (
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-white/5 pb-2">
                                            9. Coordonnées & Réseaux Sociaux
                                        </h3>
                                        <p className="text-xs text-gray-400">
                                            Les coordonnées principales proviennent de vos paramètres généraux de boutique. Vous pouvez également configurer des liens dédiés ci-dessous.
                                        </p>
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2 text-xs text-gray-300">
                                            <p><strong className="text-slate-900 dark:text-white">Email de contact :</strong> contact@peoc.cm</p>
                                            <p><strong className="text-slate-900 dark:text-white">Téléphone :</strong> +237 686 669 222</p>
                                            <p><strong className="text-slate-900 dark:text-white">WhatsApp :</strong> +237 686 669 222</p>
                                            <p><strong className="text-slate-900 dark:text-white">Localisation :</strong> Ouest Cameroun</p>
                                        </div>
                                    </div>
                                )}

                                {/* 10. RÉFÉRENCEMENT SEO */}
                                {activeTab === 'seo' && (
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-white/5 pb-2">
                                            10. Référencement & Métadonnées SEO
                                        </h3>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 mb-1">Titre de la page (Meta Title)</label>
                                            <input
                                                type="text"
                                                defaultValue="À Propos de DAKORA BUSINESS • Leader Matériel Élevage Cameroun"
                                                className="w-full bg-slate-50 dark:bg-[#0a0d17] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 mb-1">Description SEO (Meta Description)</label>
                                            <textarea
                                                rows={3}
                                                defaultValue="Découvrez l'histoire, la mission et les équipements modernes de DAKORA BUSINESS au Cameroun. Couveuses, abreuvoirs et solutions d'élevage certifiées."
                                                className="w-full bg-slate-50 dark:bg-[#0a0d17] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                )}

                            </div>
                        )}
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
};

export default AboutAdmin;
