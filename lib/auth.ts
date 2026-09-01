/**
 * Authentication Utilities
 * Handles sign up, sign in, sign out, and profile creation
 */

import { getSupabaseBrowserClient } from "./supabase";
import { createProfile, getProfile } from "./database";

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: Record<string, any>;
}

function getFriendlyAuthError(
  error: { message?: string; status?: number } | null,
  fallback: string
): string {
  const message = error?.message?.toLowerCase() ?? "";

  const rateLimitPatterns = [
    "rate limit",
    "too many requests",
    "too many attempts",
    "many attempts",
    "request limit exceeded",
    "too many sign in attempts",
    "too many sign-up attempts",
  ];

  if (
    error?.status === 429 ||
    rateLimitPatterns.some((pattern) => message.includes(pattern))
  ) {
    return "המערכת חרגה ממגבלת שליחת אימיילים זמנית. המתינו כמה דקות ונסו שוב, או התחברו באמצעות Google.";
  }

  if (message.includes("email") && message.includes("already")) {
    return "כתובת הדוא״ל כבר רשומה במערכת. נסו להתחבר במקום.";
  }

  return error?.message || fallback;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isStrongPassword(password: string): boolean {
  return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email || "",
    user_metadata: user.user_metadata,
  };
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<{
  success: boolean;
  error?: string;
  userId?: string;
  needsEmailConfirmation?: boolean;
}> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { success: false, error: "Supabase not configured" };
  }

  const trimmedEmail = email.trim();
  const trimmedName = displayName.trim();

  if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
    return { success: false, error: "כתובת הדוא״ל לא תקינה" };
  }

  if (!trimmedName) {
    return { success: false, error: "שם תצוגה הוא חובה" };
  }

  if (!isStrongPassword(password)) {
    return {
      success: false,
      error: "הסיסמה חייבת להכיל לפחות 8 תווים, אות גדולה ומספר",
    };
  }

  try {
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          display_name: trimmedName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      return {
        success: false,
        error: getFriendlyAuthError(signUpError as any, "נכשל הרישום"),
      };
    }

    if (!data.user) {
      return { success: false, error: "הרשמה נכשלה ללא משתמש" };
    }

    if (!data.session) {
      return {
        success: true,
        userId: data.user.id,
        needsEmailConfirmation: true,
      };
    }

    const profile = await createProfile(data.user.id, trimmedName);
    if (!profile) {
      console.warn("Profile creation failed for active session user:", data.user.id);
    }

    const { error: subError } = await (supabase.from("subscriptions") as any)
      .upsert(
        {
          user_id: data.user.id,
          status: "free",
        },
        { onConflict: "user_id" }
      );

    if (subError) {
      console.warn("Subscription sync warning:", subError);
    }

    return { success: true, userId: data.user.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: getFriendlyAuthError({ message }, "אירעה שגיאה בהרשמה") };
  }
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { success: false, error: "Supabase not configured" };
  }

  const trimmedEmail = email.trim();

  if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
    return { success: false, error: "כתובת הדוא״ל לא תקינה" };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    if (error) {
      return {
        success: false,
        error: getFriendlyAuthError(error as any, "התחברות נכשלה"),
      };
    }

    if (!data.user) {
      return { success: false, error: "התחברות נכשלה" };
    }

    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email || "",
        user_metadata: data.user.user_metadata,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: getFriendlyAuthError({ message }, "אירעה שגיאה בהתחברות") };
  }
}

export async function signInWithGoogle(): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      return {
        success: false,
        error: getFriendlyAuthError(error as any, "נכשלה ההתחברות עם Google"),
      };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: getFriendlyAuthError({ message }, "נכשלה ההתחברות עם Google") };
  }
}

export async function signOut(): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function resetPassword(email: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { success: false, error: "Supabase not configured" };
  }

  const trimmedEmail = email.trim();

  if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
    return { success: false, error: "כתובת הדוא״ל לא תקינה" };
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: `${window.location.origin}/auth/reset`,
    });

    if (error) {
      return {
        success: false,
        error: getFriendlyAuthError(error as any, "לא ניתן לאפס סיסמה"),
      };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: getFriendlyAuthError({ message }, "לא ניתן לאפס סיסמה"),
    };
  }
}

/**
 * Update password
 */
export async function updatePassword(newPassword: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}

/**
 * Get user profile data
 */
export async function getUserProfile() {
  const user = await getCurrentUser();
  if (!user) return null;

  return await getProfile(user.id);
}
