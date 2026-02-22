import React from 'react';
import { Link } from 'react-router-dom';
import {
    Sparkles,
    GitBranch,
    TrendingUp,
    MessageCircle,
    Palette,
    ArrowRight,
    Shield,
    Zap
} from 'lucide-react';
import { Button } from '../components/UI';
import { useAuth } from '../lib/auth';

export const Home = () => {
    const { user } = useAuth();
    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-lg border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">EventFlow</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {user ? (
                            <Link to="/dashboard">
                                <Button variant="primary" className="!py-1.5 !px-4 text-xs">Dashboard</Button>
                            </Link>
                        ) : (
                            <>
                                <Link to="/auth" className="text-sm text-zinc-400 hover:text-white transition-colors">Sign In</Link>
                                <Link to="/auth">
                                    <Button variant="primary" className="!py-1.5 !px-4 text-xs">Get Started</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-500/20 blur-[120px] rounded-full -z-10"></div>
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-blue-300 font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Sparkles className="w-3 h-3" />
                        <span>v2.0 Now Available</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
                        Create Stunning <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">Event Forms</span>
                    </h1>
                    <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                        The most powerful event registration platform. Build logic-driven forms, visualize analytics, and connect with your audience instantly.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                        <Link to={user ? "/dashboard" : "/auth"}>
                            <Button className="h-12 px-8 text-base">Start Building Free</Button>
                        </Link>
                        <Link to="/dashboard">
                            <button className="h-12 px-8 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-white/10 flex items-center gap-2">
                                Go to Dashboard <ArrowRight className="w-4 h-4" />
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 px-6 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Everything you need</h2>
                        <p className="text-zinc-400">Powerful features to manage your events like a pro</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Feature 1 */}
                        <div className="p-8 rounded-2xl bg-zinc-900/50 border border-white/10 hover:border-blue-500/50 transition-colors group">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                                <GitBranch className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Smart Logic</h3>
                            <p className="text-zinc-400 leading-relaxed">Create dynamic user journeys. Show/hide questions or skip sections based on previous answers.</p>
                        </div>

                        {/* Feature 2 */}
                        <div className="p-8 rounded-2xl bg-zinc-900/50 border border-white/10 hover:border-purple-500/50 transition-colors group">
                            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
                                <TrendingUp className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Visual Analytics</h3>
                            <p className="text-zinc-400 leading-relaxed">Real-time charts and insights. Understand your data with beautiful visualizations and CSV exports.</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="p-8 rounded-2xl bg-zinc-900/50 border border-white/10 hover:border-green-500/50 transition-colors group">
                            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-500/20 transition-colors">
                                <MessageCircle className="w-6 h-6 text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">WhatsApp Integration</h3>
                            <p className="text-zinc-400 leading-relaxed">Boost engagement. Automatically invite attendees to join your WhatsApp group upon registration.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 border-t border-white/10 text-center text-zinc-500 text-sm">
                <p>© 2024 EventFlow. All rights reserved.</p>
            </footer>
        </div>
    );
};
