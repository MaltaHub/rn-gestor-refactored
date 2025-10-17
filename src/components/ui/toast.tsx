"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { X, Info, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";

type ToastType = "info" | "success" | "warning" | "error";

interface Toast {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: ToastType;
  duracao?: number;
}

interface ToastContextType {
  mostrarToast: (toast: Omit<Toast, "id">) => void;
  fecharToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast deve ser usado dentro de ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const mostrarToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 11);
    const novoToast: Toast = { ...toast, id };

    setToasts((prev) => [...prev, novoToast]);

    // Auto-remover após duração (padrão: 5 segundos)
    const duracao = toast.duracao ?? 5000;
    if (duracao > 0) {
      setTimeout(() => {
        fecharToast(id);
      }, duracao);
    }
  }, []);

  const fecharToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ mostrarToast, fecharToast }}>
      {children}
      <ToastContainer toasts={toasts} fecharToast={fecharToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, fecharToast }: { toasts: Toast[]; fecharToast: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => fecharToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animar entrada
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Esperar animação
  };

  const config = {
    info: {
      icon: Info,
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-200 dark:border-blue-800",
      text: "text-blue-900 dark:text-blue-100",
      iconColor: "text-blue-500",
    },
    success: {
      icon: CheckCircle,
      bg: "bg-green-50 dark:bg-green-900/20",
      border: "border-green-200 dark:border-green-800",
      text: "text-green-900 dark:text-green-100",
      iconColor: "text-green-500",
    },
    warning: {
      icon: AlertTriangle,
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
      border: "border-yellow-200 dark:border-yellow-800",
      text: "text-yellow-900 dark:text-yellow-100",
      iconColor: "text-yellow-500",
    },
    error: {
      icon: AlertCircle,
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-200 dark:border-red-800",
      text: "text-red-900 dark:text-red-100",
      iconColor: "text-red-500",
    },
  };

  const { icon: Icon, bg, border, text, iconColor } = config[toast.tipo];

  return (
    <div
      className={`
        ${bg} ${border} ${text}
        border rounded-lg shadow-lg p-4
        transition-all duration-300 ease-out
        ${isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
      `}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{toast.titulo}</p>
          <p className="text-sm mt-1 opacity-90">{toast.mensagem}</p>
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          aria-label="Fechar notificação"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
