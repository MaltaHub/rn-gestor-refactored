'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { updateProfile, updateEmail, updatePassword } from '@/services/perfil';
import { signOut } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { User as UserIcon, Lock, Camera, LogOut } from 'lucide-react';

export default function PerfilPage() {
  const { user } = useAuth();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [feedback, setFeedback] = useState<{type: 'success' | 'error', message: string} | null>(null);
  
  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || '');
      setEmail(user.email || '');
      setAvatarUrl(user.user_metadata?.avatar_url || '');
    }
  }, [user]);
  
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProfile(true);
    setFeedback(null);
    
    try {
      await updateProfile({
        full_name: fullName,
        avatar_url: avatarUrl
      });
      
      if (email !== user?.email) {
        await updateEmail(email);
        setFeedback({
          type: 'success',
          message: 'Perfil atualizado! Verifique seu novo email para confirmar.'
        });
      } else {
        setFeedback({
          type: 'success',
          message: 'Perfil atualizado com sucesso!'
        });
      }
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Erro ao atualizar perfil'
      });
    } finally {
      setLoadingProfile(false);
    }
  };
  
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingPassword(true);
    setFeedback(null);
    
    if (newPassword !== confirmPassword) {
      setFeedback({
        type: 'error',
        message: 'As senhas não coincidem'
      });
      setLoadingPassword(false);
      return;
    }
    
    if (newPassword.length < 6) {
      setFeedback({
        type: 'error',
        message: 'A senha deve ter no mínimo 6 caracteres'
      });
      setLoadingPassword(false);
      return;
    }
    
    try {
      await updatePassword({
        currentPassword,
        newPassword
      });
      
      setFeedback({
        type: 'success',
        message: 'Senha alterada com sucesso!'
      });
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Erro ao alterar senha'
      });
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleLogout = async () => {
    if (!window.confirm('Deseja realmente sair?')) return;
    
    try {
      await signOut();
    } catch (error) {
      setFeedback({
        type: 'error',
        message: 'Erro ao sair. Tente novamente.'
      });
    }
  };

  if (!user) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Meu Perfil</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gerencie suas informações pessoais e preferências
          </p>
        </header>
        
        {feedback && (
          <div className={`mb-6 rounded-lg p-4 ${
            feedback.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
          }`}>
            {feedback.message}
          </div>
        )}
        
        <Card className="mb-6 p-6">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
            <UserIcon className="h-5 w-5" />
            Informações Pessoais
          </h2>
          
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nome completo
              </label>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Seu nome completo"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Camera className="inline h-4 w-4 mr-1" />
                URL do Avatar
              </label>
              <Input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://exemplo.com/foto.jpg"
              />
            </div>
            
            {avatarUrl && (
              <div className="flex items-center gap-3">
                <img
                  src={avatarUrl}
                  alt="Avatar preview"
                  className="h-16 w-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Preview do avatar
                </span>
              </div>
            )}
            
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                variant="primary"
                disabled={loadingProfile}
              >
                {loadingProfile ? 'Salvando...' : 'Salvar alterações'}
              </Button>
            </div>
          </form>
        </Card>
        
        <Card className="p-6">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
            <Lock className="h-5 w-5" />
            Alterar Senha
          </h2>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Senha atual
              </label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nova senha
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirmar nova senha
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                variant="primary"
                disabled={loadingPassword || !currentPassword || !newPassword || !confirmPassword}
              >
                {loadingPassword ? 'Alterando...' : 'Alterar senha'}
              </Button>
            </div>
          </form>
        </Card>
        
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Deseja encerrar sua sessão no sistema?
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={handleLogout}
            className="w-full sm:w-auto flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20"
          >
            <LogOut className="h-4 w-4" />
            Sair da conta
          </Button>
        </div>
      </div>
    </div>
  );
}
