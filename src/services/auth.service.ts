import { supabase } from '@/lib/supabase';

export type AuthMode = 'login' | 'signup';

export class AuthService {
 static async signIn(email: string, password: string) {
  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (error) {
    console.error('Erreur connexion Supabase:', error);
    throw error;
  }

  console.log('Connexion Supabase:', data);

  return data;
}

  static async signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error('Erreur inscription Supabase:', error);
    throw error;
  }

  console.log('Inscription Supabase:', data);

  return data;
}


  static async authenticate(
    mode: AuthMode,
    email: string,
    password: string
  ) {
    if (mode === 'signup') {
      return this.signUp(email, password);
    }

    return this.signIn(email, password);
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;
  }

  static getFriendlyError(message: string) {
  if (message.includes('Too Many Requests')) {
    return 'Trop de tentatives. Veuillez patienter quelques minutes avant de réessayer.';
  }

  if (message.includes('rate limit')) {
    return 'Trop de tentatives. Veuillez patienter quelques minutes avant de réessayer.';
  }

  if (message.includes('Invalid login credentials')) {
    return 'Email ou mot de passe incorrect.';
  }

  if (message.includes('User already registered')) {
    return 'Un compte existe déjà avec cet email. Connectez-vous.';
  }

  if (message.includes('Email not confirmed')) {
    return 'Veuillez confirmer votre email.';
  }

  return 'Une erreur est survenue. Veuillez réessayer.';
}
}