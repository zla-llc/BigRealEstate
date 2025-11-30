import { useState } from "react";
import clsx from "clsx";
import { Upload, Image, X } from "lucide-react";
import type { PropertyComposerState } from "./types";

export interface PropertyComposerFormProps {
  form: PropertyComposerState;
  disabled: boolean;
  onChange: (key: keyof PropertyComposerState, value: string) => void;
  onAddressChange: (
    key: keyof PropertyComposerState["address"],
    value: string
  ) => void;
  imageFile: File | null;
  onImageChange: (file: File | null) => void;
  onSubmit: () => void;
}

export const PropertyComposerForm = ({
  form,
  disabled,
  onChange,
  onAddressChange,
  imageFile,
  onImageChange,
  onSubmit,
}: PropertyComposerFormProps) => {
  const [showErrors, setShowErrors] = useState(false);

  // Validation checks
  const isPropertyNameEmpty = !form.property_name.trim();
  const isStreet1Empty = !form.address.street_1.trim();
  const isCityEmpty = !form.address.city.trim();
  const isStateEmpty = !form.address.state.trim();
  const isZipEmpty = !form.address.zipcode.trim();

  const hasAllRequiredFields =
    !isPropertyNameEmpty &&
    !isStreet1Empty &&
    !isCityEmpty &&
    !isStateEmpty &&
    !isZipEmpty;

  const handleSubmit = () => {
    if (!hasAllRequiredFields) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    onSubmit();
  };

  // Helper for input class with error state
  const getInputClass = (hasError: boolean) =>
    clsx(
      "w-full px-3 py-2 rounded border text-sm text-secondary focus:outline-none transition-colors",
      showErrors && hasError
        ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200"
        : "border-secondary-50 focus:border-accent"
    );

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-secondary uppercase">
          Property Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Property name"
          value={form.property_name}
          onChange={(e) => onChange("property_name", e.target.value)}
          className={getInputClass(isPropertyNameEmpty)}
        />
        {showErrors && isPropertyNameEmpty && (
          <p className="text-xs text-red-500 mt-1">Property name is required</p>
        )}
      </div>
      <input
        type="text"
        placeholder="MLS #"
        value={form.mls_number}
        onChange={(e) => onChange("mls_number", e.target.value)}
        className="w-full px-3 py-2 rounded border border-secondary-50 text-sm text-secondary focus:outline-none focus:border-accent"
      />
      <textarea
        className="w-full px-3 py-2 rounded border border-slate-300 text-sm focus:outline-none focus:border-blue-500 resize-none"
        rows={3}
        value={form.notes}
        placeholder="Notes"
        onChange={(ev) => onChange("notes", ev.target.value)}
      />
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-secondary uppercase">
          Address
        </label>
        <div className="grid grid-cols-1 gap-2">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-secondary">
              Street 1 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Street 1"
              value={form.address.street_1}
              onChange={(e) => onAddressChange("street_1", e.target.value)}
              className={getInputClass(isStreet1Empty)}
            />
            {showErrors && isStreet1Empty && (
              <p className="text-xs text-red-500">Street is required</p>
            )}
          </div>
          <input
            type="text"
            placeholder="Street 2"
            value={form.address.street_2}
            onChange={(e) => onAddressChange("street_2", e.target.value)}
            className="w-full px-3 py-2 rounded border border-secondary-50 text-sm text-secondary focus:outline-none focus:border-accent"
          />
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-secondary">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="City"
                value={form.address.city}
                onChange={(e) => onAddressChange("city", e.target.value)}
                className={getInputClass(isCityEmpty)}
              />
              {showErrors && isCityEmpty && (
                <p className="text-xs text-red-500">Required</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-secondary">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="State"
                value={form.address.state}
                onChange={(e) => onAddressChange("state", e.target.value)}
                className={getInputClass(isStateEmpty)}
              />
              {showErrors && isStateEmpty && (
                <p className="text-xs text-red-500">Required</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-secondary">
                Zip <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Zip"
                value={form.address.zipcode}
                onChange={(e) => onAddressChange("zipcode", e.target.value)}
                className={getInputClass(isZipEmpty)}
              />
              {showErrors && isZipEmpty && (
                <p className="text-xs text-red-500">Required</p>
              )}
            </div>
          </div>
        </div>
      </div>
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
      {showErrors && !hasAllRequiredFields && (
        <p className="text-xs text-red-500 font-medium">
          Please fill in all required fields marked with *
        </p>
      )}
      <button
        type="button"
        className="w-full rounded-lg bg-accent hover:bg-accent/90 text-white py-2 text-sm font-semibold transition-colors disabled:opacity-50"
        onClick={handleSubmit}
        disabled={disabled}
      >
        Create Property
      </button>
    </div>
  );
};
