type Props = {
    isToggle : boolean;
}

function ProfilePopup({isToggle}: Props){
    return (
        <>
            <div style={{display: isToggle ? 'block': 'none'}} className="profile-detail">New content</div>
        </>
    )
}

export default ProfilePopup;