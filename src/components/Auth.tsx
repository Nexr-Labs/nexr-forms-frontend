import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle, Layout, Sparkles } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { Button, Input, Card } from './UI';

export const Auth = () => {
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.name, formData.email, formData.password);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setFormData({ name: '', email: 'demo@example.com', password: 'password' });
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-8 sm:py-12 sm:px-6 lg:px-8 relative overflow-hidden bg-black">
      {/* Abstract monochrome background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-white/[0.03] rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-white/[0.02] rounded-full blur-3xl"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md flex items-center justify-center shadow-2xl shadow-white/5">
            <Layout className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-bold text-white tracking-tight">
          {isLogin ? 'Welcome back' : 'Create account'}
        </h2>
        <p className="mt-3 text-center text-sm text-zinc-500">
          {isLogin ? 'Sign in to manage your events' : 'Get started with minimalist event hosting'}
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Card className="py-6 sm:py-8 px-4 sm:px-10 shadow-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <Input
                label="Full Name"
                value={formData.name}
                onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            )}
            <Input
              label="Email address"
              type="email"
              value={formData.email}
              onChange={(e: any) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e: any) => setFormData({ ...formData, password: e.target.value })}
              required
            />

            {error && <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-zinc-300 text-sm text-center">{error}</div>}

            <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>

          {isLogin && (
            <div className="mt-4">
              <button
                type="button"
                onClick={fillDemo}
                className="w-full py-2 text-xs uppercase tracking-widest text-zinc-500 hover:text-white transition-colors border border-dashed border-zinc-800 hover:border-zinc-600 rounded-lg flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3 h-3" />
                Auto-fill Demo Credentials
              </button>
            </div>
          )}

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-black text-zinc-500 uppercase text-xs tracking-wider">Or</span>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="text-sm font-medium text-white hover:text-zinc-300 transition-colors underline decoration-zinc-700 underline-offset-4"
              >
                {isLogin ? 'Create a new account' : 'Sign in to existing account'}
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};