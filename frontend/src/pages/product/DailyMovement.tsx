import { setUncaughtExceptionCaptureCallback } from 'process';
import React, { Profiler, ProfilerOnRenderCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import SearchSelector from '../../components/form/SearchSelector';
import TableForm from '../../components/form/TableForm';
import { RootState } from '../../modules';
import { showAlertModal } from '../../modules/action/alertAction';
import { CSVHeader, ISearchBox, TableHeader } from '../../types/type';
import { ICustomer, IDevice, ILotNumber, IOperation } from '../../types/userData';

import ApiUtil from '../../utils/ApiUtil';
import { getDateString } from '../../utils/dateUtil';
import * as S from './style.DailyMovement';

const tableHeaders:TableHeader[] =[
    {text:"공정", width:"100px"},
    {text:"공정명", width:"200px"},
    {text:"제품", width:"250px"},
    {text:"고객사", width:"150px"},
    {text:"기초제공", width:"60px"},
    {text:"기말제공", width:"60px"},
    {text:"작업수량",width:"60px"},
    {text:"양품수량",width:"60px"},
    {text:"불량",width:"60px"},
    {text:"기타입고",width:"60px"},
    {text:"기타출고",width:"60px"},
    {text:"수율",width:"60px"},
    {text:"TAT(Day)",width:"60px"},
];

const CSVHeaders:CSVHeader[] = [

    {label:"공정",      key:"operation"},
    {label:"공정명",    key:"operationStep"},
    {label:"제품",      key:"deviceDesc"},
    {label:"고객사",    key:"customerDesc"},
    {label:"기초제공",  key:"boh"},
    {label:"기말제공",  key:"eoh"},
    {label:"작업수량",  key:"procIn"},
    {label:"양품수량",  key:"procOut"},
    {label:"불량",      key:"loss"},
    {label:"기타입고",  key:"bonus"},
    {label:"기타출고",  key:"cv"},
    {label:"수율",      key:"yield"},
    {label:"TAT(Day)",  key:"sumTat"},

];

interface IMovementStatus {
    operation : string;
    operationStep : string;
    deviceDesc : string;
    customerDesc : string;
    boh : string;
    eoh : string;
    procIn : string;
    procOut : string;
    loss : string;
    bonus : string;
    cv : string;
    yield : string;
    sumTat : string;
}


const DailyMovement = () =>{

        const langState = useSelector((state:RootState) => state.langReducer);
        const [operations,setOperations] = useState<ISearchBox[]>([]);
        const [checkedOperations, setCheckedOperations] = useState<ISearchBox[]>([]);
        const [devices,setDevices] = useState<ISearchBox[]>([]);
        const [checkedDevices, setCheckedDevices] = useState<ISearchBox[]>([]);
        // const [lotNumbers,setLotNumbers] = useState<ISearchBox[]>([]);
        const[customers,setCustomers] = useState<ISearchBox[]>([]);
        // const [checkedLotNumbers, setCheckedLotNumbers] = useState<ISearchBox[]>([]);
        const[checkedCustomers, setCheckedCustomers] = useState<ISearchBox[]>([]);

        const [isTable, setIsTable] = useState(true);
        const [isLookDown, setIsLookDown] = useState(false);
        const [tableBodies, setTableBodies] = useState<JSX.Element>((<tbody></tbody>));
        const [searchData, setSearchData] = useState<IMovementStatus[]>([]);
        const [startDate, setStartDate] = useState(new Date());
        const [endDate, setEndDate] = useState(new Date());
        const dispatch = useDispatch();


        
const onSubmit  = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    async function CallAPI(){
        const params:object ={
            dates : {
                startDate : getDateString(startDate),
                endDate : getDateString(endDate)
            },
            operations : checkedOperations,
            devices: checkedDevices,
            customers: checkedCustomers
        }
        const res  = await ApiUtil.post("/search/movement-status",params);
        console.log(res);
        if(res.data.movementStatus.length === 0 ){
            dispatch(showAlertModal("확인 메세지","데이터","가 없습니다."));
        }
        setSearchData(res.data.movementStatus);
    }

    CallAPI();
}


useEffect(() => {
    async function CallAPI() {
        const res = await ApiUtil.get("/condition/customerAndOperationAndDevice",)
        console.log(res.data);
        res.data.operations.map((operation:IOperation) =>{
            return operations.push({
                id: operation.operation,
                text : operation.description
            })
        })
        setOperations(operations);
        
        res.data.devices.map((device:IDevice) =>{
            return devices.push({
                id: device.deviceId,
                text : device.description       
            })
        })
        setDevices(devices);
        
        res.data.customers.map((customer:ICustomer) =>{
            return customers.push({
                id:customer.customer,
                text : customer.customerName
            })
        })
        setCustomers(customers);
    }
    CallAPI();
},[operations,devices,customers])

useEffect(() =>{
        setTableBodies((
            <tbody key={"bodies"}>
             {searchData.map((element,index)=>(
                    <React.Fragment key={"bodies"+index}>
                        <tr>
                            <td><span>{element.operation}</span></td>
                            <td><span>{element.operationStep}</span></td>
                            <td><span>{element.deviceDesc}</span></td>
                            <td><span>{element.customerDesc}</span></td>
                            <td><span>{element.boh}</span></td>
                            <td><span>{element.eoh}</span></td>
                            <td><span>{element.procIn}</span></td>
                            <td><span>{element.procOut}</span></td>
                            <td><span>{element.loss}</span></td>
                            <td><span>{element.bonus}</span></td>
                            <td><span>{element.cv}</span></td>
                            <td><span>{element.yield}</span></td>
                            <td><span>{element.sumTat}</span></td>
                        </tr>
                    </React.Fragment>

             ))}
            </tbody>
        ))
    },[searchData])


    return(

        <S.Container 
        isLookDown={isLookDown}
        >
            <form onSubmit={onSubmit}>
                <div className='condition-container'>
                    <SearchSelector
                    title={langState.isKor? "공정": "Operation"}
                    list = {operations}
                    selected ={checkedOperations}
                    selector = {setCheckedOperations}
                    />
                     <SearchSelector
                        title={langState.isKor ? "고객사" : "Customer"}
                        list={customers}
                        selected={checkedCustomers}
                        selector={setCheckedCustomers}
                    />
                    <SearchSelector
                    title={langState.isKor? "제품" : "Device"}
                    list ={devices}
                    selected ={checkedDevices}
                    selector ={setCheckedDevices}
                    />
                </div>
                {isTable && (<TableForm
                    name = "MovementStatus"
                    tableHeaders={tableHeaders}
                    tableBodies ={tableBodies}
                    CSVHeaders = {CSVHeaders}
                    CSVData = {searchData}
                    isLookDown ={isLookDown}
                    setIsLookDown ={setIsLookDown}
                    isDateRange = {true}
                    isDatePicker = {true}
                    startDate ={startDate}
                    endDate ={endDate}
                    setStartDate ={setStartDate}
                    setEndDate = {setEndDate}
                />)}
              
            </form>
        </S.Container>
    )
}
export default DailyMovement;

