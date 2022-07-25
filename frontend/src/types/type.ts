import React from "react";

export type CallbackFunction = () => void;
export type MouseEventFunction = (event:React.MouseEvent) => void;

export interface Option {
    text: string;
    value?: string;
}

export interface TableHeader {
    text: string;
    width: string;
}

export interface CSVHeader {
    label: string;
    key: string;
}

export interface ISearchBox {
    text: string;
    id: string;
    condition?: string;
}

export interface IAlert {
    show: boolean;
    header?: string;
    bold?: string;
    text?: string;
    callback?: CallbackFunction;
}

export interface INaturalDate {
    naturalDate : string;
}


