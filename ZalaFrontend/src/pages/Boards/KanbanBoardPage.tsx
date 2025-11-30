import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { useSnackbar } from "notistack";
import { useFetch } from "../../hooks";
import { useAuthStore } from "../../stores";
import type {
  BoardStepCard,
  KanbanBoard,
  LeadCard,
  PropertyCard,
  CardImage,
} from "../../interfaces";
import { Plus, Trash2, Check, X, ChevronLeft, ChevronRight, Upload, Image, Move, Save, AlertTriangle } from "lucide-react";
import { CONFIG } from "../../config";

const resolveAssetUrl = (path?: string | null) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const fallback = typeof window !== "undefined" ? window.location.origin : "";
  const base = CONFIG.api || fallback;
  try {
    return new URL(path, base).toString();
  } catch {
    const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${normalizedBase}${normalizedPath}`;
  }
};

const BOARD_TYPE_STORAGE_KEY = "zala-board-type-overrides";

type LeadComposerState = {
  business: string;
  person_type: string;
  website: string;
  license_num: string;
  notes: string;
};

type PropertyComposerState = {
  property_name: string;
  notes: string;
  mls_number: string;
  address: {
    street_1: string;
    street_2: string;
    city: string;
    state: string;
    zipcode: string;
  };
};

type AddressResponse = PropertyComposerState["address"] & {
  address_id: number;
};

const createDefaultLeadForm = (): LeadComposerState => ({
  business: "",
  person_type: "",
  website: "",
  license_num: "",
  notes: "",
});

const createDefaultPropertyForm = (): PropertyComposerState => ({
  property_name: "",
  notes: "",
  mls_number: "",
  address: {
    street_1: "",
    street_2: "",
    city: "",
    state: "",
    zipcode: "",
  },
});

// Form input component for editing fields in modal
const FormField = ({
  value,
  onChange,
  placeholder,
  className,
  multiline = false,
  label,
}: {
  value: string;
  onChange: (newValue: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
  label?: string;
}) => {
  const baseClass = "w-full px-3 py-2 text-sm border border-secondary-50 rounded-lg focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 bg-white transition-colors";
  
  if (multiline) {
    return (
      <div>
        {label && <label className="text-[10px] font-semibold text-secondary-50 uppercase block mb-1">{label}</label>}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={clsx(baseClass, "resize-none", className)}
          rows={3}
        />
      </div>
    );
  }
  
  return (
    <div>
      {label && <label className="text-[10px] font-semibold text-secondary-50 uppercase block mb-1">{label}</label>}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={clsx(baseClass, className)}
      />
    </div>
  );
};

// Image carousel component for modal view
const ImageCarousel = ({
  images,
  currentIndex,
  onIndexChange,
  onUpload,
  onDelete,
  busy,
}: {
  images: { url: string; id?: number }[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onUpload: (file: File) => void;
  onDelete: (imageId: number) => void;
  busy: boolean;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePrev = () => {
    onIndexChange(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };

  const handleNext = () => {
    onIndexChange(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-3">
      <div className="relative bg-secondary-50/10 rounded-lg overflow-hidden">
        {images.length > 0 ? (
          <>
            <img
              src={images[currentIndex]?.url}
              alt={`Image ${currentIndex + 1}`}
              className="w-full h-64 object-contain"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => onIndexChange(idx)}
                      className={clsx(
                        "w-2 h-2 rounded-full transition-colors",
                        idx === currentIndex ? "bg-white" : "bg-white/50 hover:bg-white/75"
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="h-48 flex items-center justify-center text-secondary-50">
            <div className="text-center">
              <Image size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No images yet</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={busy}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors text-sm font-medium disabled:opacity-50"
        >
          <Upload size={16} />
          Add Image
        </button>
        {images.length > 0 && images[currentIndex]?.id && (
          <button
            onClick={() => onDelete(images[currentIndex].id!)}
            disabled={busy}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-error/10 text-error hover:bg-error/20 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <Trash2 size={16} />
            Delete Image
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      
      {images.length > 1 && (
        <p className="text-xs text-secondary-50 text-center">
          Image {currentIndex + 1} of {images.length}
        </p>
      )}
    </div>
  );
};

const TextArea = ({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) => (
  <textarea
    className="w-full px-3 py-2 rounded border border-slate-300 text-sm focus:outline-none focus:border-blue-500 resize-none"
    rows={3}
    value={value}
    placeholder={placeholder}
    onChange={(ev) => onChange(ev.target.value)}
  />
);

export const KanbanBoardPage = () => {
  const { get, post, put, del } = useFetch();
  const { enqueueSnackbar } = useSnackbar();
  const currentUser = useAuthStore((state) => state.user);
  const [boards, setBoards] = useState<KanbanBoard[]>([]);
  const [activeBoardId, setActiveBoardId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [boardTypeOverrides, setBoardTypeOverrides] = useState<Record<number, "lead" | "property">>(() => {
    if (typeof window === "undefined") {
      return {};
    }
    try {
      const stored = window.localStorage.getItem(BOARD_TYPE_STORAGE_KEY);
      return stored ? (JSON.parse(stored) as Record<number, "lead" | "property">) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        BOARD_TYPE_STORAGE_KEY,
        JSON.stringify(boardTypeOverrides)
      );
    } catch {
      // no-op: storage might be unavailable (private browsing, etc.)
    }
  }, [boardTypeOverrides]);

  const loadBoards = async (preferredId?: number | null) => {
    setLoading(true);
    setError(null);
    const { data, err } = await get<KanbanBoard[]>(`/api/boards?limit=50`);
    if (err || !data) {
      setBoards([]);
      setError(err ?? "Unable to fetch boards");
      setActiveBoardId(null);
      setLoading(false);
      return;
    }

    setBoards(data);

    if (data.length === 0) {
      setActiveBoardId(null);
    } else {
      const fallback =
        preferredId && data.some((b) => b.board_id === preferredId)
          ? preferredId
          : activeBoardId && data.some((b) => b.board_id === activeBoardId)
          ? activeBoardId
          : data[0].board_id;
      setActiveBoardId(fallback);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadBoards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeBoard = useMemo(() => {
    if (!activeBoardId) return null;
    return boards.find((board) => board.board_id === activeBoardId) ?? null;
  }, [boards, activeBoardId]);

  const boardComposition = useMemo(() => {
    if (!activeBoard) {
      return { hasLeads: false, hasProperties: false };
    }
    return {
      hasLeads: activeBoard.board_steps.some((step) => step.leads.length > 0),
      hasProperties: activeBoard.board_steps.some((step) => step.properties.length > 0),
    };
  }, [activeBoard]);

  const detectedBoardType = useMemo<"lead" | "property" | null>(() => {
    if (!activeBoard) return null;
    if (boardComposition.hasLeads && !boardComposition.hasProperties) {
      return "lead";
    }
    if (!boardComposition.hasLeads && boardComposition.hasProperties) {
      return "property";
    }
    return null;
  }, [activeBoard, boardComposition]);

  const activeBoardType = useMemo<"lead" | "property" | null>(() => {
    if (!activeBoard) return null;
    if (detectedBoardType) return detectedBoardType;
    const override = boardTypeOverrides[activeBoard.board_id];
    return override ?? "lead";
  }, [activeBoard, detectedBoardType, boardTypeOverrides]);

  useEffect(() => {
    if (!activeBoard) {
      setWarning(null);
      return;
    }
    if (boardComposition.hasLeads && boardComposition.hasProperties) {
      setWarning(
        "This board currently contains both lead and property cards. Move cards so only one type remains."
      );
    } else {
      setWarning(null);
    }
  }, [activeBoard, boardComposition]);

  useEffect(() => {
    if (!activeBoard || !detectedBoardType) return;
    setBoardTypeOverrides((prev) => {
      if (!prev[activeBoard.board_id]) {
        return prev;
      }
      const next = { ...prev };
      delete next[activeBoard.board_id];
      return next;
    });
  }, [activeBoard, detectedBoardType]);

  const findStep = (stepId: number): BoardStepCard | undefined => {
    return boards
      .flatMap((board) => board.board_steps)
      .find((step) => step.board_step_id === stepId);
  };

  const withBusy = async (
    label: string,
    fn: () => Promise<void>,
    preferredBoard?: number | null
  ) => {
    setBusy(label);
    setError(null);
    try {
      await fn();
      await loadBoards(preferredBoard);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unexpected error occurred"
      );
    } finally {
      setBusy(null);
    }
  };

  const handleBoardTypeSelection = (type: "lead" | "property") => {
    if (!activeBoard) return;
    if (detectedBoardType) {
      enqueueSnackbar(
        "Board type is locked once cards exist. Remove all cards to switch.",
        { variant: "info" }
      );
      return;
    }
    setBoardTypeOverrides((prev) => ({
      ...prev,
      [activeBoard.board_id]: type,
    }));
  };

  const handleCreateBoard = async (name: string, steps?: string[]) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      enqueueSnackbar("Board name is required", { variant: "warning" });
      return;
    }
    await withBusy("Creating board...", async () => {
      const payload: { board_name: string; user_id?: number } = {
        board_name: trimmedName,
        user_id: currentUser?.userId,
      };
      const { data, err } = await post<KanbanBoard>(`/api/boards`, payload);
      if (err || !data) {
        throw new Error(err ?? "Unable to create board");
      }

      // Use provided template step names (max 5) or fall back to defaults
      const defaults = ["To Do", "In Progress", "Review", "Done", "Backlog"];
      const sampleSteps = (steps &&
        steps
          .slice(0, 5)
          .map((s) => s.trim())
          .filter((s) => s.length > 0)) || defaults;

      for (let i = 0; i < sampleSteps.length; i++) {
        await post(`/api/board-steps`, {
          board_id: data.board_id,
          board_column: i + 1,
          step_name: sampleSteps[i],
        });
      }

      await loadBoards(data.board_id);
    });
  };

  const handleUpdateBoard = async (
    boardId: number,
    updates: { board_name?: string; user_id?: number | null }
  ) => {
    const payload = { ...updates };
    if (typeof payload.board_name === "string") {
      payload.board_name = payload.board_name.trim();
    }
    await withBusy("Updating board...", async () => {
      const { err } = await put<KanbanBoard>(`/api/boards/${boardId}`, payload);
      if (err) throw new Error(err);
    }, boardId);
  };

  const handleDeleteBoard = async (boardId: number) => {
    await withBusy("Deleting board...", async () => {
      const { err } = await del(`/api/boards/${boardId}`);
      if (err) throw new Error(err);
    }, boardId === activeBoardId ? null : activeBoardId);
  };

  const handleCreateStep = async (boardId: number, stepName: string) => {
    const trimmedName = stepName.trim();
    if (!trimmedName) {
      enqueueSnackbar("Column name is required", { variant: "warning" });
      return;
    }
    const board = boards.find((b) => b.board_id === boardId);
    const nextColumn =
      board && board.board_steps.length > 0
        ? Math.max(...board.board_steps.map((s) => s.board_column)) + 1
        : 1;

    await withBusy("Creating step...", async () => {
      const { err } = await post(`/api/board-steps`, {
        board_id: boardId,
        board_column: nextColumn,
        step_name: trimmedName,
      });
      if (err) throw new Error(err);
    }, boardId);
  };

  const handleDeleteStep = async (boardId: number, stepId: number) => {
    await withBusy("Deleting step...", async () => {
      const { err } = await del(`/api/board-steps/${stepId}`);
      if (err) throw new Error(err);
    }, boardId);
  };

  const handleCreateLead = async (
    stepId: number,
    form: LeadComposerState,
    imageFile?: File | null
  ) => {
    const step = findStep(stepId);
    if (!step) {
      setError("Unable to find target step for lead");
      return;
    }
    if (activeBoardType === "property") {
      enqueueSnackbar(
        "This board is configured for property cards. Switch to leads to add lead cards.",
        { variant: "warning" }
      );
      return;
    }
    let createdLeadId: number | null = null;

    await withBusy("Creating lead...", async () => {
      const payload: LeadComposerState = {
        business: form.business?.trim() ?? "",
        person_type: form.person_type?.trim() ?? "",
        website: form.website?.trim() ?? "",
        license_num: form.license_num?.trim() ?? "",
        notes: form.notes?.trim() ?? "",
      };
      const { data, err } = await post<LeadCard>(`/api/leads`, payload);
      if (err || !data) throw new Error(err ?? "Unable to create lead");
      createdLeadId = data.lead_id;

      const newLeadIds = [...(step.leads ?? []).map((lead) => lead.lead_id)];
      newLeadIds.push(data.lead_id);

      const { err: stepErr } = await put(`/api/board-steps/${stepId}`, {
        lead_ids: newLeadIds,
      });
      if (stepErr) throw new Error(stepErr);
    }, step.board_id);

    if (imageFile && createdLeadId) {
      await handleUploadLeadImage(createdLeadId, imageFile);
    }
  };

  const handleUpdateLead = async (leadId: number, updates: LeadComposerState) => {
    const payload: LeadComposerState = {
      business: updates.business?.trim() ?? "",
      person_type: updates.person_type?.trim() ?? "",
      website: updates.website?.trim() ?? "",
      license_num: updates.license_num?.trim() ?? "",
      notes: updates.notes?.trim() ?? "",
    };
    await withBusy("Updating lead...", async () => {
      const { err } = await put(`/api/leads/${leadId}`, payload);
      if (err) throw new Error(err);
    }, activeBoardId);
  };

  const handleDeleteLead = async (leadId: number, stepId: number) => {
    const step = findStep(stepId);
    if (!step) {
      setError("Unable to find step for lead removal");
      return;
    }

    await withBusy("Deleting lead...", async () => {
      const remainingIds = step.leads
        .filter((lead) => lead.lead_id !== leadId)
        .map((lead) => lead.lead_id);

      const { err: stepErr } = await put(`/api/board-steps/${stepId}`, {
        lead_ids: remainingIds,
      });
      if (stepErr) throw new Error(stepErr);

      const { err } = await del(`/api/leads/${leadId}`);
      if (err) throw new Error(err);
    }, step.board_id);
  };

  const handleMoveLead = async (
    leadId: number,
    fromStepId: number,
    toStepId: number
  ) => {
    if (fromStepId === toStepId) return;
    const fromStep = findStep(fromStepId);
    const toStep = findStep(toStepId);
    if (!fromStep || !toStep) {
      setError("Unable to move lead between steps");
      return;
    }

    await withBusy("Moving lead...", async () => {
      const remainingIds = fromStep.leads
        .filter((lead) => lead.lead_id !== leadId)
        .map((lead) => lead.lead_id);
      const destIds = Array.from(
        new Set([...toStep.leads.map((lead) => lead.lead_id), leadId])
      );

      const { err: fromErr } = await put(`/api/board-steps/${fromStepId}`, {
        lead_ids: remainingIds,
      });
      if (fromErr) throw new Error(fromErr);

      const { err: toErr } = await put(`/api/board-steps/${toStepId}`, {
        lead_ids: destIds,
      });
      if (toErr) throw new Error(toErr);
    }, fromStep.board_id);
  };

  const handleCreateProperty = async (
    stepId: number,
    form: PropertyComposerState,
    imageFile?: File | null
  ) => {
    const step = findStep(stepId);
    if (!step) {
      setError("Unable to find target step for property");
      return;
    }
    if (activeBoardType === "lead") {
      enqueueSnackbar(
        "This board is configured for lead cards. Switch to properties to add property cards.",
        { variant: "warning" }
      );
      return;
    }
    const trimmedName = form.property_name.trim();
    if (!trimmedName) {
      enqueueSnackbar("Property name is required", { variant: "warning" });
      return;
    }
    const street = form.address.street_1.trim();
    const city = form.address.city.trim();
    const state = form.address.state.trim();
    const zip = form.address.zipcode.trim();
    if (!street || !city || !state || !zip) {
      enqueueSnackbar(
        "Street, city, state, and zip are required for a property address",
        { variant: "warning" }
      );
      return;
    }

    let createdProperty: PropertyCard | null = null;

    await withBusy("Creating property...", async () => {
      const { data: address, err: addressErr } = await post<AddressResponse>(
        `/api/addresses`,
        {
          street_1: street,
          street_2: form.address.street_2.trim(),
          city,
          state,
          zipcode: zip,
        }
      );
      if (addressErr || !address)
        throw new Error(addressErr ?? "Unable to create address");

      const { data: property, err: propertyErr } = await post<PropertyCard>(
        `/api/addresses/${address.address_id}/properties`,
        {
          property_name: trimmedName,
          notes: form.notes?.trim() ?? "",
          mls_number: form.mls_number?.trim() ?? "",
        }
      );

      if (propertyErr || !property)
        throw new Error(propertyErr ?? "Unable to create property");
      createdProperty = property;

      const propertyIds = [
        ...(step.properties ?? []).map((prop) => prop.property_id),
        property.property_id,
      ];

      const { err: stepErr } = await put(`/api/board-steps/${stepId}`, {
        property_ids: propertyIds,
      });
      if (stepErr) throw new Error(stepErr);
    }, step.board_id);

    if (imageFile && createdProperty) {
      await handleUploadPropertyImage(createdProperty, imageFile);
    }
  };

  const handleUpdateProperty = async (
    property: PropertyCard,
    updates: { property_name?: string; notes?: string; mls_number?: string }
  ) => {
    if (!property.address_id) {
      enqueueSnackbar("Cannot update property without an address", {
        variant: "warning",
      });
      return;
    }

    const payload = { ...updates };
    if (payload.property_name !== undefined) {
      payload.property_name = payload.property_name.trim();
    }
    if (payload.notes !== undefined) {
      payload.notes = payload.notes.trim();
    }
    if (payload.mls_number !== undefined) {
      payload.mls_number = payload.mls_number.trim();
    }

    await withBusy("Updating property...", async () => {
      const { err } = await put(
        `/api/addresses/${property.address_id}/properties/${property.property_id}`,
        payload
      );
      if (err) throw new Error(err);
    }, activeBoardId);
  };

  const handleDeleteProperty = async (
    property: PropertyCard,
    stepId: number
  ) => {
    if (!property.address_id) {
      setError("Property missing address_id");
      return;
    }

    const step = findStep(stepId);
    if (!step) {
      setError("Unable to find step for property");
      return;
    }

    await withBusy("Deleting property...", async () => {
      const remainingIds = step.properties
        .filter((prop) => prop.property_id !== property.property_id)
        .map((prop) => prop.property_id);

      const { err: stepErr } = await put(`/api/board-steps/${stepId}`, {
        property_ids: remainingIds,
      });
      if (stepErr) throw new Error(stepErr);

      const { err } = await del(
        `/api/addresses/${property.address_id}/properties/${property.property_id}`
      );
      if (err) throw new Error(err);
    }, step.board_id);
  };

  const handleMoveProperty = async (
    propertyId: number,
    fromStepId: number,
    toStepId: number
  ) => {
    if (fromStepId === toStepId) return;
    const fromStep = findStep(fromStepId);
    const toStep = findStep(toStepId);
    if (!fromStep || !toStep) {
      setError("Unable to move property between steps");
      return;
    }

    await withBusy("Moving property...", async () => {
      const remainingIds = fromStep.properties
        .filter((prop) => prop.property_id !== propertyId)
        .map((prop) => prop.property_id);
      const destIds = Array.from(
        new Set([
          ...toStep.properties.map((prop) => prop.property_id),
          propertyId,
        ])
      );

      const { err: fromErr } = await put(`/api/board-steps/${fromStepId}`, {
        property_ids: remainingIds,
      });
      if (fromErr) throw new Error(fromErr);

      const { err: toErr } = await put(`/api/board-steps/${toStepId}`, {
        property_ids: destIds,
      });
      if (toErr) throw new Error(toErr);
    }, fromStep.board_id);
  };

  const handleUploadLeadImage = async (leadId: number, file: File) => {
    await withBusy("Uploading lead image...", async () => {
      const formData = new FormData();
      formData.append("file", file);
      const { err } = await post(`/api/leads/${leadId}/image`, formData, true);
      if (err) throw new Error(err);
    }, activeBoardId);
  };

  const handleRemoveLeadImage = async (leadId: number) => {
    await withBusy("Removing lead image...", async () => {
      const { err } = await del(`/api/leads/${leadId}/image`);
      if (err) throw new Error(err);
    }, activeBoardId);
  };

  const resolvePropertyAddressId = (property: PropertyCard): number | null => {
    if (property.address_id) return property.address_id;
    return property.address?.address_id ?? null;
  };

  const handleUploadPropertyImage = async (property: PropertyCard, file: File) => {
    const addressId = resolvePropertyAddressId(property);
    if (!addressId) {
      enqueueSnackbar("Property must have an address before uploading an image", {
        variant: "warning",
      });
      return;
    }

    await withBusy("Uploading property image...", async () => {
      const formData = new FormData();
      formData.append("file", file);
      const { err } = await post(
        `/api/addresses/${addressId}/properties/${property.property_id}/image`,
        formData,
        true
      );
      if (err) throw new Error(err);
    }, activeBoardId);
  };

  const handleRemovePropertyImage = async (property: PropertyCard) => {
    const addressId = resolvePropertyAddressId(property);
    if (!addressId) {
      enqueueSnackbar("Property must have an address before removing an image", {
        variant: "warning",
      });
      return;
    }

    await withBusy("Removing property image...", async () => {
      const { err } = await del(
        `/api/addresses/${addressId}/properties/${property.property_id}/image`
      );
      if (err) throw new Error(err);
    }, activeBoardId);
  };

  // Gallery image handlers for multiple images
  const handleUploadLeadGalleryImage = async (leadId: number, file: File) => {
    await withBusy("Uploading image...", async () => {
      const formData = new FormData();
      formData.append("file", file);
      const { err } = await post(`/api/leads/${leadId}/images`, formData, true);
      if (err) throw new Error(err);
    }, activeBoardId);
  };

  const handleDeleteLeadGalleryImage = async (leadId: number, imageId: number) => {
    await withBusy("Deleting image...", async () => {
      const { err } = await del(`/api/leads/${leadId}/images/${imageId}`);
      if (err) throw new Error(err);
    }, activeBoardId);
  };

  const handleUploadPropertyGalleryImage = async (property: PropertyCard, file: File) => {
    const addressId = resolvePropertyAddressId(property);
    if (!addressId) {
      enqueueSnackbar("Property must have an address before uploading an image", {
        variant: "warning",
      });
      return;
    }

    await withBusy("Uploading image...", async () => {
      const formData = new FormData();
      formData.append("file", file);
      const { err } = await post(
        `/api/addresses/${addressId}/properties/${property.property_id}/images`,
        formData,
        true
      );
      if (err) throw new Error(err);
    }, activeBoardId);
  };

  const handleDeletePropertyGalleryImage = async (property: PropertyCard, imageId: number) => {
    const addressId = resolvePropertyAddressId(property);
    if (!addressId) {
      enqueueSnackbar("Property must have an address", { variant: "warning" });
      return;
    }

    await withBusy("Deleting image...", async () => {
      const { err } = await del(
        `/api/addresses/${addressId}/properties/${property.property_id}/images/${imageId}`
      );
      if (err) throw new Error(err);
    }, activeBoardId);
  };

  const handleRenameStep = async (
    boardId: number,
    stepId: number,
    newName: string
  ) => {
    const trimmedName = newName.trim();
    if (!trimmedName) return;
    
    await withBusy("Updating step...", async () => {
      const { err } = await put(`/api/board-steps/${stepId}`, {
        step_name: trimmedName,
      });
      if (err) throw new Error(err);
    }, boardId);
  };

  const BoardList = () => {
    const [name, setName] = useState("");

    const onSubmit = (event: React.FormEvent) => {
      event.preventDefault();
      handleCreateBoard(name);
      setName("");
    };

    return (
      <div className="h-full flex flex-col bg-background">
        <div className="flex items-center justify-between p-4 border-b border-secondary-50/30">
          <div>
            <h2 className="text-xl font-bold text-secondary">Boards</h2>
            <p className="text-secondary-50 text-xs">Manage your projects</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            title="Close sidebar"
            className="p-2 rounded-lg hover:bg-secondary-50/20 text-secondary transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
        </div>
        <div className="flex-1 flex flex-col p-4 space-y-4 overflow-hidden">

        <div className="space-y-1 overflow-auto flex-1">
          {boards.map((board) => {
            const isActive = activeBoardId === board.board_id;
            const ownerId = board.user?.user_id ?? board.user_id ?? null;
            const isMine =
              currentUser?.userId && ownerId
                ? ownerId === currentUser.userId
                : false;
            const ownerLabel = board.user?.username
              ? isMine
                ? "You"
                : board.user.username
              : ownerId
              ? isMine
                ? "You"
                : "Team member"
              : "Unassigned";

            return (
              <div
                key={board.board_id}
                className={clsx(
                  "flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer transition-all duration-200",
                  isActive
                    ? "bg-accent text-white shadow-md"
                    : "hover:bg-secondary-50/20 text-secondary"
                )}
                onClick={() => setActiveBoardId(board.board_id)}
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold truncate">
                    {board.board_name}
                  </span>
                  <span
                    className={clsx(
                      "text-[11px]",
                      isActive ? "text-white/80" : "text-secondary-50"
                    )}
                  >
                    {ownerLabel}
                  </span>
                </div>

                <button
                  className="ml-2 p-1.5 hover:bg-white/20 rounded transition-colors opacity-0 group-hover:opacity-100"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleDeleteBoard(board.board_id);
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
          {boards.length === 0 && (
            <p className="text-sm text-secondary-50 text-center py-8">
              No boards yet
            </p>
          )}
        </div>
        </div>

        <div className="border-t border-secondary-50/30 p-4">
          <form
            className="flex gap-2"
            onSubmit={onSubmit}
            autoComplete="off"
          >
            <input
              type="text"
              placeholder="+ Add board"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-secondary-50/10 border border-transparent text-secondary text-sm placeholder-secondary-50 focus:outline-none focus:border-accent focus:bg-white transition-colors"
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-lg bg-accent hover:bg-accent/90 text-white text-sm font-medium transition-colors disabled:opacity-50"
              disabled={!name.trim() || !!busy}
            >
              <Plus size={18} />
            </button>
          </form>
        </div>
      </div>
    );
  };

  const BoardHeader = () => {
    if (!activeBoard) return null;

    const ownerId = activeBoard.user?.user_id ?? activeBoard.user_id ?? null;
    const ownedByCurrent =
      currentUser?.userId && ownerId ? ownerId === currentUser.userId : false;
    const ownerName = activeBoard.user?.username
      ? ownedByCurrent
        ? "You"
        : activeBoard.user.username
      : ownerId
      ? ownedByCurrent
        ? "You"
        : "Team member"
      : "Unassigned";
    const boardHasCards = boardComposition.hasLeads || boardComposition.hasProperties;
    const boardTypeLabel = activeBoardType === "property" ? "Properties" : "Leads";

    return (
      <div className="flex items-center gap-4 px-6 py-3 bg-background border-b border-secondary-50/30">
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            title="Open sidebar"
            className="p-2 rounded-lg hover:bg-secondary-50/20 text-secondary transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-secondary truncate">{activeBoard.board_name}</h1>
          <p className="text-xs text-secondary-50">Owner: {ownedByCurrent ? "You" : ownerName}</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-secondary-50/10 rounded-lg px-3 py-1.5">
            <span className="text-xs text-secondary-50">Type:</span>
            {boardHasCards ? (
              <span className="text-xs font-semibold text-secondary">{boardTypeLabel}</span>
            ) : (
              <>
                {(["lead", "property"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={clsx(
                      "px-2 py-1 rounded text-xs font-medium transition-colors",
                      activeBoardType === type
                        ? "bg-accent text-white"
                        : "text-secondary-50 hover:text-secondary"
                    )}
                    onClick={() => handleBoardTypeSelection(type)}
                  >
                    {type === "lead" ? "Leads" : "Properties"}
                  </button>
                ))}
              </>
            )}
          </div>

          <button
            type="button"
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-secondary hover:bg-secondary-50/20 transition-colors"
            onClick={() =>
              handleUpdateBoard(activeBoard.board_id, {
                user_id: currentUser?.userId ?? null,
              })
            }
            disabled={!currentUser || ownedByCurrent}
          >
            {ownedByCurrent ? "Your Board" : "Claim"}
          </button>
          <button
            className="p-2 rounded-lg text-error hover:bg-error/10 transition-colors"
            onClick={() => handleDeleteBoard(activeBoard.board_id)}
            disabled={!!busy}
            title="Delete board"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  };

  const AddListCard = () => {
    const [isAdding, setIsAdding] = useState(false);
    const [stepName, setStepName] = useState("");

    if (!activeBoard) return null;

    const handleSubmit = (event: React.FormEvent) => {
      event.preventDefault();
      if (!stepName.trim()) return;
      handleCreateStep(activeBoard.board_id, stepName);
      setStepName("");
      setIsAdding(false);
    };

    if (!isAdding) {
      return (
        <button
          onClick={() => setIsAdding(true)}
          className="min-w-[280px] h-fit px-4 py-3 rounded-xl bg-secondary-50/20 hover:bg-secondary-50/30 text-secondary-50 text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          Add another list
        </button>
      );
    }

    return (
      <div className="min-w-[280px] rounded-xl bg-secondary-50/20 p-3">
        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            autoFocus
            type="text"
            placeholder="Enter list title..."
            value={stepName}
            onChange={(e) => setStepName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-secondary-50/50 bg-white text-sm text-secondary focus:outline-none focus:border-accent"
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-accent hover:bg-accent/90 text-white text-sm font-medium transition-colors disabled:opacity-50"
              disabled={!stepName.trim() || !!busy}
            >
              Add list
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setStepName("");
              }}
              className="p-1.5 rounded-lg text-secondary-50 hover:text-secondary hover:bg-secondary-50/20 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </form>
      </div>
    );
  };

  const StepColumn = ({
    step,
    boardType,
  }: {
    step: BoardStepCard;
    boardType: "lead" | "property" | null;
  }) => {
    const [composerOpen, setComposerOpen] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState(step.step_name);
    const [leadForm, setLeadForm] = useState<LeadComposerState>(
      createDefaultLeadForm()
    );
    const [propertyForm, setPropertyForm] =
      useState<PropertyComposerState>(createDefaultPropertyForm());
    const [leadImageFile, setLeadImageFile] = useState<File | null>(null);
    const [propertyImageFile, setPropertyImageFile] = useState<File | null>(null);
    const [dragOverStepId, setDragOverStepId] = useState<number | null>(null);

    const resolvedBoardType = boardType ?? "lead";
    const isLeadBoard = resolvedBoardType === "lead";
    const isPropertyBoard = resolvedBoardType === "property";

    const updateLeadForm = (key: keyof LeadComposerState, value: string) => {
      setLeadForm((prev) => ({ ...prev, [key]: value }));
    };

    const updatePropertyForm = (
      key: keyof PropertyComposerState,
      value: string
    ) => {
      setPropertyForm((prev) => ({ ...prev, [key]: value }));
    };

    const updatePropertyAddress = (
      key: keyof PropertyComposerState["address"],
      value: string
    ) => {
      setPropertyForm((prev) => ({
        ...prev,
        address: { ...prev.address, [key]: value },
      }));
    };

    const moveTargets = activeBoard?.board_steps ?? [];

    const cardCount = step.leads.length + step.properties.length;

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setDragOverStepId(step.board_step_id);
    };

    const handleDragLeave = () => {
      setDragOverStepId(null);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setDragOverStepId(null);
      
      const data = e.dataTransfer.getData("card");
      if (!data) return;

      try {
        const { cardId, fromStepId, cardType: type } = JSON.parse(data);
        if (fromStepId === step.board_step_id) return;

        if (boardType && type !== boardType) {
          return;
        }

        if (type === "lead") {
          handleMoveLead(cardId, fromStepId, step.board_step_id);
        } else {
          handleMoveProperty(cardId, fromStepId, step.board_step_id);
        }
      } catch (err) {
        console.error("Drop error:", err);
      }
    };

    const handleSaveTitle = async () => {
      if (editedTitle.trim() === step.step_name) {
        setIsEditingTitle(false);
        return;
      }
      await handleRenameStep(step.board_id, step.board_step_id, editedTitle);
      setIsEditingTitle(false);
    };

    return (
      <div 
        className={clsx(
          "rounded-xl p-3 space-y-3 min-w-[280px] max-w-[280px] h-fit flex flex-col transition-all",
          dragOverStepId === step.board_step_id 
            ? "bg-accent/20" 
            : "bg-secondary-50/20"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Header with editable title */}
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex-1 min-w-0">
            {isEditingTitle ? (
              <div className="flex items-center gap-1">
                <input
                  autoFocus
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveTitle();
                    if (e.key === "Escape") {
                      setEditedTitle(step.step_name);
                      setIsEditingTitle(false);
                    }
                  }}
                  className="flex-1 px-2 py-1 rounded border border-accent bg-white text-sm font-semibold focus:outline-none text-secondary"
                />
                <button
                  onClick={handleSaveTitle}
                  className="p-1 hover:bg-white/50 rounded transition-colors text-accent"
                  title="Save"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={() => {
                    setEditedTitle(step.step_name);
                    setIsEditingTitle(false);
                  }}
                  className="p-1 hover:bg-error/20 rounded transition-colors text-error"
                  title="Cancel"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <h3 
                onClick={() => setIsEditingTitle(true)}
                className="text-sm font-semibold text-secondary truncate cursor-pointer hover:text-accent transition-colors py-1"
              >
                {step.step_name}
              </h3>
            )}
          </div>
          <button
            className="p-1 rounded hover:bg-white/50 text-secondary-50 hover:text-secondary transition-colors"
            onClick={() => handleDeleteStep(step.board_id, step.board_step_id)}
            title="Delete list"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Cards Container */}
        <div className="space-y-2 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
          {step.leads.map((lead) => (
            <LeadCardView
              key={lead.lead_id}
              lead={lead}
              stepId={step.board_step_id}
              moveTargets={moveTargets}
              busy={!!busy}
              onSave={(updates) => handleUpdateLead(lead.lead_id, updates)}
              onDelete={() => handleDeleteLead(lead.lead_id, step.board_step_id)}
              onMove={(targetStepId) =>
                handleMoveLead(lead.lead_id, step.board_step_id, targetStepId)
              }
              onUploadGalleryImage={(file) => handleUploadLeadGalleryImage(lead.lead_id, file)}
              onDeleteGalleryImage={(imageId) => handleDeleteLeadGalleryImage(lead.lead_id, imageId)}
            />
          ))}

          {step.properties.map((property) => (
            <PropertyCardView
              key={property.property_id}
              property={property}
              stepId={step.board_step_id}
              moveTargets={moveTargets}
              busy={!!busy}
              onSave={(updates) =>
                handleUpdateProperty(property, updates)
              }
              onDelete={() =>
                handleDeleteProperty(property, step.board_step_id)
              }
              onMove={(targetStepId) =>
                handleMoveProperty(
                  property.property_id,
                  step.board_step_id,
                  targetStepId
                )
              }
              onUploadGalleryImage={(file) => handleUploadPropertyGalleryImage(property, file)}
              onDeleteGalleryImage={(imageId) => handleDeletePropertyGalleryImage(property, imageId)}
            />
          ))}
        </div>

        {/* Add Card Button */}
        <button
          className="w-full rounded-lg py-2 text-sm text-secondary-50 hover:bg-white/50 hover:text-secondary transition-colors flex items-center gap-2 px-2"
          onClick={() => setComposerOpen((prev) => !prev)}
        >
          <Plus size={16} />
          {composerOpen ? "Close" : "Add a card"}
        </button>

        {/* Composer */}
        {composerOpen && (
          <div className="space-y-3 border-t border-secondary-50 pt-3 bg-primary rounded-lg p-3">
            <p className="text-xs text-secondary-50">
              {isLeadBoard
                ? "This board is configured for lead cards."
                : "This board is configured for property cards."}
            </p>

            {isLeadBoard ? (
              <LeadComposerForm
                disabled={!!busy}
                form={leadForm}
                onChange={updateLeadForm}
                imageFile={leadImageFile}
                onImageChange={setLeadImageFile}
                onSubmit={() => {
                  handleCreateLead(step.board_step_id, leadForm, leadImageFile);
                  setLeadForm(createDefaultLeadForm());
                  setLeadImageFile(null);
                  setComposerOpen(false);
                }}
              />
            ) : (
              <PropertyComposerForm
                disabled={!!busy}
                form={propertyForm}
                onChange={updatePropertyForm}
                onAddressChange={updatePropertyAddress}
                imageFile={propertyImageFile}
                onImageChange={setPropertyImageFile}
                onSubmit={() => {
                  handleCreateProperty(
                    step.board_step_id,
                    propertyForm,
                    propertyImageFile
                  );
                  setPropertyForm(createDefaultPropertyForm());
                  setPropertyImageFile(null);
                  setComposerOpen(false);
                }}
              />
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-1 bg-background overflow-hidden">
      {/* Sidebar */}
      <div className={clsx(
        "flex-shrink-0 h-full overflow-auto border-r border-secondary-50/30 bg-background transition-all duration-300 flex flex-col",
        sidebarOpen ? "w-72" : "w-0"
      )}>
        <BoardList />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Error Message */}
        {error && (
          <div className="bg-error text-white px-6 py-4 text-sm font-medium">
            <p>{error}</p>
          </div>
        )}

        {/* Warning Message */}
        {warning && (
          <div className="bg-yellow-500 text-white px-6 py-4 text-sm font-medium animate-pulse">
            <p>{warning}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent mb-4"></div>
              <p className="text-secondary-50">Loading boards...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !activeBoard && (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">📋</div>
              <h2 className="text-2xl font-bold text-secondary mb-2">No Board Selected</h2>
              <p className="text-secondary-50">Create a board to get started with your project management.</p>
            </div>
          </div>
        )}

        {/* Board View */}
        {!loading && activeBoard && (
          <>
            {/* Status Message */}
            {busy && (
              <div className="bg-primary border-b border-accent text-secondary px-6 py-3 text-sm font-medium">
                {busy}
              </div>
            )}

            {/* Header */}
            <div className="flex-shrink-0">
              <BoardHeader />
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden">
              <div className="flex gap-4 p-4 h-full min-w-min items-start">
                {activeBoard.board_steps
                  .slice()
                  .sort((a, b) => a.board_column - b.board_column)
                  .map((step) => (
                    <StepColumn
                      key={step.board_step_id}
                      step={step}
                      boardType={activeBoardType}
                    />
                  ))}
                <AddListCard />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const LeadComposerForm = ({
  form,
  disabled,
  onChange,
  imageFile,
  onImageChange,
  onSubmit,
}: {
  form: LeadComposerState;
  disabled: boolean;
  onChange: (key: keyof LeadComposerState, value: string) => void;
  imageFile: File | null;
  onImageChange: (file: File | null) => void;
  onSubmit: () => void;
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-500 uppercase tracking-wide">
        <span className="font-semibold">
          Lead Title
          <span className="ml-2 text-[11px] font-normal text-secondary-50 normal-case">
            Optional
          </span>
        </span>
        <span className="text-slate-400 normal-case">
          Appears on the card
        </span>
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
      <TextArea
        placeholder="Notes"
        value={form.notes}
        onChange={(value) => onChange("notes", value)}
      />
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-secondary uppercase">
          Card Image
        </label>
        <label className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-secondary-50 rounded-lg cursor-pointer hover:border-accent hover:bg-accent/5 transition-colors">
          <Upload size={18} className="text-secondary-50" />
          <span className="text-sm text-secondary-50">Click to upload image</span>
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

const PropertyComposerForm = ({
  form,
  disabled,
  onChange,
  onAddressChange,
  imageFile,
  onImageChange,
  onSubmit,
}: {
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
}) => {
  const hasAllAddressFields =
    !!form.address.street_1.trim() &&
    !!form.address.city.trim() &&
    !!form.address.state.trim() &&
    !!form.address.zipcode.trim();
  const hasRequiredFields = !!form.property_name.trim() && hasAllAddressFields;

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
          className="w-full px-3 py-2 rounded border border-secondary-50 text-sm text-secondary focus:outline-none focus:border-accent"
        />
      </div>
      <input
        type="text"
        placeholder="MLS #"
        value={form.mls_number}
        onChange={(e) => onChange("mls_number", e.target.value)}
        className="w-full px-3 py-2 rounded border border-secondary-50 text-sm text-secondary focus:outline-none focus:border-accent"
      />
      <TextArea
        placeholder="Notes"
        value={form.notes}
        onChange={(value) => onChange("notes", value)}
      />
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-secondary uppercase">Address</label>
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
              className="w-full px-3 py-2 rounded border border-secondary-50 text-sm text-secondary focus:outline-none focus:border-accent"
            />
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
                className="w-full px-3 py-2 rounded border border-secondary-50 text-sm text-secondary focus:outline-none focus:border-accent"
              />
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
                className="w-full px-3 py-2 rounded border border-secondary-50 text-sm text-secondary focus:outline-none focus:border-accent"
              />
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
                className="w-full px-3 py-2 rounded border border-secondary-50 text-sm text-secondary focus:outline-none focus:border-accent"
              />
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
          <span className="text-sm text-secondary-50">Click to upload image</span>
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
        {hasRequiredFields
          ? "All required fields provided."
          : "Provide property name, street 1, city, state, and zip before saving."}
      </p>
      <button
        type="button"
        className="w-full rounded-lg bg-accent hover:bg-accent/90 text-white py-2 text-sm font-semibold transition-colors disabled:opacity-50"
        onClick={onSubmit}
        disabled={disabled}
      >
        Create Property
      </button>
    </div>
  );
};

const LeadCardView = ({
  lead,
  stepId,
  moveTargets,
  busy,
  onSave,
  onDelete,
  onMove,
  onUploadGalleryImage,
  onDeleteGalleryImage,
}: {
  lead: LeadCard;
  stepId: number;
  moveTargets: BoardStepCard[];
  busy: boolean;
  onSave: (updates: LeadComposerState) => void;
  onDelete: () => void;
  onMove: (targetStepId: number) => void;
  onUploadGalleryImage: (file: File) => Promise<void> | void;
  onDeleteGalleryImage: (imageId: number) => Promise<void> | void;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  
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
    }
  }, [isModalOpen, lead]);

  // Check if form has unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    return (
      formState.business !== (lead.business ?? "") ||
      formState.person_type !== (lead.person_type ?? "") ||
      formState.website !== (lead.website ?? "") ||
      formState.license_num !== (lead.license_num ?? "") ||
      formState.notes !== (lead.notes ?? "")
    );
  }, [formState, lead]);

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

  const leadTitle = lead.business?.trim() || "Untitled Lead";
  const thumbnailImage = galleryImages[currentImageIndex]?.url || galleryImages[0]?.url;

  const updateField = (field: keyof LeadComposerState, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }));
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
      {/* Compact Card Thumbnail */}
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData(
            "card",
            JSON.stringify({ cardId: lead.lead_id, fromStepId: stepId, cardType: "lead" })
          );
        }}
        onClick={() => setIsModalOpen(true)}
        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
      >
        {thumbnailImage && (
          <div className="relative">
            <img
              src={thumbnailImage}
              alt={leadTitle}
              className="w-full h-32 object-cover rounded-t-lg"
            />
            {galleryImages.length > 1 && (
              <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                {galleryImages.length} images
              </span>
            )}
          </div>
        )}
        <div className="p-3 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-semibold text-secondary-50 uppercase">Business</span>
              <p className="font-medium text-secondary text-sm truncate">{leadTitle}</p>
            </div>
            <span className="text-[10px] font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded shrink-0">
              LEAD
            </span>
          </div>
          {lead.person_type && (
            <div>
              <span className="text-[9px] font-semibold text-secondary-50 uppercase">Category</span>
              <p className="text-xs text-secondary truncate">{lead.person_type}</p>
            </div>
          )}
          {lead.website && (
            <div>
              <span className="text-[9px] font-semibold text-secondary-50 uppercase">Website</span>
              <p className="text-xs text-blue-600 truncate">{lead.website}</p>
            </div>
          )}
          {lead.license_num && (
            <div>
              <span className="text-[9px] font-semibold text-secondary-50 uppercase">License #</span>
              <p className="text-xs text-secondary truncate">{lead.license_num}</p>
            </div>
          )}
          {lead.contact?.email && (
            <div>
              <span className="text-[9px] font-semibold text-secondary-50 uppercase">Email</span>
              <p className="text-xs text-secondary truncate">{lead.contact.email}</p>
            </div>
          )}
          {lead.notes && (
            <div>
              <span className="text-[9px] font-semibold text-secondary-50 uppercase">Notes</span>
              <p className="text-xs text-secondary-50 line-clamp-2">{lead.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseModal(); }}
        >
          <div className="modal-content bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-secondary-50/30">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-1 rounded">LEAD</span>
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
                onUpload={onUploadGalleryImage}
                onDelete={onDeleteGalleryImage}
                busy={busy}
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
                    <span className="text-[10px] font-semibold text-secondary-50 uppercase block mb-1">Email (read-only)</span>
                    <p className="text-sm text-secondary px-3 py-2 bg-secondary-50/10 rounded-lg">{lead.contact.email}</p>
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
                      onChange={(e) => { onMove(Number(e.target.value)); setIsModalOpen(false); }}
                    >
                      {moveTargets.map((target) => (
                        <option key={target.board_step_id} value={target.board_step_id}>
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
                  onClick={() => { onDelete(); setIsModalOpen(false); }}
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
              <h3 className="text-lg font-semibold text-secondary">Unsaved Changes</h3>
            </div>
            <p className="text-secondary-50 mb-6">
              You have unsaved changes. Are you sure you want to close without saving?
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

const PropertyCardView = ({
  property,
  stepId,
  moveTargets,
  busy,
  onSave,
  onDelete,
  onMove,
  onUploadGalleryImage,
  onDeleteGalleryImage,
}: {
  property: PropertyCard;
  stepId: number;
  moveTargets: BoardStepCard[];
  busy: boolean;
  onSave: (updates: { property_name: string; notes: string; mls_number: string }) => void;
  onDelete: () => void;
  onMove: (targetStepId: number) => void;
  onUploadGalleryImage: (file: File) => Promise<void> | void;
  onDeleteGalleryImage: (imageId: number) => Promise<void> | void;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  // Local form state
  const [formState, setFormState] = useState({
    property_name: property.property_name ?? "",
    notes: property.notes ?? "",
    mls_number: property.mls_number ?? "",
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setFormState({
        property_name: property.property_name ?? "",
        notes: property.notes ?? "",
        mls_number: property.mls_number ?? "",
      });
    }
  }, [isModalOpen, property]);

  // Check if form has unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    return (
      formState.property_name !== (property.property_name ?? "") ||
      formState.notes !== (property.notes ?? "") ||
      formState.mls_number !== (property.mls_number ?? "")
    );
  }, [formState, property]);

  // Build images array from gallery images
  const galleryImages = useMemo(() => {
    const imgs: { url: string; id?: number }[] = [];
    if (property.images && property.images.length > 0) {
      property.images.forEach((img) => {
        const url = resolveAssetUrl(img.image_url);
        if (url) imgs.push({ url, id: img.property_image_id });
      });
    } else if (property.image_url) {
      const url = resolveAssetUrl(property.image_url);
      if (url) imgs.push({ url });
    }
    return imgs;
  }, [property.images, property.image_url]);

  const propertyTitle = property.property_name?.trim() || "Unnamed Property";
  const thumbnailImage = galleryImages[currentImageIndex]?.url || galleryImages[0]?.url;
  const addressLine = property.address
    ? `${property.address.street_1 ?? ""} ${property.address.city ?? ""}`.trim()
    : "";

  const updateField = (field: keyof typeof formState, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }));
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
      {/* Compact Card Thumbnail */}
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData(
            "card",
            JSON.stringify({ cardId: property.property_id, fromStepId: stepId, cardType: "property" })
          );
        }}
        onClick={() => setIsModalOpen(true)}
        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
      >
        {thumbnailImage && (
          <div className="relative">
            <img
              src={thumbnailImage}
              alt={propertyTitle}
              className="w-full h-32 object-cover rounded-t-lg"
            />
            {galleryImages.length > 1 && (
              <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                {galleryImages.length} images
              </span>
            )}
          </div>
        )}
        <div className="p-3 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-semibold text-secondary-50 uppercase">Property Name</span>
              <p className="font-medium text-secondary text-sm truncate">{propertyTitle}</p>
            </div>
            <span className="text-[10px] font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded shrink-0">
              PROPERTY
            </span>
          </div>
          {addressLine && (
            <div>
              <span className="text-[9px] font-semibold text-secondary-50 uppercase">Address</span>
              <p className="text-xs text-secondary truncate">{addressLine}</p>
            </div>
          )}
          {property.mls_number && (
            <div>
              <span className="text-[9px] font-semibold text-secondary-50 uppercase">MLS #</span>
              <p className="text-xs text-accent">{property.mls_number}</p>
            </div>
          )}
          {property.notes && (
            <div>
              <span className="text-[9px] font-semibold text-secondary-50 uppercase">Notes</span>
              <p className="text-xs text-secondary-50 line-clamp-2">{property.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseModal(); }}
        >
          <div className="modal-content bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-secondary-50/30">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-1 rounded">PROPERTY</span>
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
                onUpload={onUploadGalleryImage}
                onDelete={onDeleteGalleryImage}
                busy={busy}
              />

              {/* Form Fields */}
              <div className="space-y-4">
                <FormField
                  label="Property Name"
                  value={formState.property_name}
                  onChange={(v) => updateField("property_name", v)}
                  placeholder="Enter property name"
                />

                <FormField
                  label="MLS #"
                  value={formState.mls_number}
                  onChange={(v) => updateField("mls_number", v)}
                  placeholder="Enter MLS number"
                />

                <FormField
                  label="Notes"
                  value={formState.notes}
                  onChange={(v) => updateField("notes", v)}
                  placeholder="Add notes..."
                  multiline
                />

                {property.address && (
                  <div>
                    <span className="text-[10px] font-semibold text-secondary-50 uppercase block mb-1">Address (read-only)</span>
                    <p className="text-sm text-secondary px-3 py-2 bg-secondary-50/10 rounded-lg">
                      {property.address.street_1}
                      <br />
                      {property.address.city}, {property.address.state} {property.address.zipcode}
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
                      onChange={(e) => { onMove(Number(e.target.value)); setIsModalOpen(false); }}
                    >
                      {moveTargets.map((target) => (
                        <option key={target.board_step_id} value={target.board_step_id}>
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
                  onClick={() => { onDelete(); setIsModalOpen(false); }}
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
              <h3 className="text-lg font-semibold text-secondary">Unsaved Changes</h3>
            </div>
            <p className="text-secondary-50 mb-6">
              You have unsaved changes. Are you sure you want to close without saving?
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
