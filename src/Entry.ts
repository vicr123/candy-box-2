/// <reference path="./types.d.ts" />

import {Main} from "./main/main";
import "./main/string_prototype"

import "./gen/genText"
import "./gen/genAscii"

$(document).ready(function(){
    Main.setUrlData(window.location.search);
    Main.documentIsReady();
});