/// <reference path="./types.d.ts" />

import {Main} from "./main/main";
import "./main/string_prototype"

import "./design.css"
import "./archipelago/tracker/TrackerMain"

declare const __HEAD_COMMIT: string;
declare const __VERSIONSTRING: string;

$(document).ready(function(){
    Main.setUrlData(window.location.search);
    Main.documentIsReady();
});

document.getElementById("version").innerText = __VERSIONSTRING;
const permalinkEl = document.getElementById("versionPermalink") as HTMLAnchorElement;
permalinkEl.href = `/${__HEAD_COMMIT}`