type Props = {
    onDeleteTask: () => void;
}
function DeleteTask({onDeleteTask}: Props){
    return (
        <div>
            <button type={"button"} onClick={()=> onDeleteTask() } >Delete</button>
        </div>
    )
}

export default DeleteTask;