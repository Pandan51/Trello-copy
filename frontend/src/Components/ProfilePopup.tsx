import {useContext, useEffect} from "react";
import {ThemeContext} from "../Context/ThemeContext.ts";

type Props = {
    isToggle : boolean;
}

function ProfilePopup({isToggle}: Props){
    const {theme, setTheme} = useContext(ThemeContext);
    

    console.log(theme);
    return (
        <>
            <div className={`${isToggle ? "flex  flex-col justify-between p-2.5 gap-2 profile-detail bg-black dark:bg-amber-50" : "hidden"}`}>
                Tady maj bejt udaje o uzivateli ale ja sem moc line
                <button onClick={(e)=>{
                    e.stopPropagation();
                    if(theme === "dark") {
                        setTheme("light");
                    }
                    else if (theme === "light") {
                        setTheme("dark");
                    }

                }
                }>Change theme</button>
            </div>

        </>
    )
}

export default ProfilePopup;