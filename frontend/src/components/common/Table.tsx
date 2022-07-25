import * as S from './style.Table';
import { TableHeader } from "../../types/type";
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";

interface IProps {
    headers : TableHeader[];
    bodies : JSX.Element;
    isViewAll : boolean;
    isLookDown : boolean;
}

interface Headers {
    text : string;
    width : string;
    ref: React.MutableRefObject<undefined>;
}

const createHeaders = (headers:TableHeader[]) => {
    return headers.map((item) => ({
        text : item.text,
        width : item.width,
        ref: useRef()
    }))
}

const Table = ({ headers , bodies ,isViewAll , isLookDown }:IProps) => {

    console.log(headers);
    const [tableHeight,setTableHeight] = useState("auto");
    const [activeIndex,setActiveIndex] = useState(-1);
    const tableElement = useRef<HTMLTableElement>(null);
    const columns:Headers[] = createHeaders(headers);
    const minCellWidth:number = 22;

    //debugger
    const bodiesMemo = useMemo(()=> {return bodies}, [bodies]);
    const mouseDown = (index:number) => {
      setActiveIndex(index);
    };

    const mouseMove = useCallback((event:any) => {
            const gridColumns = columns.map((header,index) =>{
                if(index === activeIndex){
                    // @ts-ignore
                    const width = event.clientX - 30 - header.ref.current.offsetLeft;

                    if(width >= minCellWidth){
                         return `minmax(${width}px,1fr)`;
                    }
                }
                // @ts-ignore
                return `minmax(${header.ref.current.offsetWidth}px,1fr)`;
            });
            // @ts-ignore
            tableElement.current.style.gridTemplateColumns = `${gridColumns.join(
                " "
            )}`;
        }
    ,[activeIndex,columns]);

    const removeListeners = useCallback(()=>{
        window.removeEventListener("mousemove",mouseMove);
        window.removeEventListener("mouseup",removeListeners);
    },[mouseMove]);

    const mouseUp = useCallback(()=>{
        setActiveIndex(-1);
        removeListeners();
    },[setActiveIndex,removeListeners]);

    useEffect(()=>{
       // @ts-ignore
        setTableHeight(tableElement.current.offsetHeight);
    },[])

    useEffect(()=>{
        if(activeIndex !== -1){
            window.addEventListener("mousemove",mouseMove);
            window.addEventListener("mouseup",mouseUp);
        }

        return () => {
          removeListeners();
        };
    },[activeIndex, mouseMove, mouseUp, removeListeners]);

    return (
        <S.Container
            headers={headers}
            isViewAll={isViewAll}
            isLookDown={isLookDown}
        >
            <table
                ref={tableElement}
            >
                <thead>
                    <tr>
                        {columns.map((header,index)=>(
                           <th
                               key={"header"+index}
                               // @ts-ignore
                               ref={header.ref}
                           >
                               <span>{header.text}</span>
                               <div
                                   style={{ height: tableHeight }}
                                   onMouseDown={()=>mouseDown(index)}
                                   className={`resize-handle ${activeIndex === index ? "active" : "idle"}`}
                               />
                           </th>
                        ))}
                    </tr>
                </thead>
                {bodiesMemo}
            </table>
        </S.Container>
    );
}

export default Table;
