import * as S from './style.LotStatusNew';
import React, { startTransition, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import SearchSelector from '../../components/form/SearchSelector';
import TableForm from '../../components/form/TableForm';
import { RootState } from '../../modules';
import { showAlertModal } from '../../modules/action/alertAction';
import { ISearchBox, TableHeader, CSVHeader } from '../../types/type';
import { IDevice, ILotNumber, ILotStatus, IOperation } from '../../types/userData';
import ApiUtil from '../../utils/ApiUtil';
import { getDate, getDateString, getMonthToMinute } from '../../utils/dateUtil';


interface OperationCol {
    colCount: number;
    colName: string;
    colQty1: number;
    colQty2: number;
}

const tableHeaders:TableHeader[] =[
    {text:"제품", width:"230px"},
    {text:"LOT", width:"130px"},
    {text:"공정", width:"150px"},
    {text:"현재공정순서", width:"80px"},
    {text:"라우트내공정수", width:"80px"},
    {text:"공정투입일자", width:"130px"},
    {text:"WFS수량", width:"70px"},
    {text:"PCS수량", width:"100px"},    
    {text:"고객사", width:"80px"},
    {text:"상태", width:"40px"},
    {text:"작업시작일자", width:"130px"},
    {text:"작업완료일자", width:"130px"},
];

const CSVHeaders:CSVHeader[] =[

    {label:"제품",key:"device"},
    {label:"LOT",key:"lotNumber"},
    {label:"공정",key:"operation"},
    {label:"현재공정순서",key:"operationCount"},
    {label:"라우트내공정수",key:"routeCount"},
    {label:"공정투입일자",key:"enterOperTime"},
    {label:"WFS수량",key:"qtyOne"},
    {label:"PCS수량",key:"qtyTwo"},
    {label:"고객사",key:"customer"},
    {label:"상태",key:"processFlag"},
    {label:"작업시작일자",key:"startDate"},
    {label:"작업완료일자",key:"endDate"},

]


const LotStatusTest = () =>{



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
                dispatch(showAlertModal("확인메세지","데이터","가 없습니다."));
            }
            console.log(res.data.lotStatus);
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
        }
       
        callAPI();
    },[devices, operations, lotNumbers])

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
                            <td><span>{element.enterOperTime}</span></td>
                            <td style={{textAlign : "right"}}><span>{element.qtyOne}</span></td>
                            <td style={{textAlign : "right"}}><span>{element.qtyTwo}</span></td>
                            <td><span>{element.customer}</span></td>
                            <td><span>{element.processFlag}</span></td>
                            <td><span>{element.startDate}</span></td>
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
                <SearchSelector
                    title = {langState.isKor? "제품" : "Device"}
                    list = {devices}
                    selected ={checkedDevices}
                    selector = {setCheckedDevices}
                />
                 {/* 제품, LOT 번호, 공정, LOT Status */}
                <SearchSelector
                 title = {langState.isKor? "LOT번호" : "LOT Numbers"}
                 list = {lotNumbers}
                 selected ={checkedLotNumbers}
                 selector = {setCheckedLotNumbers}
                />
                <SearchSelector
                   title = {langState.isKor? "공정" : "Operation"}
                   list = {operations}
                   selected ={checkedOperations}
                   selector = {setCheckedOperations}
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