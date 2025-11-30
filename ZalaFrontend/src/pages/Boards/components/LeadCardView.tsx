import { useState, useEffect, useMemo } from "react";
import { Image, X, Move, Save, Trash2, AlertTriangle } from "lucide-react";
import type { LeadCard, BoardStepCard, LeadComposerState, PendingImage } from "./types";
import { ImageCarousel } from "./ImageCarousel";
import { FormField } from "./FormField";
import { resolveAssetUrl } from "./utils";

export interface LeadCardViewProps {
  lead: LeadCard;
  stepId: number;
  moveTargets: BoardStepCard[];
  busy: boolean;
  onSave: (updates: LeadComposerState) => void;
  onDelete: () => void;
  onMove: (targetStepId: number) => void;
  onUploadGalleryImage: (file: File) => Promise<void> | void;
  onDeleteGalleryImage: (imageId: number) => Promise<void> | void;
}

export const LeadCardView = ({
  lead,
  stepId,
  moveTargets,
  busy,
  onSave,
  onDelete,
  onMove,
  onUploadGalleryImage,
  onDeleteGalleryImage,
}: LeadCardViewProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);

  // Local form state - initialized from lead data
  const [formState, setFormState] = useState<LeadComposerState>({
    business: lead.business ?? "",
    person_type: lead.person_type ?? "",
    website: lead.website ?? "",
    license_num: lead.license_num ?? "",
    notes: lead.notes ?? "",
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setFormState({
        business: lead.business ?? "",
        person_type: lead.person_type ?? "",
        website: lead.website ?? "",
        license_num: lead.license_num ?? "",
        notes: lead.notes ?? "",
      });
      setPendingImages([]);
      setCurrentImageIndex(0);
    }
  }, [isModalOpen, lead]);

  // Cleanup preview URLs when component unmounts or pending images change
  useEffect(() => {
    return () => {
      pendingImages.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
  }, [pendingImages]);

  // Build images array from gallery images
  const galleryImages = useMemo(() => {
    const imgs: { url: string; id?: number }[] = [];
    if (lead.images && lead.images.length > 0) {
      lead.images.forEach((img) => {
        const url = resolveAssetUrl(img.image_url);
        if (url) imgs.push({ url, id: img.lead_image_id });
      });
    } else if (lead.image_url) {
      const url = resolveAssetUrl(lead.image_url);
      if (url) imgs.push({ url });
    }
    return imgs;
  }, [lead.images, lead.image_url]);

  // Check if form has unsaved changes (include pending images)
  const hasUnsavedChanges = useMemo(() => {
    return (
      formState.business !== (lead.business ?? "") ||
      formState.person_type !== (lead.person_type ?? "") ||
      formState.website !== (lead.website ?? "") ||
      formState.license_num !== (lead.license_num ?? "") ||
      formState.notes !== (lead.notes ?? "") ||
      pendingImages.length > 0
    );
  }, [formState, lead, pendingImages]);

  const handleAddPendingImages = (files: File[]) => {
    const newPending = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setPendingImages((prev) => [...prev, ...newPending]);
  };

  const handleRemovePendingImage = (index: number) => {
    setPendingImages((prev) => {
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      const updated = prev.filter((_, i) => i !== index);
      // Adjust current index if needed
      const totalImages = galleryImages.length + updated.length;
      if (currentImageIndex >= totalImages && totalImages > 0) {
        setCurrentImageIndex(totalImages - 1);
      }
      return updated;
    });
  };

  const handleSavePendingImages = async () => {
    for (const pending of pendingImages) {
      await onUploadGalleryImage(pending.file);
    }
    // Clear pending after upload
    pendingImages.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setPendingImages([]);
  };

  const leadTitle = lead.business?.trim() || "Untitled Lead";
  const thumbnailImage =
    galleryImages[currentImageIndex]?.url || galleryImages[0]?.url;

  const updateField = (field: keyof LeadComposerState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(formState);
  };

  const handleCloseModal = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedWarning(true);
    } else {
      setIsModalOpen(false);
    }
  };

  const handleDiscardAndClose = () => {
    setShowUnsavedWarning(false);
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Compact Card Thumbnail - Image + Name Only */}
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData(
            "card",
            JSON.stringify({
              cardId: lead.lead_id,
              fromStepId: stepId,
              cardType: "lead",
            })
          );
        }}
        onClick={() => setIsModalOpen(true)}
        className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer group border border-secondary-50/20 hover:border-accent/30"
      >
        {thumbnailImage ? (
          <div className="relative">
            <img
              src={thumbnailImage}
              alt={leadTitle}
              className="w-full h-40 object-cover rounded-t-xl"
            />
            {galleryImages.length > 1 && (
              <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg">
                {galleryImages.length} images
              </span>
            )}
          </div>
        ) : (
          <div className="w-full h-28 bg-gradient-to-br from-accent/10 to-accent/5 rounded-t-xl flex items-center justify-center">
            <Image size={32} className="text-accent/40" />
          </div>
        )}
        <div className="p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="font-semibold text-secondary text-lg leading-tight line-clamp-2 flex-1">
              {leadTitle}
            </p>
            <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-1 rounded-lg shrink-0">
              LEAD
            </span>
          </div>
          <p className="text-sm text-secondary-50 mt-2">Click to view details</p>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal();
          }}
        >
          <div className="modal-content bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-secondary-50/30">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-1 rounded">
                  LEAD
                </span>
                {hasUnsavedChanges && (
                  <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded flex items-center gap-1">
                    <AlertTriangle size={12} />
                    Unsaved changes
                  </span>
                )}
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-lg hover:bg-secondary-50/20 text-secondary-50 hover:text-secondary transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Image Carousel */}
              <ImageCarousel
                images={galleryImages}
                currentIndex={currentImageIndex}
                onIndexChange={setCurrentImageIndex}
                onDelete={onDeleteGalleryImage}
                busy={busy}
                pendingImages={pendingImages}
                onAddPendingImages={handleAddPendingImages}
                onRemovePendingImage={handleRemovePendingImage}
                onSavePendingImages={handleSavePendingImages}
              />

              {/* Form Fields */}
              <div className="space-y-4">
                <FormField
                  label="Business Name"
                  value={formState.business}
                  onChange={(v) => updateField("business", v)}
                  placeholder="Enter business name"
                />

                <FormField
                  label="Category"
                  value={formState.person_type}
                  onChange={(v) => updateField("person_type", v)}
                  placeholder="Enter category"
                />

                <FormField
                  label="Website"
                  value={formState.website}
                  onChange={(v) => updateField("website", v)}
                  placeholder="Enter website URL"
                />

                <FormField
                  label="License #"
                  value={formState.license_num}
                  onChange={(v) => updateField("license_num", v)}
                  placeholder="Enter license number"
                />

                <FormField
                  label="Notes"
                  value={formState.notes}
                  onChange={(v) => updateField("notes", v)}
                  placeholder="Add notes..."
                  multiline
                />

                {lead.contact?.email && (
                  <div>
                    <span className="text-[10px] font-semibold text-secondary-50 uppercase block mb-1">
                      Email (read-only)
                    </span>
                    <p className="text-sm text-secondary px-3 py-2 bg-secondary-50/10 rounded-lg">
                      {lead.contact.email}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-secondary-50/30">
                {moveTargets.length > 1 && (
                  <div className="flex items-center gap-2">
                    <Move size={14} className="text-secondary-50" />
                    <select
                      className="border border-secondary-50 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:border-accent bg-white"
                      value={stepId}
                      onChange={(e) => {
                        onMove(Number(e.target.value));
                        setIsModalOpen(false);
                      }}
                    >
                      {moveTargets.map((target) => (
                        <option
                          key={target.board_step_id}
                          value={target.board_step_id}
                        >
                          {target.step_name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex-1" />
                <button
                  onClick={handleSave}
                  disabled={busy || !hasUnsavedChanges}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  <Save size={16} />
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    onDelete();
                    setIsModalOpen(false);
                  }}
                  disabled={busy}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-error/10 text-error hover:bg-error/20 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unsaved Changes Warning Modal */}
      {showUnsavedWarning && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-amber-100">
                <AlertTriangle size={24} className="text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-secondary">
                Unsaved Changes
              </h3>
            </div>
            <p className="text-secondary-50 mb-6">
              You have unsaved changes. Are you sure you want to close without
              saving?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowUnsavedWarning(false)}
                className="px-4 py-2 rounded-lg text-secondary hover:bg-secondary-50/20 transition-colors text-sm font-medium"
              >
                Keep Editing
              </button>
              <button
                onClick={handleDiscardAndClose}
                className="px-4 py-2 rounded-lg bg-error text-white hover:bg-error/90 transition-colors text-sm font-medium"
              >
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
