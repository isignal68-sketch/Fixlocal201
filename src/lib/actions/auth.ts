'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { sendWelcomeEmail } from '@/lib/email/send-transactional-email';
import { emitAutomationEvent } from '@/lib/automation/emit-event';
import {
  signUpSchema,
  signInSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type SignUpInput,
  type SignInInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from '@/lib/validations/auth';

export interface AuthActionResult {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
}

async function getSiteUrl() {
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  return process.env.NEXT_PUBLIC_SITE_URL ?? `${protocol}://${host}`;
}

export async function signUpAction(input: SignUpInput): Promise<AuthActionResult> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { success: false, fieldErrors };
  }

  const supabase = await createClient();
  const siteUrl = await getSiteUrl();

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
      data: {
        full_name: parsed.data.fullName,
        role: parsed.data.role,
      },
    },
  });

  if (error) {
    return { success: false, message: error.message };
  }

  if (data.user && data.user.identities?.length === 0) {
    return {
      success: false,
      message: 'An account with this email already exists. Try signing in instead.',
    };
  }

  await sendWelcomeEmail(parsed.data.email, parsed.data.fullName);

  if (data.user) {
    await emitAutomationEvent('user.registered', {
      userId: data.user.id,
      email: parsed.data.email,
      fullName: parsed.data.fullName,
      role: parsed.data.role,
    });
  }

  return { success: true };
}

export async function signInAction(input: SignInInput): Promise<AuthActionResult> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { success: false, fieldErrors };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    console.error('[auth] signInWithPassword failed for', parsed.data.email, '-', error.message);
    return { success: false, message: 'Incorrect email or password.' };
  }

  console.log('[auth] sign-in succeeded for', parsed.data.email);
  return { success: true };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

export async function forgotPasswordAction(
  input: ForgotPasswordInput
): Promise<AuthActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: 'Enter a valid email address.' };
  }

  const supabase = await createClient();
  const siteUrl = await getSiteUrl();

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true };
}

export async function resetPasswordAction(input: ResetPasswordInput): Promise<AuthActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { success: false, fieldErrors };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true };
}

export async function signInWithGoogleAction() {
  const supabase = await createClient();
  const siteUrl = await getSiteUrl();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error || !data.url) {
    console.error('[auth] Google OAuth init failed:', error?.message ?? 'no redirect url returned');
    redirect('/login?error=oauth_failed');
  }

  redirect(data.url);
}

export async function signInWithAppleAction() {
  const supabase = await createClient();
  const siteUrl = await getSiteUrl();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error || !data.url) {
    console.error('[auth] Apple OAuth init failed:', error?.message ?? 'no redirect url returned');
    redirect('/login?error=oauth_failed');
  }

  redirect(data.url);
}

export async function resendVerificationEmailAction(email: string): Promise<AuthActionResult> {
  const supabase = await createClient();
  const siteUrl = await getSiteUrl();

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true };
}
