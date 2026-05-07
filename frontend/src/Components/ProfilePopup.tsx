import {useContext, useEffect} from "react";
import {ThemeContext} from "../Context/ThemeContext.ts";

type Props = {
    isToggle : boolean;
}

function ProfilePopup({isToggle}: Props){
    let theme = useContext(ThemeContext);


    console.log(theme);
    return (
        <>
            <div style={{display: isToggle ? 'block': 'none'}} className="profile-detail bg-amber-600">New content</div>
        </>
    )
}

export default ProfilePopup;