import { Upload, Image, X } from "lucide-react";
import type { LeadComposerState } from "./types";

export interface LeadComposerFormProps {
  form: LeadComposerState;
  disabled: boolean;
  onChange: (key: keyof LeadComposerState, value: string) => void;
  imageFile: File | null;
  onImageChange: (file: File | null) => void;
  onSubmit: () => void;
}

export const LeadComposerForm = ({
  form,
  disabled,
  onChange,
  imageFile,
  onImageChange,
  onSubmit,
}: LeadComposerFormProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-500 uppercase tracking-wide">
        <span className="font-semibold">
          Lead Title
          <span className="ml-2 text-[11px] font-normal text-secondary-50 normal-case">
            Optional
          </span>
        </span>
        <span className="text-slate-400 normal-case">Appears on the card</span>
      </div>
      <input
        type="text"
        placeholder="Card title (lead or business)"
        value={form.business}
        onChange={(e) => onChange("business", e.target.value)}
        className="w-full px-3 py-2 rounded border border-secondary-50 text-sm text-secondary focus:outline-none focus:border-accent"
      />
      <input
        type="text"
        placeholder="Category (optional)"
        value={form.person_type}
        onChange={(e) => onChange("person_type", e.target.value)}
        className="w-full px-3 py-2 rounded border border-secondary-50 text-sm text-secondary focus:outline-none focus:border-accent"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <input
          type="text"
          placeholder="Website (optional)"
          value={form.website}
          onChange={(e) => onChange("website", e.target.value)}
          className="w-full px-3 py-2 rounded border border-secondary-50 text-sm text-secondary focus:outline-none focus:border-accent"
        />
        <input
          type="text"
          placeholder="License # (optional)"
          value={form.license_num}
          onChange={(e) => onChange("license_num", e.target.value)}
          className="w-full px-3 py-2 rounded border border-secondary-50 text-sm text-secondary focus:outline-none focus:border-accent"
        />
      </div>
      <textarea
        className="w-full px-3 py-2 rounded border border-slate-300 text-sm focus:outline-none focus:border-blue-500 resize-none"
        rows={3}
        value={form.notes}
        placeholder="Notes"
        onChange={(ev) => onChange("notes", ev.target.value)}
      />
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-secondary uppercase">
          Card Image
        </label>
        <label className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-secondary-50 rounded-lg cursor-pointer hover:border-accent hover:bg-accent/5 transition-colors">
          <Upload size={18} className="text-secondary-50" />
          <span className="text-sm text-secondary-50">
            Click to upload image
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onImageChange(e.target.files?.[0] ?? null)}
            className="hidden"
          />
        </label>
        {imageFile && (
          <div className="flex items-center gap-2 p-2 bg-accent/10 rounded-lg">
            <Image size={16} className="text-accent" />
            <p className="text-xs text-secondary truncate flex-1">
              {imageFile.name}
            </p>
            <button
              type="button"
              onClick={() => onImageChange(null)}
              className="text-secondary-50 hover:text-error transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
      <p className="text-xs text-slate-500">
        All lead fields are optional. Provide whatever context you have.
      </p>
      <button
        type="button"
        className="w-full rounded-lg bg-accent hover:bg-accent/90 text-white py-2 text-sm font-semibold transition-colors disabled:opacity-50"
        onClick={onSubmit}
        disabled={disabled}
      >
        Create Lead
      </button>
    </div>
  );
};
