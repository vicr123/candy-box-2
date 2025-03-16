import {RenderLink} from "./RenderLink";
import {CallbackCollection} from "./CallbackCollection";

export class RenderLinkSimpleInputOnEnter extends RenderLink {
    private element: string;
    private callbackCollection: CallbackCollection;
    private defaultValue: string;
    private hasFocus: boolean;

    // Constructor
    constructor(element: string, callbackCollection: CallbackCollection, defaultValue: string, hasFocus: boolean) {
        super();
        this.element = element;
        this.callbackCollection = callbackCollection;
        this.defaultValue = defaultValue;
        this.hasFocus = hasFocus;
    }

    // Public methods
    public run(): void {
        // We copy the render link so we can use it in the functions below
        var renderLink: RenderLinkSimpleInputOnEnter = this;

        // If the default value isn't null
        if (this.defaultValue != null) {
            // We set the default value
            $(this.element).val(this.defaultValue);
        }

        // We set the keypress event
        $(this.element).keypress(function (event) {
            if (event.which == 13) {
                // We fire the callback collection
                renderLink.callbackCollection.fire();

                return false; // Avoid event bubbling
            }
        });

        if (this.hasFocus) $(this.element).focus();
    }
}