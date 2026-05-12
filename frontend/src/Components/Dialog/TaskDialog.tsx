import { useRef, useState, useEffect, useContext } from "react";
import DeleteTask from "../CRUD/DeleteTask.tsx";
import type { Task } from "../../types";
import MDEditor from "@uiw/react-md-editor";
import { ThemeContext } from "../../Context/ThemeContext.ts";

// type Task = {
//   id: string;
//   title: string;
//   description: string;
// };

type Props = {
  task: Task;
  onSave: (
    id: string,
    title: string,
    description: string,
    isCompleted: boolean,
  ) => void;
  onClose: () => void;
  onDeleteTask: (taskId: string) => void;
  onInitiateCopy: (task: Task) => void;
};

export default function TaskDialog({
  task,
  onClose,
  onSave,
  onDeleteTask,
  onInitiateCopy,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description); // Fallback to initial prop
  const [isLoading, setIsLoading] = useState(true); // Track loading state
  const [isCompleted, setIsCompleted] = useState(task.completed);
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    // 1. Create the native browser controller
    const controller = new AbortController();

    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const url = `http://localhost:3000/tasks/${task.id}/detail`;
        const detailDesc = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal, // 2. Plug the signal into the fetch
        })
          .then((res) => {
            if (!res.ok) throw new Error("Network response was not ok");
            return res.json();
          })
          .then((data) => data.description);

        // 3. We no longer need the 'isMounted' check!
        // If the fetch succeeds, we know the component is still alive.
        setDescription(detailDesc);
      } catch (error) {
        // 4. If we intentionally aborted it, just silently ignore it
        if (error.name === "AbortError") {
          console.log("Dialog closed, fetch cancelled!");
          return; // Exit early so we don't trigger setIsLoading(false) below
        }
        console.error("Failed to fetch task details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();

    return () => {
      // 5. Instantly kill the network request if the dialog closes
      controller.abort();
    };
  }, [task.id]);

  // 3. Handle Dialog lifecycle
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }

    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    dialog?.addEventListener("cancel", handleCancel);

    return () => dialog?.removeEventListener("cancel", handleCancel);
  }, [onClose]);

  const handleSave = () => {
    onSave(task.id, title, description, isCompleted);
    onClose();
  };

  const handleDelete = () => {
    onDeleteTask(task.id);
    onClose();
  };

  return (
    <dialog
      className={"popup-detail"}
      ref={dialogRef}
      // style={{
      //     padding: '20px',
      //     borderRadius: '8px',
      //     border: 'none',
      //     minWidth: '300px',
      //     boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      // }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <h2 style={{ margin: 0 }}>Edit Task</h2>
        <input
          type="checkbox"
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            setIsCompleted(e.target.checked);
          }}
          checked={isCompleted}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label style={{ fontWeight: "bold" }}>Title</label>
          <input
            type="text"
            style={{ padding: "8px", fontSize: "16px" }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div data-color-mode={theme === "dark" ? "dark" : "light"}>
          <MDEditor
            value={description}
            onChange={(val) => setDescription(val || "")}
            height={200}
            preview="live" // Shows the editor and the preview side-by-side
          />
        </div>

        <div className="flex justify-between items-center">
          <DeleteTask onDeleteTask={() => handleDelete()} />
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
              disabled={isLoading} // Prevent saving before data loads
              style={{
                padding: "8px 16px",
                backgroundColor: isLoading ? "#ccc" : "#9339C6",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              Save
            </button>

            <button
              type="button"
              onClick={() => {
                onInitiateCopy(task);
                onClose(); // Close the current edit dialog so the copy dialog can open
              }}
              className="text-blue-500 hover:underline px-2"
            >
              Copy Task
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
