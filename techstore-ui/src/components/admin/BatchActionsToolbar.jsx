import React from 'react';
import { Check, X, Loader2 } from 'lucide-react';

/**
 * Toolbar affichant les actions groupées sur les collections sélectionnées.
 * Toutes les callbacks reçoivent directement le tableau d'IDs sélectionnés.
 */
export default function BatchActionsToolbar({
  selectedCount,
  loading,
  onActivate,
  onDeactivate,
  onPublish,
  onUnpublish,
  onDelete,
  onExport,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 p-2 bg-[#0b0e14] rounded-2xl border border-white/5">
      <span className="text-sm text-gray-400">{selectedCount} sélectionnée(s)</span>
      <button
        disabled={loading}
        onClick={onActivate}
        className="px-3 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs"
      >
        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Check size={14} />}{' '}Activer
      </button>
      <button
        disabled={loading}
        onClick={onDeactivate}
        className="px-3 py-1 rounded bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs"
      >
        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <X size={14} />}{' '}Désactiver
      </button>
      <button
        disabled={loading}
        onClick={onPublish}
        className="px-3 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 text-xs"
      >
        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Check size={14} />}{' '}Publier
      </button>
      <button
        disabled={loading}
        onClick={onUnpublish}
        className="px-3 py-1 rounded bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 text-xs"
      >
        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <X size={14} />}{' '}Dépublier
      </button>
      <button
        disabled={loading}
        onClick={onDelete}
        className="px-3 py-1 rounded bg-red-800/20 hover:bg-red-800/30 text-red-300 text-xs"
      >
        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <X size={14} />}{' '}Supprimer
      </button>
      <button
        disabled={loading}
        onClick={onExport}
        className="px-3 py-1 rounded bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 text-xs"
      >
        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Check size={14} />}{' '}Exporter
      </button>
    </div>
  );
}
