import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SearchSelector from '../../components/form/SearchSelector';
import TableForm from '../../components/form/TableForm';
import { RootState } from '../../modules';
import { CSVHeader, ISearchBox, TableHeader } from '../../types/type';
import { IDevice, ILotNumber, ILotStatus, IOperation } from '../../types/userData';
import ApiUtil from '../../utils/ApiUtil';
import { getDateString } from '../../utils/dateUtil';
import * as S from './style.AVIYield';


interface OperationCol {
    colCount: number;
    colName: string;
    colQty1: number;
    colQty2: number;
}

const tableHeaders:TableHeader[] =[
    {text:"공정", width:"160px"},
    {text:"LOT", width:"130px"},
    {text:"MAIN LOT", width:"130px"},
    {text:"WFS수량", width:"70px"},
    {text:"단위", width:"45px"},
    {text:"PCS수량", width:"70px"},
    {text:"단위", width:"44px"},
    {text:"제품", width:"100px"},
    {text:"고객사", width:"100px"},
    {text:"잠금", width:"50px"},
    {text:"재작업", width:"48px"},
    {text:"HOLD 메모", width:"80px"},
    {text:"상태", width:"40px"},
    {text:"제품 버전", width:"100px"},
    {text:"제품 특성", width:"100px"},
    {text:"출하 특성", width:"100px"},
    {text:"라우트", width:"150px"},
    {text:"입고시간", width:"130px"},
    {text:"장비", width:"100px"},
];

const CSVHeaders:CSVHeader[] =[
    {label:"공정",key:"operation"},
    {label:"LOT",key:"lotNumber"},
    {label:"MAIN LOT",key:"mainLot"},
    {label:"WFS수량",key:"qtyOne"},
    {label:"단위",key:"qtyUnitOne"},
    {label:"PCS수량",key:"qtyTwo"},
    {label:"단위",key:"qtyUnitTwo"},
    {label:"제품",key:"device"},
    {label:"고객사",key:"customer"},
    {label:"잠금",key:"inHold"},
    {label:"재작업",key:"inReWork"},
    {label:"HOLD 메모",key:"holdNote"},
    {label:"상태",key:"processFlag"},
    {label:"제품 버전",key:"deviceVer"},
    {label:"제품 특성",key:"deviceAttribute"},
    {label:"출하 특성",key:"shipAttribute"},
    {label:"라우트",key:"route"},
    {label:"입고시간",key:"enterOperTime"},
    {label:"장비",key:"equipmentId"},

]

const AVIYield = () => {

    const langState = useSelector((state:RootState) => state.langReducer);
    // 제품, LOT 번호, 공정, LOT Status
    const [isLookDown,setIsLookDown] = useState(false);
    const [devices, setDevices] = useState<ISearchBox[]>([]);
    const [checkedDevices, setCheckedDevices] = useState<ISearchBox[]>([]);
    const [lotNumbers, setLotnumbers] = useState<ISearchBox[]>([]);
    const [checkedLotNumbers, setCheckedLotNumbers] = useState<ISearchBox[]>([]);
    const [operations, setOperations] = useState<ISearchBox[]>([]);
    const [checkedOperations, setCheckedOperations] = useState<ISearchBox[]>([]);   

    const [tableBodies, setTableBodies] = useState<JSX.Element>((<tbody></tbody>));
    const [searchData, setSearchData] = useState<ILotStatus[]>([]);
    const [startDate, setStartDate] = useState(new Date("2000-01-01"));
    const [endDate, setEndDate] = useState(new Date());
    const dispatch = useDispatch();



    const onSubmit = (event : React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        async function callAPI(){
                const params:object ={
                    dates : {
                        startDate : getDateString(startDate),
                        endDate : getDateString(endDate)
                    },
                    devices : checkedDevices,
                    lotNumbers : checkedLotNumbers,
                    operations : checkedOperations,
                }

                const res = await ApiUtil.post("/search/avi-yield-report",params);
                if(res.data.aviYieldReport.length ==0){
                    dispatch(showAlertModel("확인메세지","데이터","가 없습니다."));
                }
                setSearchData(res.data.aviYieldReport);
        }
        callAPI();
    }

    useEffect(() =>{
        async function callAPI(){
            const res = await ApiUtil.get("/condition/deviceAndLotNumberAndOperation",);

            devices.splice(0, devices.length);
            res.data.devices.map((device:IDevice)=>{
                return devices.push({
                    id : device.deviceId,
                    text : device.description,
                })
            })
            setDevices(devices);

            lotNumbers.splice(0, lotNumbers.length);
            res.data.lotNumbers.map((lotNumber:ILotNumber) =>{
                return lotNumbers.push({
                    id : lotNumber.id,
                    text : lotNumber.id
                })
            })
            setLotnumbers(lotNumbers);

            operations.splice(0,operations.length);
            res.data.operations.map((operation:IOperation) =>{
                return operations.push({
                    id : operation.operation,
                    text : operation.description
                })
            })
            setOperations(operations);

        }
        callAPI();
    },[operations,devices,lotNumbers]) 



    return (
        <S.Container isLookDown={isLookDown} >
            <form onSubmit={onSubmit}>
                <div className='condition_container'>
                    <SearchSelector
                        title={langState.isKor ? "제품" : "Device"}
                        list={devices}
                        selected={checkedDevices}
                        selector={setCheckedDevices}
                    />
                    {/* 제품, LOT 번호, 공정, LOT Status */}
                    <SearchSelector
                        title={langState.isKor ? "LOT번호" : "LOT Numbers"}
                        list={lotNumbers}
                        selected={checkedLotNumbers}
                        selector={setCheckedLotNumbers}
                    />
                    <SearchSelector
                        title={langState.isKor ? "공정" : "Operation"}
                        list={operations}
                        selected={checkedOperations}
                        selector={setCheckedOperations}
                    />
                </div>
                <TableForm
                    name="LotStatus"
                    tableHeaders={tableHeaders}
                    tableBodies={tableBodies}
                    CSVHeaders={CSVHeaders}
                    CSVData={searchData}
                    isLookDown={isLookDown}
                    setIsLookDown={setIsLookDown}
                    isDateRange={true}
                    isDatePicker={true}
                    startDate={startDate}
                    endDate={endDate}
                    setStartDate={setStartDate}
                    setEndDate={setEndDate}
                />
            </form>
        </S.Container>
    )
}

export default AVIYield;
function showAlertModel(arg0: string, arg1: string, arg2: string): any {
    throw new Error('Function not implemented.');
}

