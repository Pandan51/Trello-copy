import { useRef, useState, useEffect, useContext } from "react";
import type { Task } from "../types";
import MDEditor from '@uiw/react-md-editor';
import { ThemeContext } from "../Context/ThemeContext.ts";

type Props = {
    task: Task; // The original task we are copying from
    onCopy: (title: string, description: string, isCompleted: boolean, listId: string) => void;
    onClose: () => void;
};

export default function CopyTaskDialog({ task, onClose, onCopy }: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const { theme } = useContext(ThemeContext);

    // 1. Pre-fill the state with the original task's data
    const [title, setTitle] = useState(`${task.title} (Copy)`);
    const [description, setDescription] = useState(task.description);
    const [isCompleted, setIsCompleted] = useState(task.completed);
    const [isLoading, setIsLoading] = useState(true);

    // 2. Fetch the full description (just like TaskDialog does)
    useEffect(() => {
        const controller = new AbortController();
        const fetchDetail = async () => {
            setIsLoading(true);
            try {
                const url = `http://localhost:3000/tasks/${task.id}/detail`;
                const detailDesc = await fetch(url, { signal: controller.signal })
                    .then(res => {
                        if (!res.ok) throw new Error("Network response was not ok");
                        return res.json();
                    })
                    .then(data => data.description);

                setDescription(detailDesc);
            } catch (error: any) {
                if (error.name === 'AbortError') return;
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

    const handleCreateCopy = () => {
        // Pass the edited data back up to Content.tsx
        onCopy(title, description, isCompleted, task.listId);
        onClose();
    };

    return (
        <dialog className="popup-detail bg-white dark:bg-slate-800 text-black dark:text-white" ref={dialogRef}>
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

                <div data-color-mode={theme === 'dark' ? 'dark' : 'light'}>
                    <MDEditor
                        value={isLoading ? "Loading original description..." : description}
                        onChange={(val) => setDescription(val || '')}
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
                        <button type="button" onClick={onClose} style={{ padding: "8px 16px" }}>
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
