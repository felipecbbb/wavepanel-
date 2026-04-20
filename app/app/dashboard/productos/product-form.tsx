'use client';

import { useActionState } from 'react';
import { Button } from '@/components/button';
import { createProductAction, updateProductAction, type ProductFormState } from './actions';

export type ProductInitial = {
  name: string;
  slug: string;
  description: string | null;
  price_cents: number;
  stock: number;
  category: string | null;
  image_url: string | null;
  active: boolean;
};

export default function ProductForm({
  id,
  initial,
}: {
  id?: string;
  initial?: ProductInitial;
}) {
  const action = id ? updateProductAction.bind(null, id) : createProductAction;
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(action, null);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-3">
        <label className="block">
          <span className="font-label text-[0.72rem] text-navy block mb-1.5">Nombre</span>
          <input name="name" type="text" defaultValue={initial?.name ?? ''} required
            className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy" />
        </label>
        <label className="block">
          <span className="font-label text-[0.72rem] text-navy block mb-1.5">Slug (opcional)</span>
          <input name="slug" type="text" defaultValue={initial?.slug ?? ''} placeholder="se genera del nombre"
            className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy font-mono" />
        </label>
      </div>

      <label className="block">
        <span className="font-label text-[0.72rem] text-navy block mb-1.5">Descripción</span>
        <textarea name="description" rows={3} defaultValue={initial?.description ?? ''}
          className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy resize-y" />
      </label>

      <div className="grid grid-cols-3 gap-3">
        <label className="block">
          <span className="font-label text-[0.72rem] text-navy block mb-1.5">Precio (€)</span>
          <input name="price_euros" type="number" step="0.50" min={0}
            defaultValue={initial ? (initial.price_cents / 100).toFixed(2) : '0'} required
            className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy" />
        </label>
        <label className="block">
          <span className="font-label text-[0.72rem] text-navy block mb-1.5">Stock</span>
          <input name="stock" type="number" min={0} defaultValue={initial?.stock ?? 0}
            className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy" />
        </label>
        <label className="block">
          <span className="font-label text-[0.72rem] text-navy block mb-1.5">Categoría</span>
          <input name="category" type="text" defaultValue={initial?.category ?? ''} placeholder="ropa, material…"
            className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy" />
        </label>
      </div>

      <label className="block">
        <span className="font-label text-[0.72rem] text-navy block mb-1.5">Imagen (URL)</span>
        <input name="image_url" type="url" defaultValue={initial?.image_url ?? ''} placeholder="https://…"
          className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-navy" />
      </label>

      <label className="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" name="active" defaultChecked={initial?.active ?? true} className="h-4 w-4" />
        <span>Activo (visible en la tienda pública)</span>
      </label>

      {state && !state.ok && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 border border-red-100">{state.error}</p>
      )}
      {state?.ok && id && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800 border border-emerald-100">
          Guardado.
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" variant="dark" disabled={pending}>
          {pending ? 'Guardando…' : id ? 'Guardar cambios' : 'Crear producto'}
        </Button>
      </div>
    </form>
  );
}
