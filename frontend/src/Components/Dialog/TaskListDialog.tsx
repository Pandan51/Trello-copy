import { useState, useEffect, useRef } from "react";
import DeleteTaskList from "../CRUD/DeleteTaskList.tsx";
import type { TaskListType } from "../../types";

type Props = {
  list: TaskListType;
  onSave: (id: string, title: string, color: string) => void;
  onClose: () => void;
  onDeleteTaskList: (listId: string) => void;
};

export default function TaskDialog({
  list,
  onClose,
  onSave,
  onDeleteTaskList,
}: Props) {
  // We need a ref to access the native HTML dialog element's methods
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Local state for the editable fields, pre-filled with the current task's data
  const [title, setTitle] = useState(list.title);
  const [color, setColor] = useState(list.color || "#9339C6");

  useEffect(() => {
    // When this component mounts, natively show it as a modal (which adds the backdrop!)
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }

    // Handle the native behavior where the user pres   ses the 'Escape' key
    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    dialog?.addEventListener("cancel", handleCancel);
    return () => dialog?.removeEventListener("cancel", handleCancel);
  }, [onClose]);

  const handleSave = () => {
    onSave(list.id, title, color);
    onClose(); // Unmount the dialog
  };

  const handleDelete = () => {
    onDeleteTaskList(list.id);
    onClose();
  };

  return (
    <dialog className={"popup-detail"} ref={dialogRef}>
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <h2 style={{ margin: 0 }}>Edit list</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label style={{ fontWeight: "bold" }}>Title</label>
          <input
            type="text"
            style={{ padding: "8px", fontSize: "16px" }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label style={{ fontWeight: "bold" }}>List Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 cursor-pointer border-0 p-0 rounded"
            />
            <span className="text-sm font-mono">{color}</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <DeleteTaskList onDeleteList={() => handleDelete()} />
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "10px",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{ padding: "8px 16px" }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              style={{
                padding: "8px 16px",
                backgroundColor: "#9339C6",
                color: "white",
                border: "none",
                borderRadius: "4px",
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
