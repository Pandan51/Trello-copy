import { useState, useEffect, useRef } from "react";

type TaskList = {
    id: string;
    title: string;
}
type Props = {
    list: TaskList;
    onSave: (id: string, title: string) => void;
    onClose: () => void;
}

export default function TaskDialog({ list, onClose, onSave }: Props) {
    // We need a ref to access the native HTML dialog element's methods
    const dialogRef = useRef<HTMLDialogElement>(null);

    // Local state for the editable fields, pre-filled with the current task's data
    const [title, setTitle] = useState(list.title);


    useEffect(() => {
        // When this component mounts, natively show it as a modal (which adds the backdrop!)
        const dialog = dialogRef.current;
        if (dialog && !dialog.open) {
            dialog.showModal();
        }

        // Handle the native behavior where the user presses the 'Escape' key
        const handleCancel = (e: Event) => {
            e.preventDefault();
            onClose();
        };
        dialog?.addEventListener('cancel', handleCancel);
        return () => dialog?.removeEventListener('cancel', handleCancel);
    }, [onClose]);

    const handleSave = () => {
        onSave(list.id, title);
        onClose(); // Unmount the dialog
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

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                    <button type="button" onClick={onClose} style={{ padding: '8px 16px' }}>Cancel</button>
                    <button type="button" onClick={handleSave} style={{ padding: '8px 16px', backgroundColor: '#9339C6', color: 'white', border: 'none', borderRadius: '4px' }}>Save</button>
                </div>
            </div>
        </dialog>
    );
}