import api from '../api/axiosConfig';

/**
 * AboutService - Gestion du contenu dynamique CMS de la page "À propos"
 */
const AboutService = {
    /**
     * Récupère le contenu public publié + statistiques réelles
     */
    getPublic: async () => {
        const response = await api.get('/about');
        return response.data;
    },

    /**
     * Récupère le contenu CMS pour l'administration
     */
    adminGet: async () => {
        const response = await api.get('/admin/about');
        return response.data;
    },

    /**
     * Enregistre le contenu (soit en brouillon, soit directement publié)
     */
    adminSave: async (content, publish = false) => {
        const response = await api.put('/admin/about', content, {
            params: { publish }
        });
        return response.data;
    },

    /**
     * Publie explicitement le brouillon
     */
    adminPublish: async () => {
        const response = await api.post('/admin/about/publish');
        return response.data;
    }
};

export default AboutService;
