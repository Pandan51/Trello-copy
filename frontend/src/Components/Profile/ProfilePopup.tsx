import { useContext } from "react";
import { ThemeContext } from "../../Context/ThemeContext.ts";

type Props = {
  isToggle: boolean;
};

function ProfilePopup({ isToggle }: Props) {
  const { theme, setTheme } = useContext(ThemeContext);

  console.log(theme);
  return (
    <>
      <div
        className={`${isToggle ? "flex" : "hidden"} flex-col p-4 gap-4 profile-detail bg-white dark:bg-slate-800 rounded shadow-lg absolute right-0 mt-2 border border-gray-200 dark:border-slate-700`}
      >
        <span className="text-black dark:text-white font-semibold">
          Theme Settings
        </span>

        {/* The Dropdown */}
        <select
          value={theme}
          onChange={(e) => {
            e.stopPropagation();
            setTheme(e.target.value);
          }}
          onClick={(e) => e.stopPropagation()} // Prevents the popup from closing when clicking the select
          className="p-2 rounded bg-gray-100 dark:bg-slate-700 text-black dark:text-white border border-gray-300 dark:border-slate-600 outline-none cursor-pointer"
        >
          <option value="light">Light Mode</option>
          <option value="dark">Dark Mode</option>
          <option value="system">System Preference</option>
        </select>
      </div>
    </>
  );
}

export default ProfilePopup;
