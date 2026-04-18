'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { moveEnrollmentAction } from './actions';

/**
 * Drag-layer: se monta una vez por página y delega eventos nativos HTML5 drag
 * sobre los elementos que llevan data-attrs específicos. El server component
 * marca los rows y drop zones en el JSX; aquí solo cableamos el browser.
 *
 * Data attrs esperados:
 *   Draggable rows (cada alumno inscrito):
 *     data-enrollment-id="<uuid>"
 *     data-source-class-id="<uuid>"
 *     data-activity-id="<uuid>"    -> restringe el destino
 *     data-client-name="<nombre>"  -> para mensaje de confirm opcional
 *
 *   Drop zones (la lista de enrollments de cada clase):
 *     data-drop-class-id="<uuid>"
 *     data-drop-activity-id="<uuid>"
 *     data-drop-full="true|false"
 */
export default function DragLayer() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ kind: 'error' | 'info'; text: string } | null>(null);
  const dragData = useRef<{ enrollmentId: string; sourceClassId: string; activityId: string } | null>(null);

  useEffect(() => {
    function onDragStart(e: DragEvent) {
      const target = (e.target as HTMLElement).closest<HTMLElement>('[data-enrollment-id]');
      if (!target) return;
      const enrollmentId = target.dataset.enrollmentId!;
      const sourceClassId = target.dataset.sourceClassId!;
      const activityId = target.dataset.activityId!;
      dragData.current = { enrollmentId, sourceClassId, activityId };

      e.dataTransfer?.setData('text/plain', enrollmentId);
      if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
      target.classList.add('opacity-50');

      // Highlight drop zones válidas (misma actividad, distinta clase, no llena)
      document.querySelectorAll<HTMLElement>('[data-drop-class-id]').forEach((zone) => {
        const sameActivity = zone.dataset.dropActivityId === activityId;
        const sameClass = zone.dataset.dropClassId === sourceClassId;
        const full = zone.dataset.dropFull === 'true';
        if (sameActivity && !sameClass && !full) {
          zone.classList.add('ring-2', 'ring-yellow/70', 'ring-offset-1');
        } else if (sameActivity && !sameClass && full) {
          zone.classList.add('ring-1', 'ring-red-300', 'opacity-50');
        }
      });
    }

    function onDragEnd(e: DragEvent) {
      (e.target as HTMLElement).classList?.remove('opacity-50');
      document.querySelectorAll<HTMLElement>('[data-drop-class-id]').forEach((zone) => {
        zone.classList.remove('ring-2', 'ring-yellow/70', 'ring-offset-1', 'ring-1', 'ring-red-300', 'opacity-50');
      });
      dragData.current = null;
    }

    function onDragOver(e: DragEvent) {
      const zone = (e.target as HTMLElement).closest<HTMLElement>('[data-drop-class-id]');
      if (!zone || !dragData.current) return;
      const sameActivity = zone.dataset.dropActivityId === dragData.current.activityId;
      const sameClass = zone.dataset.dropClassId === dragData.current.sourceClassId;
      const full = zone.dataset.dropFull === 'true';
      if (!sameActivity || sameClass || full) return;
      e.preventDefault(); // necesario para permitir drop
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    }

    function onDrop(e: DragEvent) {
      const zone = (e.target as HTMLElement).closest<HTMLElement>('[data-drop-class-id]');
      if (!zone || !dragData.current) return;
      const { enrollmentId, sourceClassId, activityId } = dragData.current;
      const targetClassId = zone.dataset.dropClassId!;
      if (targetClassId === sourceClassId) return;
      if (zone.dataset.dropActivityId !== activityId) return;
      e.preventDefault();

      startTransition(async () => {
        const res = await moveEnrollmentAction(enrollmentId, targetClassId);
        if (!res.ok) {
          setToast({ kind: 'error', text: res.error });
        } else {
          setToast({ kind: 'info', text: 'Alumno movido.' });
          router.refresh();
        }
      });
    }

    document.addEventListener('dragstart', onDragStart);
    document.addEventListener('dragend', onDragEnd);
    document.addEventListener('dragover', onDragOver);
    document.addEventListener('drop', onDrop);

    return () => {
      document.removeEventListener('dragstart', onDragStart);
      document.removeEventListener('dragend', onDragEnd);
      document.removeEventListener('dragover', onDragOver);
      document.removeEventListener('drop', onDrop);
    };
  }, [router]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <>
      {pending && (
        <div className="fixed top-4 right-4 z-50 rounded-md bg-navy text-white px-4 py-2 text-sm shadow-pop">
          Moviendo…
        </div>
      )}
      {toast && !pending && (
        <div
          className={`fixed top-4 right-4 z-50 rounded-md px-4 py-2 text-sm shadow-pop border ${
            toast.kind === 'error'
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          {toast.text}
        </div>
      )}
    </>
  );
}
