import clsx from "clsx";
import { useHover } from "../../hooks";
import { Icon, Icons } from "../icons";
import { COLORS } from "../../config";
import {
  getMenuButtonActiveColorHex,
  getMenuButtonBgColor,
  getMenuButtonTextColor,
  getMenuButtonTextColorHex,
  MenuButtonVariant,
} from "./ButtonVariant";
import { useCallback } from "react";

type MenuButtonProps = {
  text: string;
  variant?: MenuButtonVariant;
  bold?: boolean;
  onClick?: () => void;
};

export const MenuButton = ({
  text,
  variant = MenuButtonVariant.Default,
  bold,
  onClick,
}: MenuButtonProps) => {
  const [isHovered, hoverProps] = useHover({ onClick });

  const isActive = onClick && isHovered;

  const getBgColor = useCallback(getMenuButtonBgColor, []);
  const getTextColor = useCallback(getMenuButtonTextColor, []);
  const getTextHexColor = useCallback(getMenuButtonTextColorHex, []);
  const getActiveColor = useCallback(getMenuButtonActiveColorHex, []);

  return (
    <div
      {...hoverProps}
      style={{
        borderColor: isActive ? getActiveColor(variant) : COLORS.secondary50,
      }}
      className={clsx(
        "w-full rounded-lg border p-4 flex flex-row items-center justify-between",
        getBgColor(variant),
        isActive ? "border-2 cursor-pointer" : "",
      )}
    >
      <p
        style={{
          color: isActive ? getActiveColor(variant) : getTextHexColor(variant),
        }}
        className={clsx(
          "text-base",
          bold || isActive ? "font-semibold" : "",
          getTextColor(variant),
        )}
      >
        {text}
      </p>
      <Icon
        name={Icons.Chevron}
        color={isActive ? getActiveColor(variant) : getTextHexColor(variant)}
      />
    </div>
  );
};
