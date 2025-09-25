import {createRoot, Root} from "react-dom/client";
import {Editor} from "./Editor";

let root: Root;

export function setupDialogueEditor() {
    root = createRoot(document.getElementById("dialogueEditorRoot"));
    root.render(<Editor />)
}

export function closeDialogueEditor() {
    root.unmount();
}