import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthService from '../../services/auth.service';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { UserPlus, ShieldCheck, Eye, EyeOff, ChevronRight } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (formData.password !== formData.confirmPassword) {
            return setError("Les mots de passe ne sont pas identiques.");
        }
        if (formData.password.length < 6) {
            return setError("Le mot de passe doit comporter au moins 6 caractères.");
        }

        setLoading(true);
        try {
            const { confirmPassword, ...registerPayload } = formData;
            await AuthService.register(registerPayload);
            setSuccessMsg("Votre compte a été créé avec succès ! Redirection vers la connexion...");
            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (err) {
            console.error("Erreur register:", err);
            const msg = (typeof err === 'string' && err) ||
                err.message ||
                err.data?.message ||
                err.response?.data?.message ||
                "Erreur lors de l'inscription.";
            setError(String(msg));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-apple-white flex flex-col items-center justify-center px-6 py-20">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-xl bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-2xl border border-apple-border/50">
                
                <div className="text-center mb-8">
                    <img src="/logo.png" alt="PEOC" className="w-14 h-14 mx-auto mb-3 object-contain rounded-2xl p-1 bg-gray-50 border border-gray-100 shadow-sm" onError={(e) => { e.target.style.display = 'none'; }} />
                    <h2 className="text-3xl sm:text-4xl font-black italic tracking-tighter text-apple-dark leading-none">Créer un profil.</h2>
                    <p className="text-apple-dark/50 mt-3 font-bold uppercase text-[10px] tracking-widest">PEOC • Petit Éleveur de l'Ouest Cameroun</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100 italic">
                        {error}
                    </div>
                )}

                {successMsg && (
                    <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-2xl text-sm font-bold border border-emerald-100">
                        {successMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input 
                        label="Prénom" 
                        name="firstName" 
                        value={formData.firstName}
                        placeholder="Valdes" 
                        onChange={handleChange} 
                        required 
                    />
                    <Input 
                        label="Nom" 
                        name="lastName" 
                        value={formData.lastName}
                        placeholder="Tenwo" 
                        onChange={handleChange} 
                        required 
                    />
                    <div className="md:col-span-2">
                        <Input 
                            label="Adresse e-mail" 
                            name="email" 
                            type="email" 
                            value={formData.email}
                            placeholder="valdestenwo@gmail.com" 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    <div className="md:col-span-2">
                        <Input 
                            label="Téléphone" 
                            name="phone" 
                            value={formData.phone}
                            placeholder="+237 6xx xxx xxx" 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    <Input 
                        label="Mot de passe" 
                        name="password" 
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange} 
                        placeholder="••••••••"
                        required 
                        rightElement={
                            <div onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </div>
                        }
                    />
                    <Input 
                        label="Confirmer le mot de passe" 
                        name="confirmPassword" 
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleChange} 
                        placeholder="••••••••"
                        required 
                        rightElement={
                            <div onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </div>
                        }
                    />

                    <div className="md:col-span-2 pt-4">
                        <Button type="submit" className="w-full py-5 text-base font-black uppercase tracking-widest shadow-xl shadow-indigo-100" loading={loading}>
                            Rejoindre PEOC <ChevronRight className="ml-2" size={18} strokeWidth={3} />
                        </Button>
                    </div>
                </form>

                <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                    <p className="text-xs text-apple-dark/50 italic mb-4 flex justify-center items-center">
                        <ShieldCheck size={16} className="mr-2 text-green-500" /> Vos données sont protégées.
                    </p>
                    <Link to="/login" className="text-indigo-600 font-black text-sm uppercase tracking-tight hover:underline">
                        Déjà un compte ? Se connecter.
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
