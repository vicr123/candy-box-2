import Styles from "./Guide.module.css"
import {AsciiArt} from "../../../react/AsciiArt";

import ExportImage from "./images/export.png"

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
                            Exception: Item names that contain profanity can be written verbatim.
                        </li>
                    </ul>
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
                    <b>Don't trick the player.</b> For example:
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
        <p>Help for using the dialogue editor is coming soon.</p>

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