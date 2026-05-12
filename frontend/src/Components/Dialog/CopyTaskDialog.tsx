import { useRef, useState, useEffect, useContext } from "react";
import type { Task, TaskListType } from "../../types";
import MDEditor from "@uiw/react-md-editor";
import { ThemeContext } from "../../Context/ThemeContext.ts";

type Props = {
  task: Task; // The original task we are copying from
  taskLists: TaskListType[];
  onCopy: (
    title: string,
    description: string,
    isCompleted: boolean,
    listId: string,
  ) => void;
  onClose: () => void;
};

export default function CopyTaskDialog({
  task,
  taskLists,
  onClose,
  onCopy,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { theme } = useContext(ThemeContext);

  // 1. Pre-fill the state with the original task's data
  const [title, setTitle] = useState(`${task.title} (Copy)`);
  const [description, setDescription] = useState(task.description);
  const [isCompleted, setIsCompleted] = useState(task.completed);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Determine initial 1-based index of the list
  const initialIndex = taskLists.findIndex((l) => l.id === task.listId) + 1;
  const [targetListNumber, setTargetListNumber] = useState<number | string>(
    initialIndex > 0 ? initialIndex : 1,
  );

  // 2. Fetch the full description (just like TaskDialog does)
  useEffect(() => {
    const controller = new AbortController();
    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const url = `http://localhost:3000/tasks/${task.id}/detail`;
        const detailDesc = await fetch(url, { signal: controller.signal })
          .then((res) => {
            if (!res.ok) throw new Error("Network response was not ok");
            return res.json();
          })
          .then((data) => data.description);

        setDescription(detailDesc);
      } catch (error: any) {
        if (error.name === "AbortError") return;
        console.error("Failed to fetch task details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
    return () => controller.abort();
  }, [task.id]);

  // 3. Dialog Lifecycle
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();

    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    dialog?.addEventListener("cancel", handleCancel);
    return () => dialog?.removeEventListener("cancel", handleCancel);
  }, [onClose]);

  const handleListNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      setTargetListNumber("");
      return;
    }

    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      // Cap the number dynamically based on list count
      const cappedNum = Math.max(1, Math.min(taskLists.length, num));
      setTargetListNumber(cappedNum);
    }
  };

  const handleCreateCopy = () => {
    // 1. Force final index to be a valid number
    let finalIndex = Number(targetListNumber);

    // 2. Bound it between 1 and the max amount of lists
    if (isNaN(finalIndex) || finalIndex < 1) {
      finalIndex = 1;
    } else if (finalIndex > taskLists.length) {
      finalIndex = taskLists.length;
    }

    // 3. SAFETY CHECK: Convert 1-based UI index to 0-based array index securely
    let targetListId = task.listId; // Fallback to original list just in case!

    if (taskLists.length > 0 && taskLists[finalIndex - 1]) {
      targetListId = taskLists[finalIndex - 1].id;
    }

    onCopy(title, description, isCompleted, targetListId);
    onClose();
  };

  const previewIndex =
    (typeof targetListNumber === "number"
      ? targetListNumber
      : parseInt(targetListNumber || "1", 10)) - 1;
  const safeIndex = Math.max(
    0,
    Math.min(taskLists.length - 1, previewIndex || 0),
  );
  const targetListName = taskLists[safeIndex]?.title || "Unknown List";

  return (
    <dialog
      className="popup-detail bg-white dark:bg-slate-800 text-black dark:text-white"
      ref={dialogRef}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <h2 style={{ margin: 0 }}>Copy Task</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label style={{ fontWeight: "bold" }}>New Title</label>
          <input
            type="text"
            className="p-2 text-base border border-gray-300 dark:border-slate-600 rounded bg-transparent"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label style={{ fontWeight: "bold" }}>
            Target Column Number (1 to {taskLists.length})
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={taskLists.length}
              className="p-2 w-20 text-base border border-gray-300 dark:border-slate-600 rounded bg-transparent"
              value={targetListNumber}
              onChange={handleListNumberChange}
            />
            <span className="opacity-70 italic font-medium">
              ➔ {targetListName}
            </span>
          </div>
        </div>

        <div data-color-mode={theme === "dark" ? "dark" : "light"}>
          <MDEditor
            value={isLoading ? "Loading original description..." : description}
            onChange={(val) => setDescription(val || "")}
            height={200}
            preview="live"
          />
        </div>

        <div className="flex justify-between items-center mt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              onChange={(e) => setIsCompleted(e.target.checked)}
              checked={isCompleted}
            />
            Keep completed status
          </label>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: "8px 16px" }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateCopy}
              disabled={isLoading}
              style={{
                padding: "8px 16px",
                backgroundColor: isLoading ? "#ccc" : "#9339C6",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              Create Copy
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
