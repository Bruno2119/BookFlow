import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'primary';
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
  variant = 'danger'
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-red-200',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-yellow-200',
    primary: 'bg-primary hover:bg-primary/90 text-white shadow-primary/20'
  };

  const iconStyles = {
    danger: 'text-red-600 bg-red-50',
    warning: 'text-yellow-600 bg-yellow-50',
    primary: 'text-primary bg-primary/10'
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-card w-full max-w-sm rounded-3xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${iconStyles[variant]}`}>
              <AlertTriangle className="h-6 w-6" />
            </div>
            <button 
              onClick={onCancel}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <h3 className="text-xl font-display font-bold text-foreground mb-2">{title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8">
            {message}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onCancel}
              className="py-3 px-4 rounded-xl font-bold text-sm border border-border hover:bg-muted transition-all active:scale-95"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={`py-3 px-4 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-95 ${variantStyles[variant]}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
