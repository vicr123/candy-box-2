/// <reference path="./types.d.ts" />

import {Main} from "./main/main";
import "./main/string_prototype"

import "./gen/genAscii"

import "./design.css"

declare const __VERSION: string;

$(document).ready(function(){
    Main.setUrlData(window.location.search);
    Main.documentIsReady();
});

document.getElementById("version").innerText = __VERSION;