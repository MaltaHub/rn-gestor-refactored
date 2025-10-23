import { supabase } from "@/lib/supabase-client";

export interface UpdateProfileData {
  full_name?: string;
  avatar_url?: string;
}

export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
}

export async function getProfile() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export async function updateProfile(data: UpdateProfileData) {
  const { data: userData, error } = await supabase.auth.updateUser({
    data: {
      full_name: data.full_name,
      avatar_url: data.avatar_url,
    }
  });
  
  if (error) throw error;
  return userData;
}

export async function updateEmail(newEmail: string) {
  const { data, error } = await supabase.auth.updateUser({
    email: newEmail
  });
  
  if (error) throw error;
  return data;
}

export async function updatePassword(passwordData: UpdatePasswordData) {
  // 1. Obter email do usuário atual
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user?.email) throw new Error('Usuário não encontrado');
  
  // 2. Reautenticar com senha atual para validar
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: passwordData.currentPassword
  });
  
  if (signInError) {
    throw new Error('Senha atual incorreta');
  }
  
  // 3. Atualizar para nova senha (agora com sessão fresca)
  const { error: updateError } = await supabase.auth.updateUser({
    password: passwordData.newPassword
  });
  
  if (updateError) throw updateError;
}
