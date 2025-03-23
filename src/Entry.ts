/// <reference path="./types.d.ts" />

import {Main} from "./main/main";
import "./main/string_prototype"

import "./gen/genAscii"

import "./design.css"
import {i18n} from "./i18n";

declare const __VERSION: string;
declare const __VERSIONSTRING: string;

$(document).ready(function(){
    Main.setUrlData(window.location.search);
    Main.documentIsReady();
});

document.getElementById("version").innerText = __VERSIONSTRING;
const permalinkEl = document.getElementById("versionPermalink") as HTMLAnchorElement;
permalinkEl.href = `/${__VERSION}`