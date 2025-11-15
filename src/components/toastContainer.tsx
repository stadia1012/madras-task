// components/ToastContainer.tsx
'use client';
import Toast from './toast';
import { Toast as ToastType } from '@/global';

interface Props {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

export default function ToastContainer({ toasts, onRemove }: Props) {
  return (
    <div className="fixed top-[33px] translate-x-[-50%] left-[50%] min-w-[200px] z-50" data-toast-container>
      {toasts.map((t) => (
        <Toast key={t.id} {...t} onClose={onRemove} />
      ))}
    </div>
  );
}