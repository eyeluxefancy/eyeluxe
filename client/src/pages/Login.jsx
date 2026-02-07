import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError('Failed to log in. Please check your credentials.');
            console.error(err);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1a1a1a] via-[#0a0a0a] to-[#000000] p-4 text-white">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#cd9d5d20] rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#cd9d5d10] rounded-full blur-[120px]"></div>
            </div>

            <div className="w-full max-w-md relative">
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-extrabold tracking-tighter mb-2 bg-gradient-to-r from-[#cd9d5d] to-[#f5d7a1] bg-clip-text text-transparent">
                        EYELUXE
                    </h1>
                    <p className="text-gray-400 text-sm tracking-widest uppercase">Inventory Management</p>
                </div>

                <div className="bg-[#1a1a1a]/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#cd9d5d0a] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 px-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#cd9d5d]/50 focus:border-[#cd9d5d]/50 transition-all duration-300"
                                placeholder="admin@eyeluxe.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 px-1">
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#cd9d5d]/50 focus:border-[#cd9d5d]/50 transition-all duration-300"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs py-3 px-4 rounded-xl flex items-center animate-pulse">
                                <span className="mr-2">⚠️</span> {error}
                            </div>
                        )}

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full bg-gradient-to-r from-[#cd9d5d] to-[#e5c08d] hover:from-[#e5c08d] hover:to-[#cd9d5d] text-black font-bold py-4 rounded-2xl transition-all duration-500 transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(205,157,93,0.3)] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
                        >
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </form>
                </div>

                <div className="mt-8 text-center text-gray-500 text-xs">
                    © 2024 Eyeluxe Boutique. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default Login;
