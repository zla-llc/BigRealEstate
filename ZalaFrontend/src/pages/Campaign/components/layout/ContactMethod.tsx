import { Icon, Icons } from "../../../../components";
import clsx from "clsx";
import { COLORS } from "../../../../config";
import { useHover } from "../../../../hooks";

type ContactMethodProps = {
  icon: Icons;
  text: string;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
};

export const ContactMethod = ({
  icon,
  text,
  active,
  onClick,
  disabled,
}: ContactMethodProps) => {
  const [isHovered, hoverProps] = useHover({ onClick });
  let clicked = false;
  const changeClick = () => {
    if(clicked){
      clicked = false
    }
    else{
      clicked = true
    }
    console.log(clicked)
  };
  const isActive = isHovered || clicked;
  let style;
  let color;
  let textColor;
  let borderColor;
  if(disabled){
    style = { cursor: 'not-allowed' };
    color = COLORS.secondary50
    textColor = "text-secondary-50"
    borderColor = "border-secondary-50"
    onClick = () => {return;}
  }
  else{
    style = {}
    color = isActive ? COLORS.accent : COLORS.secondary50
    textColor = isActive ? "text-accent" : "text-secondary-50"
    borderColor = isActive ? "border-accent" : "border-secondary-50"
  }
  return (
    <div
      {...hoverProps}
      className={clsx(
        "w-[135px] h-[135px] rounded-[15px]",
        "flex flex-col items-center justify-center space-y-[10px] cursor-pointer",
        "border-4 border-dashed",
        borderColor
      )}
      style={style}
    >
      <Icon
        name={icon}
        color={color}
        scale={1.5}
      />
      <p
        className={clsx(
          "text-base font-bold",
          textColor
        )}
      >
        {text}
      </p>
    </div>
  );
};
