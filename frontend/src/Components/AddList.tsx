import {useState} from "react";

type Props = {
    onAddList: (title: string)=>void;

}

function AddList({onAddList}: Props) {
    const [inputTitle, setInputTitle] = useState("");

    return(
        <div>
            <form>
                <label htmlFor="title">Title</label>
                <input type="text" id="fname" name="title" value={inputTitle} onChange={(e)=>setInputTitle(e.target.value)}/>
                <button type="button" onClick={()=>onAddList(inputTitle)}>Add List</button>
            </form>
        </div>
    )

}

export default AddList;