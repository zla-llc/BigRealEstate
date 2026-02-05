import { useAppHeader } from "../../hooks";
import { IconButton, IconButtonVariant } from "../buttons";
import { Icons } from "../icons";
import { TextInput } from "../inputs";
import { NotificationBell } from "./NotificationBell";

export const AppHeader = () => {
  const {
    query,
    sideNavIcon,
    setQuery,
    toLeadSearchPage,
    onSearchClick,
    onSidenavBtn,
    // toBoardsV2Page,
    toDashboard,
  } = useAppHeader();

  return (
    <div className="w-full z-10 flex flex-row items-center justify-between p-4 px-[100px] bg-[var(--color-primary)] box-shadow">
      <div>
        <p
          className="text-5xl font-bold cursor-pointer grenze"
          onClick={toLeadSearchPage}
        >
          Zala
        </p>
      </div>

      <div className="flex-1 h-full px-10">
        <TextInput
          placeholder="Search by city and state/zip eg. Buffalo NY"
          value={query}
          setValue={setQuery}
          icon={Icons.Search}
          iconVariant={IconButtonVariant.Accent}
          onIconPress={onSearchClick}
          onKeyPressProps={{ Enter: onSearchClick }}
        />
      </div>

      <div className="flex flex-row items-center space-x-4">
        <NotificationBell />
        <IconButton name={Icons.Map} onClick={toLeadSearchPage} />
        <IconButton name={Icons.Dashboard} onClick={toDashboard} />
        <IconButton name={sideNavIcon} onClick={onSidenavBtn} />
      </div>
    </div>
  );
};
