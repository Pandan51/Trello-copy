
import {useState} from "react";

type Props = {
    onAddTask: (title: string)=>void;

}

function AddTask({onAddTask}: Props) {
    const [inputTitle, setInputTitle] = useState("");

    return(
        <div>
            <form>
                <label htmlFor="title">Title</label>
                <input type="text" id="fname" name="title" value={inputTitle} onChange={(e)=>setInputTitle(e.target.value)}/>
                <button type="button" onClick={()=>onAddTask(inputTitle)}>Add List</button>
            </form>
        </div>
    )

}

export default AddTask;