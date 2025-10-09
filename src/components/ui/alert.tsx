interface AlertProps {
  type: "success" | "error" | "info" | "warning";
  message: string;
  onClose?: () => void;
}

const alertStyles = {
  success: "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400",
  error: "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400",
  info: "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
  warning: "border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400",
};

export function Alert({ type, message, onClose }: AlertProps) {
  return (
    <div className={`rounded-md border px-4 py-3 text-sm ${alertStyles[type]}`}>
      <div className="flex items-center justify-between gap-4">
        <span>{message}</span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-medium uppercase tracking-wide opacity-70 hover:opacity-100 transition-opacity"
          >
            Fechar
          </button>
        )}
      </div>
    </div>
  );
}
