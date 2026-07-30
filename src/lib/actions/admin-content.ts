'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { logAdminAction } from '@/lib/admin/log-action';
import { slugify } from '@/lib/utils';

export interface AdminContentResult {
  success: boolean;
  message?: string;
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------
const categorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(300).optional().or(z.literal('')),
  icon: z.string().trim().min(1),
  isActive: z.boolean(),
});

export async function createCategoryAction(
  input: z.infer<typeof categorySchema>
): Promise<AdminContentResult> {
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { success: false, message: 'Please check the form for errors.' };

  const supabase = await createClient();
  const { error } = await supabase.from('categories').insert({
    name: parsed.data.name,
    slug: slugify(parsed.data.name),
    description: parsed.data.description || null,
    icon: parsed.data.icon,
    is_active: parsed.data.isActive,
  });

  if (error) return { success: false, message: error.message };

  await logAdminAction('create_category', 'categories');
  revalidatePath('/admin/categories');
  return { success: true };
}

export async function updateCategoryAction(
  categoryId: string,
  input: z.infer<typeof categorySchema>
): Promise<AdminContentResult> {
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { success: false, message: 'Please check the form for errors.' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('categories')
    .update({
      name: parsed.data.name,
      slug: slugify(parsed.data.name),
      description: parsed.data.description || null,
      icon: parsed.data.icon,
      is_active: parsed.data.isActive,
    })
    .eq('id', categoryId);

  if (error) return { success: false, message: error.message };

  await logAdminAction('update_category', 'categories', categoryId);
  revalidatePath('/admin/categories');
  return { success: true };
}

export async function deleteCategoryAction(categoryId: string): Promise<AdminContentResult> {
  const supabase = await createClient();
  const { error } = await supabase.from('categories').delete().eq('id', categoryId);

  if (error) return { success: false, message: error.message };

  await logAdminAction('delete_category', 'categories', categoryId);
  revalidatePath('/admin/categories');
  return { success: true };
}

// ---------------------------------------------------------------------------
// Cities
// ---------------------------------------------------------------------------
const citySchema = z.object({
  name: z.string().trim().min(1).max(100),
  stateCode: z.string().trim().length(2),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  population: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean(),
});

export async function createCityAction(input: z.infer<typeof citySchema>): Promise<AdminContentResult> {
  const parsed = citySchema.safeParse(input);
  if (!parsed.success) return { success: false, message: 'Please check the form for errors.' };

  const supabase = await createClient();
  const { error } = await supabase.from('cities').insert({
    name: parsed.data.name,
    slug: slugify(parsed.data.name),
    state_code: parsed.data.stateCode.toUpperCase(),
    latitude: parsed.data.latitude,
    longitude: parsed.data.longitude,
    population: parsed.data.population ?? null,
    is_active: parsed.data.isActive,
  });

  if (error) return { success: false, message: error.message };

  await logAdminAction('create_city', 'cities');
  revalidatePath('/admin/cities');
  return { success: true };
}

export async function toggleCityActiveAction(
  cityId: string,
  isActive: boolean
): Promise<AdminContentResult> {
  const supabase = await createClient();
  const { error } = await supabase.from('cities').update({ is_active: isActive }).eq('id', cityId);

  if (error) return { success: false, message: error.message };

  await logAdminAction('toggle_city_active', 'cities', cityId, { isActive });
  revalidatePath('/admin/cities');
  return { success: true };
}

export async function deleteCityAction(cityId: string): Promise<AdminContentResult> {
  const supabase = await createClient();
  const { error } = await supabase.from('cities').delete().eq('id', cityId);

  if (error) return { success: false, message: error.message };

  await logAdminAction('delete_city', 'cities', cityId);
  revalidatePath('/admin/cities');
  return { success: true };
}

// ---------------------------------------------------------------------------
// Coupons
// ---------------------------------------------------------------------------
const couponSchema = z.object({
  code: z.string().trim().min(3).max(30),
  discountType: z.enum(['percent', 'fixed']),
  discountValue: z.coerce.number().int().min(1),
  maxRedemptions: z.coerce.number().int().min(1).optional(),
  expiresAt: z.string().optional(),
  isActive: z.boolean(),
});

export async function createCouponAction(
  input: z.infer<typeof couponSchema>
): Promise<AdminContentResult> {
  const parsed = couponSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: 'Please check the form for errors.' };

  const supabase = await createClient();
  const { error } = await supabase.from('coupons').insert({
    code: parsed.data.code.toUpperCase(),
    discount_type: parsed.data.discountType,
    discount_value: parsed.data.discountType === 'fixed'
      ? Math.round(parsed.data.discountValue * 100)
      : parsed.data.discountValue,
    max_redemptions: parsed.data.maxRedemptions ?? null,
    expires_at: parsed.data.expiresAt || null,
    is_active: parsed.data.isActive,
  });

  if (error) return { success: false, message: error.message };

  await logAdminAction('create_coupon', 'coupons');
  revalidatePath('/admin/coupons');
  return { success: true };
}

export async function toggleCouponActiveAction(
  couponId: string,
  isActive: boolean
): Promise<AdminContentResult> {
  const supabase = await createClient();
  const { error } = await supabase.from('coupons').update({ is_active: isActive }).eq('id', couponId);

  if (error) return { success: false, message: error.message };

  await logAdminAction('toggle_coupon_active', 'coupons', couponId, { isActive });
  revalidatePath('/admin/coupons');
  return { success: true };
}

export async function deleteCouponAction(couponId: string): Promise<AdminContentResult> {
  const supabase = await createClient();
  const { error } = await supabase.from('coupons').delete().eq('id', couponId);

  if (error) return { success: false, message: error.message };

  await logAdminAction('delete_coupon', 'coupons', couponId);
  revalidatePath('/admin/coupons');
  return { success: true };
}
