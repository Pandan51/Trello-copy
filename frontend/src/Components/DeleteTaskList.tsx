type Props = {
    onDeleteList: () => void;
}
function DeleteList({onDeleteList}: Props){
    return (
        <div>
            <button type={"button"} onClick={()=> onDeleteList() } >Delete</button>
        </div>
    )
}

export default DeleteList;