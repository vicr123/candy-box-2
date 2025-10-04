import Styles from "./Guide.module.css"
import {AsciiArt} from "../../../react/AsciiArt";

import ExportImage from "./images/export.png"
import ItemImage from "./images/item.png"
import EditingAreaImage from "./images/editing-area.png"
import {EditableOccurrences} from "./EditorMain";

export function Guide() {
    return <div className={Styles.guide}>
        <AsciiArt name={"dialogue-editor/Title"} />
        <p>
            Welcome to the Dialogue Editor! Here, you can contribute to the dialogue that is shown in some places
            in Candy Box 2.
        </p>
        <p className={`${Styles.admonition} ${Styles.warning}`}>
            <b>Important - Please read!</b>
            <br />
            If you just want to start writing, please make sure you read the Style Guide at the very least. It contains
            information about expectations and requirements that submitted text is expected to uphold. You can always
            return to this guide by choosing the Guide option at the top in the sidebar.
        </p>
        <p>
            This guide is broken up into three parts:
            <ul>
                <li><b>The Style Guide</b> outlines the requirements for the text that you submit</li>
                <li><b>The Dialogue Editor</b> contains information about how to use the Dialogue Editor.</li>
                <li><b>Submitting Dialogue</b> contains instructions on what to do once you have finished.</li>
            </ul>
        </p>

        <hr />
        <AsciiArt name={"dialogue-editor/StyleGuide"} />
        <p>
            The required style for the text boils down to a few simple points:
            <ul>
                <li>
                    <b>Keep it G rated.</b> Candy Box 2 is a game that is designed for everyone to play,
                    no matter their age.
                    <ul>
                        <li>
                            Avoid profanity. "Fuck" and "Shit" are examples of unacceptable language.
                        </li>
                        <li>
                            Avoid references to drugs and sex.
                        </li>
                        <li>
                            Exception: Games that are inherently for mature-age players have some leniency.
                        </li>
                        <li>
                            Exception: Item names can be written verbatim.
                        </li>
                    </ul>
                </li>
                <li>
                    <b>Spelling and grammar are important.</b> Double check your text to ensure that you have spelled
                    everything correctly, and ensure that the sentences make sense.
                </li>
                <li>
                    <b>Test your text.</b> Pay attention to the preview as you are writing your dialogue.
                    Avoid obscuring any elements of the background art - this includes buttons that are
                    calculated based on the length of the text.
                </li>
                <li>
                    <b>Inside jokes</b> which any player of the game is expected to understand are permissible - and recommended!
                </li>
                <li>
                    <b>Follow the guidance.</b> Some occurrences of text will have guidance points, which you need to follow
                    to ensure the correctness of the dialogue.
                </li>
                <li>
                    <b>Don't deceive the player.</b> For example:
                    <ul>
                        <li>Don't write dialogue implying that a different item will be sent.</li>
                        <li>Exception: Traps designed to trick the player into sending them (for example, "Time Plece"
                            in A Hat in Time) are exempt from this rule.</li>
                    </ul>
                </li>
                <li>
                    <b>Use common sense.</b>
                </li>
            </ul>
        </p>
        <p>
            Additionally, some recommendations which are not strictly necessary, but you should consider following:
            <ul>
                <li><b>Maintain the tone of the character.</b> Not every character in Candy Box 2 speaks with
                    the same tone and mannerisms. For best results, consider the role of the character and the
                    text style.
                </li>
            </ul>
        </p>
        <p>
            In the event of a violation of the style guide, you may be contacted to provide an alternative string, or
            the submitted dialogue may be edited to conform to the style guide.
        </p>

        <hr />
        <AsciiArt name={"dialogue-editor/TheDialogueEditor"} />
        <p>
            Dialogue for a game can be defined for each item, and each <i>occurrence</i>. Each different scenario
            where dialogue text for an item can appear is called an occurrence. The available occurrences are
            <ul>
                {Object.values(EditableOccurrences).map(x => <li>{x.name}</li>)}
            </ul>
        </p>
        <p>The dialogue editor is split into two panes: the sidebar and the editing area.</p>

        <b>The Sidebar</b>
        <p>
            The Sidebar contains a list of all the items available in the selected world. Select an item from the
            Sidebar to activate it and start editing it in the editing area.
        </p>
        <img src={ItemImage} alt={"Item in the sidebar"} style={{width: "300px"}} />
        <p>
            Each item contains a row of circles beneath it. This describes which occurrences for that item have
            completed dialogue text. A filled circle indicates that customised dialogue exists, while an
            open circle indicates that no customised dialogue exists, and the standard fallback text
            will be used instead.
        </p>

        <b>The Editing Area</b>
        <p>
            The Editing Area shows information about the item you have selected, and allows you to edit its dialogue.
        </p>
        <img src={EditingAreaImage} alt={"The Editing Area"} style={{width: "100%"}} />
        <p>
            At the top of the editing area is a pane that allows you to change the occurence that you are editing,
            and information about the dialogue that you are editing.
        </p>
        <p>
            Start by selecting an occurrence, and then enter the dialogue text for the item. Once you are satisfied
            with the dialogue text, check the preview and ensure that the text renders correctly.
        </p>
        <p>
            Placeholders are available to substitute in specific strings of text. The following placeholders are
            available:
            <ul>
                <li><b>{"{{player}}"}</b> will be replaced with the name of the player the item is being sent to.</li>
                <li><b>{"{{item}}"}</b> will be replaced with the name of the item that is being sent.</li>
                <li><b>{"{{game}}"}</b> will be replaced with the name of the game that the item is being sent to.</li>
                <li><b>{"{{count}}"}</b> will be replaced with the cost to send the item. This placeholder is only available in some occurrences.</li>
            </ul>
            To use a placeholder, enter its name, surrounded by two braces. It will disappear from the
            "Remaining Placeholders" list, and an example will be reflected in the preview. You are not required
            to use every placeholder.
        </p>
        <p>
            While you are editing dialogue, you can use some keyboard shortcuts to make editing faster:
            <ul>
                <li><KeyboardShortcut shortcut={"CTRL+ENTER"} /> Go to the next dialogue in sequence</li>
                <li><KeyboardShortcut shortcut={"CTRL+SHIFT+ENTER"} /> Go to the previous dialogue in sequence</li>
                <li><KeyboardShortcut shortcut={"ALT+LEFT"} /> Go to the previous occurrence</li>
                <li><KeyboardShortcut shortcut={"ALT+RIGHT"} /> Go to the next occurrence</li>
                <li><KeyboardShortcut shortcut={"ALT+UP"} /> Go to the previous item</li>
                <li><KeyboardShortcut shortcut={"ALT+DOWN"} /> Go to the next item</li>
            </ul>
        </p>

        <hr />
        <AsciiArt name={"dialogue-editor/SubmittingDialogue"} />
        <p>
            Once you're ready to submit your dialogue,
            <ol>
                <li>Click <b>Export</b> in the header. A file will be downloaded to your computer. <img src={ExportImage} alt={"Export button"} /></li>
                <li>
                    Ping @vicr123 in the Candy Box 2 thread in the Archipelago Discord server, and upload the downloaded file.
                </li>
            </ol>
        </p>
        <p>
            Once your dialogue is submitted, you may be contacted for follow-up questions if required.
        </p>
        <p>
            Thank you for your contributions!
        </p>
    </div>
}

function KeyboardShortcut({shortcut}: {shortcut: string}) {
    if (navigator.platform.includes("Mac")) {
        return <b>{
            shortcut
                .replaceAll("CTRL", "⌘")
                .replaceAll("ALT", "⌥")
                .replaceAll("SHIFT", "⇧")
                .replaceAll("UP", "↑")
                .replaceAll("DOWN", "↓")
                .replaceAll("LEFT", "←")
                .replaceAll("RIGHT", "→")
                .replaceAll("ENTER", "⏎")
                .replaceAll("+", "")
        }</b>
    }

    return <b>{shortcut}</b>
}