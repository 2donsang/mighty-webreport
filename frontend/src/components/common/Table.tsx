import * as S from './style.Table';
import { TableHeader } from "../../types/type";
import React, {Dispatch, forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from "react";
import {getTodayString} from "../../utils/dateUtil";
import { saveAs } from 'file-saver';

interface IProps {
    headers : TableHeader[];
    bodies : JSX.Element;
    isViewAll : boolean;
    isLookDown : boolean;
    name : string;
    tableRef : any;
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

const Table = ({ headers , bodies ,isViewAll , isLookDown, name, tableRef }:IProps) => {

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


    //xls 용 장점 : 텍스트 스타일, 컬럼컬러도 똑같이 적용된다. 그런데 한글이 깨진다 사용 X
    function exceller() {
        var uri = 'data:application/vnd.ms-excel;base64,',
          template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>',
          base64 = function(s:any) {
            return window.btoa(unescape(encodeURIComponent(s)))
          },
          format = function(s:any, c:any) {
            return s.replace(/{(\w+)}/g, function(m:any, p:any) {
              return c[p];
            })
          }
        var toExcel = 
        //@ts-ignore
        document.getElementById("toExcel").innerHTML;
        var ctx = {
          worksheet: 'test' || '',
          table: toExcel
        };
        var link = document.createElement("a");
        link.download = "export.xls";
        link.href = uri + base64(format(template, ctx))
        link.click();
      }

      useImperativeHandle(tableRef,() =>({
        exportExcel 
      }))

    const xlsx = require( "xlsx" );
    function exportExcel(){
        let wb = xlsx.utils.book_new();
        let ws = xlsx.utils.table_to_sheet(tableElement.current);
        xlsx.utils.book_append_sheet(wb, ws, `${name}`);
        let wbout =  xlsx.write(wb, {bookType:'xlsx', type:'binary'})
        saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), `${name}${getTodayString()}.xlsx`)
    }

    function s2ab(s:any) { 
        let buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
        let view = new Uint8Array(buf);  //create uint8array as viewer
        for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
        return buf;    
      }

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
