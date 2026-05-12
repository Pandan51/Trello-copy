import { useState } from "react";
import ProfilePopup from "./ProfilePopup.tsx";

type Props = {
  imageSrc: string;
};
function ProfilePicture({ imageSrc }: Props) {
  const [popupState, setPopupState] = useState<boolean>(false);
  const handleClick = () => {
    setPopupState((popupState) => !popupState);
  };
  return (
    <>
      <div className="picture-placeholder">
        <img
          onClick={handleClick}
          className="picture-profile"
          src={imageSrc}
          alt={imageSrc}
        />
        <ProfilePopup isToggle={popupState}></ProfilePopup>
      </div>
    </>
  );
}

export default ProfilePicture;
