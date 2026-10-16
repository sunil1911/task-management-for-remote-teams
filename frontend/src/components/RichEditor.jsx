import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

function RichEditor({ value, onChange, readOnly }) {
    const editor = useEditor({
        extensions: [StarterKit],
        content: value || "<p></p>",
        editable: !readOnly,
        onUpdate: ({ editor: ed }) => onChange?.(ed.getHTML()),
    });

    useEffect(() => {
        if (!editor) return;
        const current = editor.getHTML();
        if (value && value !== current) {
            editor.commands.setContent(value, false);
        }
    }, [value, editor]);

    if (!editor) return null;

    return (
        <div className="editor">
            {!readOnly && (
                <div className="editor-bar">
                    <button type="button" onClick={() => editor.chain().focus().toggleBold().run()}>
                        B
                    </button>
                    <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()}>
                        I
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                    >
                        List
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    >
                        H2
                    </button>
                </div>
            )}
            <EditorContent editor={editor} />
        </div>
    );
}

export default RichEditor;
