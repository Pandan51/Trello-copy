import { useRef, useState, useEffect } from 'react';

type Task = {
    id: string;
    title: string;
    description: string;
}

type Props = {
    task: Task;
    onSave: (id: string, title: string, description: string) => void;
    onClose: () => void;
}

export default function TaskDialog({ task, onClose, onSave }: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description); // Fallback to initial prop
    const [isLoading, setIsLoading] = useState(true); // Track loading state

    useEffect(() => {
        let isMounted = true; // Cleanup flag to prevent setting state on unmounted component

        const fetchDetail = async () => {
            setIsLoading(true);
            try {
                const url = `http://localhost:3000/tasks/${task.id}/detail`;
                const detailDesc = await fetch(url, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" }
                })
                    .then(res => {
                        if (!res.ok) throw new Error('Network response was not ok');
                        return res.json();
                    })
                    .then(data => data.description);

                if (isMounted && detailDesc) {
                    setDescription(detailDesc);
                }
            } catch (error) {
                console.error("Failed to fetch task details:", error);
                // If it fails, the description will just remain as task.description
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchDetail();

        return () => {
            isMounted = false; // Cleanup if dialog closes before fetch finishes
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
        dialog?.addEventListener('cancel', handleCancel);

        return () => dialog?.removeEventListener('cancel', handleCancel);
    }, [onClose]);

    const handleSave = () => {
        onSave(task.id, title, description);
        onClose();
    };

    return (
        <dialog
            ref={dialogRef}
            style={{
                padding: '20px',
                borderRadius: '8px',
                border: 'none',
                minWidth: '300px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <h2 style={{ margin: 0 }}>Edit Task</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontWeight: 'bold' }}>Title</label>
                    <input
                        type="text"
                        style={{ padding: '8px', fontSize: '16px' }}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontWeight: 'bold' }}>Description</label>
                    <textarea
                        style={{ padding: '8px', minHeight: '100px', fontSize: '16px', resize: 'vertical' }}
                        value={isLoading ? "Loading description..." : description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={isLoading} // Disable input while loading
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                    <button type="button" onClick={onClose} style={{ padding: '8px 16px' }}>Cancel</button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isLoading} // Prevent saving before data loads
                        style={{
                            padding: '8px 16px',
                            backgroundColor: isLoading ? '#ccc' : '#9339C6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isLoading ? 'not-allowed' : 'pointer'
                        }}>
                        Save
                    </button>
                </div>
            </div>
        </dialog>
    );
}