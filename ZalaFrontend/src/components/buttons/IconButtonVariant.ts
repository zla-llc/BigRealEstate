import { COLORS } from "../../config";

export enum IconButtonVariant {
  Primary = "Primary",
  Secondary = "Secondary",
  Accent = "Accent",
  Destructive = "",
  White = "White",
  Clear = "Clear",
}

export const getIconButtonBgColor = (variant: IconButtonVariant) => {
  switch (variant) {
    case IconButtonVariant.Primary:
      return "bg-[var(--color-primary)]";
    case IconButtonVariant.Secondary:
      return "bg-[var(--color-secondary)]";
    case IconButtonVariant.Accent:
      return "bg-[var(--color-accent)]";
    case IconButtonVariant.White:
    case IconButtonVariant.Destructive:
      return "bg-[var(--color-white)]";
    case IconButtonVariant.Clear:
    default:
      return "bg-transparent";
  }
};

export const getIconButtonColor = (variant: IconButtonVariant) => {
  switch (variant) {
    case IconButtonVariant.Secondary:
    case IconButtonVariant.Accent:
      return COLORS.white;
    case IconButtonVariant.Destructive:
      return COLORS.error;
    case IconButtonVariant.Primary:
    case IconButtonVariant.Clear:
    case IconButtonVariant.White:
    default:
      return COLORS.secondary;
  }
};
