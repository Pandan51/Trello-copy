import { useState } from "react";

type Props = {
  onAddList: (title: string) => void;
};

function AddList({ onAddList }: Props) {
  const [inputTitle, setInputTitle] = useState("");

  return (
    <div>
      <form>
        <label className="dark:text-white" htmlFor="title">Title</label>
        <input
          type="text"
          id="fname"
          name="title"
          value={inputTitle}
          onChange={(e) => setInputTitle(e.target.value)}
        />
        <button
          type="button"
          onClick={() => {
              if(inputTitle != "" && inputTitle != undefined) {
                  onAddList(inputTitle);
              }

            setInputTitle("");
          }}
        >
          Add List
        </button>
      </form>
    </div>
  );
}

export default AddList;
