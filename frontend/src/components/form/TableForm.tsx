import * as S from './style.TableForm';
import Table from "../common/Table";
import {CSVHeader, TableHeader} from "../../types/type";
import DatePickerForm from "./DatePickerForm";
import React, {SetStateAction, useEffect, useMemo, useRef, useState} from "react";
import Icon from "../common/Icon";
import { CSVLink } from "react-csv";
import {ILotStatus} from "../../types/userData";
import color from "../../styles/color";
import {getTodayString} from "../../utils/dateUtil";
import {
    Item,
    Menu,
    Separator,
    useContextMenu
} from "react-contexify";
import "react-contexify/dist/ReactContexify.css";

interface IProps {
    name : string;
    tableHeaders : TableHeader[];
    tableBodies : JSX.Element;
    CSVHeaders : CSVHeader[];
    CSVData : ILotStatus[];
    isLookDown : boolean;
    setIsLookDown : React.Dispatch<SetStateAction<boolean>>;
    isDatePicker? : boolean;
    isDateRange? : boolean;
    startDate? : Date;
    endDate? : Date;
    setStartDate? : React.Dispatch<SetStateAction<Date>>;
    setEndDate? : React.Dispatch<SetStateAction<Date>>;
}



const TableForm = ({
    name,
    tableHeaders,
    tableBodies,
    CSVHeaders,
    CSVData,
    isLookDown,
    setIsLookDown,
    isDatePicker=false,
    isDateRange=false,
    startDate,
    endDate,
    setStartDate,
    setEndDate
}:IProps) => {
    const MENU_ID = "table-context-menu";
    const tableref = useRef(null);

    useEffect(() =>{

    },[])

    const tableBodiesMemo = useMemo(()=>{
        return tableBodies;
    },[tableBodies]);

    const [isViewAll,setIsViewAll] = useState(false);
    const {show} = useContextMenu({
        id : MENU_ID
    });

    const onViewAll = () => {
        setIsViewAll((prev) => !prev);
    }

    const xlsx = require( "xlsx" );

    //Excel 확장자 .xlsx 형식 다운로드로 수정 2022.08.17 by 2donsang 
    const ExcelDownload = () =>{

        //@ts-ignore
         tableref.current.exportExcel();
    }

    return (
        <S.Container
            isViewAll={isViewAll}
        >
            <div className='result-header'>
                {isDatePicker &&
                    <DatePickerForm
                        startDate={startDate}
                        endDate={endDate}
                        setStartDate={setStartDate}
                        setEndDate={setEndDate}
                        isRangeSearch={isDateRange}
                    />
                }
                <div
                    className="btn-container"
                >
                    {/* <CSVLink
                        data={CSVData}
                        headers={CSVHeaders}
                        filename={`${name}${getTodayString()}`}
                        className='excel-btn'
                    >
                        <Icon icon="excel" size={24} color={color.green} />
                    </CSVLink> */}
                    <button onClick={()=>ExcelDownload()}  className='excel-btn'>
                        <Icon icon="excel" size={24} color={color.green} />
                    </button>
                    <button
                        className="search-btn"
                    >
                        <Icon icon="search" size={24} />
                    </button>
                    <Icon
                        icon={isLookDown ? "doubleUp" : "doubleDown"}
                        size={30}
                        onClick={()=>setIsLookDown((prev) => !prev)}
                        className="look-down"
                    />
                    <Icon
                        icon={isViewAll ? "minimize" : "expand"}
                        size={26}
                        onClick={onViewAll}
                        className="expand-btn"
                    />
                </div>
            </div>
            <div
                className='result-main'
                onContextMenu={
                    (event)=> show(event)
                }
            >
                <Table
                    tableRef = {tableref}
                    name = {name}
                    headers={tableHeaders}
                    bodies={tableBodiesMemo}
                    isViewAll={isViewAll}
                    isLookDown={isLookDown}
                />
            </div>
            <Menu id={MENU_ID}>
                {isViewAll
                    ?
                    (<Item
                        onClick={()=>setIsViewAll(false)}
                    >
                        축소하기
                    </Item>)
                    :
                    (<Item
                        onClick={()=>setIsViewAll(true)}
                    >
                        전체보기
                    </Item>)
                }

                <Item>
                    {/* <CSVLink
                        data={CSVData}
                        headers={CSVHeaders}
                        filename={`${name}${getTodayString()}`}
                        className='excel-btn'
                    >
                        <span>액셀 다운로드</span>
                    </CSVLink> */}
                     <button onClick={()=>ExcelDownload()} className='excel-btn'>
                        <span>엑셀 다운로드</span>
                    </button>
                </Item>
                <Separator />
            </Menu>
        </S.Container>
    );
}

export default TableForm;
