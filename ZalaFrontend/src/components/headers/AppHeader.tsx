import { useAppHeader } from "../../hooks";
import { IconButton, IconButtonVariant } from "../buttons";
import { Icons } from "../icons";
import { TextInput } from "../inputs";

/**
 * The header of the app once you log in. Includes the search bar and top buttons.
 *
 * @returns {AppHeader}
 */
export const AppHeader = () => {
  const {
    query,
    sideNavIcon,
    setQuery,
    toLeadSearchPage,
    onSearchClick,
    onSidenavBtn,
    toBoardsV2Page,
  } = useAppHeader();

  return (
    <div className="w-full z-10 flex flex-row items-center justify-between p-4 px-[100px] bg-[var(--color-primary)] box-shadow">
      <div>
        <button
          className="text-5xl font-bold cursor-pointer grenze"
          onClick={toLeadSearchPage}
        >
          <img src="src\assets\images\zala_b.png" width={100}/>
        </button>
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

      <div className="flex flex-row space-x-4">
        <IconButton name={Icons.Kanban} onClick={toBoardsV2Page} />
        <IconButton name={Icons.User} />
        <IconButton name={sideNavIcon} onClick={onSidenavBtn} />
      </div>
    </div>
  );
};
