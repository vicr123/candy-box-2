/// <reference path="./types.d.ts" />

import {Main} from "./main/main";
import "./main/string_prototype"

import "./design.css"

declare const __VERSION: string;
declare const __VERSIONSTRING: string;

$(document).ready(function(){
    Main.setUrlData(window.location.search);
    Main.documentIsReady();
});

document.getElementById("version").innerText = __VERSIONSTRING;
const permalinkEl = document.getElementById("versionPermalink") as HTMLAnchorElement;
permalinkEl.href = `/${__VERSION}`