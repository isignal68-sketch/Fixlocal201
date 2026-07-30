import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getCategoryIcon } from '@/lib/category-icons';
import { CategoryFormDialog } from '@/components/shared/category-form-dialog';
import { DeleteCategoryButton } from '@/components/shared/delete-category-button';
import type { CategoryRow } from '@/types/database';

export const metadata: Metadata = { title: 'Categories' };

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
  const categories = (data as CategoryRow[]) ?? [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Categories</h1>
        <CategoryFormDialog />
      </div>

      <div className="mt-6 divide-y divide-border rounded-2xl border border-border">
        {categories.map((category) => {
          const Icon = getCategoryIcon(category.icon);
          return (
            <div key={category.id} className="flex items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary-50 text-primary">
                  <Icon className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{category.name}</p>
                  <p className="text-xs text-muted-foreground">{category.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={
                    category.is_active
                      ? 'rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800'
                      : 'rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700'
                  }
                >
                  {category.is_active ? 'Active' : 'Inactive'}
                </span>
                <CategoryFormDialog category={category} />
                <DeleteCategoryButton categoryId={category.id} name={category.name} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
