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

            const res = await ApiUtil.post("/search/lot-status-two", params);    
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
        let operation:string = "";
        let operationNum:number = -1;
        let counter:number = 0;
        let qty1:number =0;
        let qty2:number =0;
        const operationCol:OperationCol[] = [];

        searchData.map((element)=>{
            //토탈 웨이퍼수량 구하기 
            if(typeof  element.qtyOne === "number"){
                qty1 += element.qtyOne;
            }
            //토탈 넷다이수량 구하기 
            if(typeof  element.qtyTwo === "number"){
                qty2 += element.qtyTwo;
            }

            /*
             * 공정별로 Total 수량을 수집하기 위한 로직
             * true : 새로운 공정
             * false : 같은공정에 colCount, Qty1(웨이퍼수량), Qty2(넷다이수량) ++. 
             * 변수명을 rowCount라고 하면 낫지 않았을까?
             */
            if(element.operation !== operation &&
                element.operation !== null &&
                element.operation !== undefined){
                operation = element.operation;
                operationNum++;
                return operationCol.push({
                    colCount : 1,
                    colName : typeof element.operation=== "string" ? element.operation : "",
                    colQty1 : typeof element.qtyOne === "number" ? element.qtyOne : 0,
                    colQty2 : typeof element.qtyTwo === "number" ? element.qtyTwo : 0
                });
            }else{
                operationCol[operationNum].colCount++;
                if(typeof element.qtyOne === "number" ){
                    operationCol[operationNum].colQty1 += element.qtyOne;
                }
                if(typeof element.qtyTwo === "number" ){
                    operationCol[operationNum].colQty2 += element.qtyTwo;
                }
                return null;
            }
        });
        console.log(operationCol);
        operationNum = 0;

        //SearchData에 Total Qty Row 삽입
        for(let i=0; i<operationCol.length;i++){
            searchData.splice(counter,0,
                {
                    operation : operationCol[operationNum].colName,
                    qtyOne : operationCol[operationNum].colQty1,
                    qtyTwo : operationCol[operationNum].colQty2,
                    colSpan : operationCol[operationNum].colCount,
                    isOperation : true,
                    lotNumber : "total"
                }
                );
                counter += operationCol[operationNum].colCount + 1 ;               
                operationNum++;
            
            //조회된 전체 수량정보 Row 삽입을 위한 코드로 보여짐 
            if(i === operationCol.length-1){
                searchData.splice(0,0,{
                    operation : "전체공정",
                    qtyOne : qty1,
                    qtyTwo : qty2,
                    lotNumber : "total",
                    colSpan : 0,
                    isOperation : true,
                })
                break;
            }
        }        
     startTransition(()=>{
            setTableBodies((
                <tbody key={"bodies"}>
                {searchData.map((element,index) => (
                    <React.Fragment key={"body"+index}>
                        <tr>
                            {element.isOperation && (
                                <td
                                    style={{
                                        // @ts-ignore
                                        gridRow : `span ${element.colSpan+1}`
                                    }}
                                    className="td-operation"
                                >
                                    <span>{element.operation}</span>
                                </td>
                            )}
                            {element.isOperation? <td className="td-operation"><span>{element.lotNumber}</span></td>: <td><span>{element.lotNumber}</span></td>}
                            {element.isOperation? <td className="td-operation"><span>{element.mainLot}</span></td> : <td><span>{element.mainLot}</span></td>}
                            {element.isOperation?(<td style={{textAlign : "right"}} className="td-operation"><span>{element.qtyOne}</span></td>): (<td style={{textAlign : "right"}}><span>{element.qtyOne}</span></td>) }
                            {element.isOperation? <td className="td-operation"><span>{element.qtyUnitOne}</span></td> : <td><span>{element.qtyUnitOne}</span></td>}
                            {element.isOperation? (<td style={{textAlign : "right"}} className="td-operation"><span>{element.qtyTwo}</span></td>):(<td style={{textAlign : "right"}}><span>{element.qtyTwo}</span></td>)}
                            <td><span>{element.qtyUnitTwo}</span></td>
                            <td><span>{element.device}</span></td>
                            <td><span>{element.customer}</span></td>
                            <td><span>{element.inHold}</span></td>
                            <td><span>{element.inRework}</span></td>
                            <td><span>{element.holdNote}</span></td>
                            <td><span>{element.processFlag}</span></td>
                            <td><span>{element.deviceVer}</span></td>
                            <td><span>{element.deviceAttribute}</span></td>
                            <td><span>{element.shipAttribute}</span></td>
                            <td><span>{element.route}</span></td>
                            <td><span>{
                                typeof element.enterOperTime === "string" &&
                                getMonthToMinute(getDate(element.enterOperTime))
                            }</span></td>
                            <td><span>{element.equipmentId}</span></td>
                        </tr>
                    </React.Fragment>
                ))}
                </tbody>
            ));
        })
    },[searchData])


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