
import {useState} from "react";

type Props = {
    onAddTask: (title:string, desc:string)=>void;

}

function AddTask({onAddTask}: Props) {
    const [inputTitle, setInputTitle] = useState("");
    const [inputDesc, setInputDesc] = useState("");

    return(
        <div>
            <form className={"task-add-form"}>
                <label htmlFor="title">Title</label>
                <input type="text" id="fname" name="title" value={inputTitle}
                       onChange={(e)=>
                           setInputTitle(e.target.value)}/>
                <label htmlFor="description">Description</label>
                <input type="text" id="desc" name="description" value={inputDesc}
                    onChange={(e)=>
                        setInputDesc(e.target.value)}/>

                <button type="button" onClick={()=>{
                    if(inputTitle)
                        onAddTask(inputTitle, inputDesc)
                    setInputTitle("");
                    setInputDesc("");
                }
                }>Add task</button>
            </form>
        </div>
    )

}

export default AddTask;