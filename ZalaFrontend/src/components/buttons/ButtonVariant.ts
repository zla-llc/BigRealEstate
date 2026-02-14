import { COLORS } from "../../config";

export enum ButtonVariant {
  Primary = "Primary",
  Secondary = "Secondary",
  Tertiary = "Tertiary",
  Destructive = "Destructive",
}

export enum MenuButtonVariant {
  Default = "Default",
  Destructive = "Destructive",
}

const menuButtonVariantToButtonVariant = (variant: MenuButtonVariant) => {
  switch (variant) {
    case MenuButtonVariant.Destructive:
      return ButtonVariant.Destructive;
    case MenuButtonVariant.Default:
    default:
      return ButtonVariant.Secondary;
  }
};

export const getMenuButtonBgColor = (variant: MenuButtonVariant) => {
  return getButtonBgColor(menuButtonVariantToButtonVariant(variant));
};

export const getButtonBgColor = (variant: ButtonVariant) => {
  switch (variant) {
    case ButtonVariant.Primary:
      return "bg-accent";
    case ButtonVariant.Tertiary:
      return "bg-secondary";
    case ButtonVariant.Destructive:
      return "bg-error";
    case ButtonVariant.Secondary:
    default:
      return "bg-white";
  }
};

export const getButtonBgColorHex = (variant: ButtonVariant) => {
  switch (variant) {
    case ButtonVariant.Primary:
      return COLORS.accent;
    case ButtonVariant.Tertiary:
      return COLORS.secondary;
    case ButtonVariant.Destructive:
      return COLORS.error;
    case ButtonVariant.Secondary:
    default:
      return COLORS.white;
  }
};

export const getMenuButtonBgColorHex = (variant: MenuButtonVariant) => {
  return getButtonBgColorHex(menuButtonVariantToButtonVariant(variant));
};

export const getButtonTextColor = (variant: ButtonVariant) => {
  switch (variant) {
    case ButtonVariant.Primary:
    case ButtonVariant.Tertiary:
    case ButtonVariant.Destructive:
      return "text-white";
    case ButtonVariant.Secondary:
    default:
      return "text-secondary";
  }
};

export const getMenuButtonTextColor = (variant: MenuButtonVariant) => {
  return getButtonTextColor(menuButtonVariantToButtonVariant(variant));
};

export const getButtonTextColorHex = (variant: ButtonVariant) => {
  switch (variant) {
    case ButtonVariant.Primary:
    case ButtonVariant.Tertiary:
    case ButtonVariant.Destructive:
      return COLORS.white;
    case ButtonVariant.Secondary:
    default:
      return COLORS.secondary;
  }
};

export const getMenuButtonTextColorHex = (variant: MenuButtonVariant) => {
  return getButtonTextColorHex(menuButtonVariantToButtonVariant(variant));
};

export const getMenuButtonActiveColorHex = (variant: MenuButtonVariant) => {
  switch (variant) {
    case MenuButtonVariant.Destructive:
      return COLORS.white;
    case MenuButtonVariant.Default:
    default:
      return COLORS.accent;
  }
};
