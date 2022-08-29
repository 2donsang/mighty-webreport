import * as S from './style.LotStatusNew';
import React, { startTransition, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import SearchSelector from '../../components/form/SearchSelector';
import TableForm from '../../components/form/TableForm';
import { RootState } from '../../modules';
import { showAlertModal } from '../../modules/action/alertAction';
import { ISearchBox, TableHeader, CSVHeader, IDropDown } from '../../types/type';
import { IDevice, ILotNumber, ILotStatus, IOperation } from '../../types/userData';
import ApiUtil from '../../utils/ApiUtil';
import { getDate, getDateString, getMonthToMinute } from '../../utils/dateUtil';
import MySelect from '../../components/form/MySelector';
import makeAnimated from "react-select/animated";
import { components } from "react-select";


interface OperationCol {
    colCount: number;
    colName: string;
    colQty1: number;
    colQty2: number;
}


const LotStatusTest = () =>{
    const langState = useSelector((state:RootState) => state.langReducer);

    const tableHeaders:TableHeader[] =[
        {text: langState.isKor? "제품" : "Device", width:"230px"},
        {text: langState.isKor? "로트" : "LOT", width:"130px"},
        {text: langState.isKor? "공정" : "Operation", width:"150px"},
        {text: langState.isKor? "현재공정순서" : "CurrentSeq", width:"80px"},
        {text: langState.isKor? "전체공정수" : "Total Operation Qty", width:"150px"},
        {text: langState.isKor? "웨이퍼수량" : "Wafer Qty", width:"70px"},
        {text: langState.isKor? "PCS수량" : "PCS Qty", width:"100px"},    
        {text: langState.isKor? "고객사" : "Customer", width:"100px"},
        {text: langState.isKor? "상태" : "State", width:"40px"},
        // {text: langState.isKor? "작업시작일자" : "Start Date", width:"100px"},
        {text: langState.isKor? "공정투입일자" : "Operation Input Time", width:"150px"},
        {text: langState.isKor? "작업완료일자" : "End Date", width:"130px"},
    ];

    const CSVHeaders:CSVHeader[] =[

        {label: langState.isKor? "제품" : "Device",key:"device"},
        {label: langState.isKor? "로트" : "LOT",key:"lotNumber"},
        {label: langState.isKor? "공정" : "Operation",key:"operation"},
        {label: langState.isKor? "현재공정순서" : "CurrentSeq",key:"operationCount"},
        {label: langState.isKor? "전체공정수" : "Total Operation Qty",key:"routeCount"},
        {label: langState.isKor? "WFS수량" : "Wafer Qty",key:"qtyOne"},
        {label: langState.isKor? "PCS수량" : "PCS Qty",key:"qtyTwo"},
        {label: langState.isKor? "고객사" : "Customer",key:"customer"},
        {label: langState.isKor? "상태" : "State",key:"processFlag"},
        // {label: langState.isKor? "작업시작일자" : "Start Date",key:"startDate"},
        {label: langState.isKor? "공정투입일자" : "Operation Input Time",key:"enterOperTime"},
        {label: langState.isKor? "작업완료일자" : "End Date",key:"endDate"},
    
    ];

    // 제품, LOT 번호, 공정, LOT Status
    const [isLookDown,setIsLookDown] = useState(false);
    const [devices, setDevices] = useState<ISearchBox[]>([]);
    const [checkedDevices, setCheckedDevices] = useState<ISearchBox[]>([]);
    const [lotNumbers, setLotnumbers] = useState<ISearchBox[]>([]);
    const [checkedLotNumbers, setCheckedLotNumbers] = useState<ISearchBox[]>([]);
    const [operations, setOperations] = useState<ISearchBox[]>([]);
    const [operationsNew, setOperationsNew] = useState<IDropDown[]>([]);
    const [checkedOperations, setCheckedOperations] = useState<ISearchBox[]>([]);   
    const [checkedOperationsNew, setCheckedOperationsNew] = useState<IDropDown[]>([]);   

    const [tableBodies, setTableBodies] = useState<JSX.Element>((<tbody></tbody>));
    const [searchData, setSearchData] = useState<ILotStatus[]>([]);
    const [startDate, setStartDate] = useState(new Date("2000-01-01"));
    const [endDate, setEndDate] = useState(new Date());
    const dispatch = useDispatch();

    const onSubmit =(event : React.FormEvent<HTMLFormElement>) =>{
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

            const res = await ApiUtil.post("/search/lot-status-new", params);    
            if(res.data.lotStatus.length == 0){
                if(langState.isKor)
                {
                    dispatch(showAlertModal("확인메세지","데이터","가 없습니다."));
                }else{
                    dispatch(showAlertModal("Information","Data"," does not exist."));
                }
                
            }
            setSearchData(res.data.lotStatus);
        }
        callAPI();
    }

    useEffect(() =>{
        async function callAPI(){
            const res = await ApiUtil.get("/condition/deviceAndLotNumberAndOperation",);

            devices.splice(0,devices.length);
            res.data.devices.map((device:IDevice) =>{
              return devices.push({
                    id : device.deviceId,
                    text : device.description,
              })  
            })
            setDevices(devices);

            lotNumbers.splice(0,lotNumbers.length);
            res.data.lotNumbers.map((lotNumber:ILotNumber) =>{
                return lotNumbers.push({
                    id : lotNumber.id,
                    text : lotNumber.id,
                })
            })
            setLotnumbers(lotNumbers);

            operations.splice(0,operations.length);
            res.data.operations.map((operation:IOperation)=>{
                return operations.push({
                    id : operation.operation,
                    text : operation.description,
                })
            })
            setOperations(operations);

            operationsNew.splice(0,operationsNew.length);
            res.data.operations.map((operation:IOperation)=>{
                return operationsNew.push({
                    value : operation.operation,
                    label : operation.description,
                })
            })
            setOperationsNew(operationsNew);
        }
       
        callAPI();
    },[devices, lotNumbers ,operations, operationsNew])

    useEffect(() =>{
                
        //1000자리 구분자 넣기
        searchData.map((element)=>{
            element.qtyOne = element.qtyOne !=undefined? addCommaToString(+element.qtyOne) : undefined;
            element.qtyTwo = element.qtyTwo !=undefined? addCommaToString(+element.qtyTwo) : undefined;
        })

     startTransition(()=>{
            setTableBodies((
                <tbody key={"bodies"}>
                {searchData.map((element,index) => (
                    <React.Fragment key={"body"+index}>
                        <tr>
                            <td><span>{element.device}</span></td>
                            <td><span>{element.lotNumber}</span></td>
                            <td><span>{element.operation}</span></td>
                            <td><span>{element.operationCount}</span></td>
                            <td><span>{element.routeCount}</span></td>
                            <td><span>{element.qtyOne}</span></td>
                            <td><span>{element.qtyTwo}</span></td>
                            <td><span>{element.customer}</span></td>
                            <td><span>{element.processFlag}</span></td>
                            {/* <td><span>{element.startDate}</span></td> */}
                            <td><span>{element.enterOperTime}</span></td>
                            <td><span>{element.endDate}</span></td>
                        </tr>
                    </React.Fragment>
                ))}
                </tbody>
            ));
        })
    },[searchData])

    
    function addCommaToString(price:number) {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    return(
        <S.Container isLookDown={isLookDown} >
            <form onSubmit={onSubmit}>
                <div className='condition_container'>
                    {/* <MySelect   
                        title={langState.isKor ? "공정" : "Operation"}                     
                        options={operationsNew}
                        //@ts-ignore
                        selected={checkedOperationsNew}
                        setSelected ={setCheckedOperationsNew}
                      
                    /> */}
                    <SearchSelector
                        title={langState.isKor ? "제품" : "Device"}
                        list={devices}
                        selected={checkedDevices}
                        selector={setCheckedDevices}
                    />
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
                    name ="LotStatus"
                    tableHeaders ={tableHeaders}
                    tableBodies = {tableBodies}
                    CSVHeaders = {CSVHeaders}
                    CSVData = {searchData}
                    isLookDown ={isLookDown}
                    setIsLookDown={setIsLookDown}
                    isDateRange={true}
                    isDatePicker={true}
                    startDate ={startDate}
                    endDate = {endDate}
                    setStartDate ={setStartDate}
                    setEndDate = {setEndDate}
                />
            </form>
        </S.Container>
    )
}

export default LotStatusTest