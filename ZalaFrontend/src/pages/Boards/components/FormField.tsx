import clsx from "clsx";

export interface FormFieldProps {
  value: string;
  onChange: (newValue: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
  label?: string;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
}

export const FormField = ({
  value,
  onChange,
  placeholder,
  className,
  multiline = false,
  label,
  required = false,
  error = false,
  errorMessage,
}: FormFieldProps) => {
  const baseClass = clsx(
    "w-full px-3 py-2 text-sm rounded-lg focus:outline-none transition-colors",
    error
      ? "border-2 border-red-500 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200"
      : "border border-secondary-50 focus:border-accent focus:ring-2 focus:ring-accent/20 bg-white"
  );

  if (multiline) {
    return (
      <div>
        {label && (
          <label className="text-[10px] font-semibold text-secondary-50 uppercase block mb-1">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={clsx(baseClass, "resize-none", className)}
          rows={3}
        />
        {error && errorMessage && (
          <p className="text-xs text-red-500 mt-1">{errorMessage}</p>
        )}
      </div>
    );
  }

  return (
    <div>
      {label && (
        <label className="text-[10px] font-semibold text-secondary-50 uppercase block mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={clsx(baseClass, className)}
      />
      {error && errorMessage && (
        <p className="text-xs text-red-500 mt-1">{errorMessage}</p>
      )}
    </div>
  );
};
