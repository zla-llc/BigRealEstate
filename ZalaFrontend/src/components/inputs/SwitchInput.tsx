import type { CheckboxInputProps } from "./CheckboxInput";
import clsx from "clsx";
import Switch from "@mui/material/Switch";
import { COLORS } from "../../config";
import { alpha, useTheme } from "@mui/material/styles";

export const SwitchInput = ({
  checked,
  onClick,
  shadow,
  text,
  reverse,
}: CheckboxInputProps) => {
  const theme = useTheme();
  return (
    <div
      onClick={onClick}
      className={clsx(
        "flex justify-between items-center w-full transition-colors bg-white cursor-pointer",
        "space-x-3 rounded-[15px] border-2 px-2.5 py-3 text-left",
        reverse ? "flex-row-reverse" : "flex-row",
        shadow && checked ? "box-shadow-sm" : "",
        checked
          ? "border-secondary"
          : "hover:border-secondary border-secondary-50"
      )}
    >
      <span
        className={clsx(
          "text-xl font-medium",
          checked ? "text-secondary" : "text-secondary-50"
        )}
      >
        {text}
      </span>

      <div className={clsx("scale-125")}>
        <Switch
          checked={checked}
          sx={{
            "& .MuiSwitch-switchBase.Mui-checked": {
              color: COLORS.accent,
              "&:hover": {
                backgroundColor: alpha(
                  COLORS.accent,
                  theme.palette.action.hoverOpacity
                ),
              },
            },
            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
              backgroundColor: COLORS.accent,
            },
          }}
          size="medium"
        />
      </div>
      {/* <Icon
              name={checked ? Icons.CheckboxChecked : Icons.CheckboxOutline}
              color={checked ? COLORS.accent : COLORS.secondary50}
            /> */}
    </div>
  );
};
