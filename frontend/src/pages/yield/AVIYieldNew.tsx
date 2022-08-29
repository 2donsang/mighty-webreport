import React, { startTransition, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SearchSelector from '../../components/form/SearchSelector';
import TableForm from '../../components/form/TableForm';
import { RootState } from '../../modules';
import { CSVHeader, ISearchBox, TableHeader } from '../../types/type';
import { IAVIYield, IDevice, ILotNumber, ILotStatus, IOperation, TurnCol } from '../../types/userData';
import ApiUtil from '../../utils/ApiUtil';
import { getDate, getDateString, getMonthToMinute } from '../../utils/dateUtil';
import {showAlertModal} from "../../modules/action/alertAction";
import * as S from './style.AVIYieldNew';
import { count } from 'console';
import color from '../../styles/color';


interface DateCol {
    rowCount: number;
    TransTime: string;   
    dateYield:number;
    dateTestDie:number;
    dateGoodDie:number;
    dateFailDie:number;
}
interface DeviceCol{
    rowCount: number;
    TransTime: string;   
    deviceName: string;
    deviceYield: number;
    deviceTestDie: number;
    deviceGoodDie: number;
    deviceFailDie: number;   
}
interface LotNumberCol{
    rowCount: number;
    TransTime: string;   
    deviceName: string;   
    lotNumber: string;
    lotNumberYield: number,
    lotNumberTestDie: number,
    lotNumberGoodDie: number,
    lotNumberFailDie: number,
}



const AVIYield = () => {

    const langState = useSelector((state:RootState) => state.langReducer);

    const tableHeaders:TableHeader[] =[
        {text: langState.isKor? "일자" : "Date", width:"130px"},
        {text: langState.isKor? "제품" : "Device", width:"250px"},
        {text: langState.isKor? "로트" : "LOT" , width:"130px"},
        {text: langState.isKor? "차수" : "Test Number", width:"60px"},
        {text: langState.isKor? "수율" : "Yield", width:"100px"},
        {text: langState.isKor? "검사 DIE" :"TEST DIE", width:"100px"},
        {text: langState.isKor? "GOOD DIE" : "GOOD DIE", width:"100px"},
        {text: langState.isKor? "FAIL DIE": "FAIL DIE",width:"100px"},
    ];
    
    const CSVHeaders:CSVHeader[] =[
        {label: langState.isKor? "일자" : "Date",key:"transTime"},
        {label: langState.isKor? "제품" : "Device",key:"device"},
        {label: langState.isKor? "로트" : "LOT",key:"lotNumber"},
        {label: langState.isKor? "차수" : "Test Number",key:"turn"},
        {label: langState.isKor? "수율" : "Yield",key:"passRate"},
        {label: langState.isKor? "검사DIE" : "TEST DIE",key:"qtyTestDie"},
        {label: langState.isKor? "GOOD DIE" : "GOOD DIE",key:"qtyGoodDie"},
        {label: langState.isKor? "FAIL DIE" : "FAIL DIE",key:"qtyFailDie"},
    ]

    // 제품, LOT 번호, 공정, LOT Status
    const [isLookDown,setIsLookDown] = useState(false);
    const [devices, setDevices] = useState<ISearchBox[]>([]);
    const [checkedDevices, setCheckedDevices] = useState<ISearchBox[]>([]);
    const [lotNumbers, setLotnumbers] = useState<ISearchBox[]>([]);
    const [checkedLotNumbers, setCheckedLotNumbers] = useState<ISearchBox[]>([]);
    const [operations, setOperations] = useState<ISearchBox[]>([]);
    const [checkedOperations, setCheckedOperations] = useState<ISearchBox[]>([]);   

    const [tableBodies, setTableBodies] = useState<JSX.Element>((<tbody></tbody>));
    const [searchData, setSearchData] = useState<IAVIYield[]>([]);
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

                const res = await ApiUtil.post("/search/avi-yield-report-new",params);
                if(res.data.aviYieldReport.length ==0){
                    if(langState.isKor)
                    {
                        dispatch(showAlertModal("확인메세지", "데이터", "가 없습니다."));
                    } else {
                        dispatch(showAlertModal("Information", "Data", " does not exist."));
                    }
                }
                searchData.splice(0,searchData.length);
                setSearchData(res.data.aviYieldReport);
        }
        callAPI();
    }

    useEffect(() =>{
        async function callAPI(){
            const res = await ApiUtil.get("/condition/deviceAndLotNumberAndOperation", {params:{menuName:"AVIYield"}});

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

    useEffect(()=>{
        let totalTestDie:number = 0;
        let totalGoodDie:number = 0;
        let totalFailDie:number = 0;

        let transTime:string = "";
        let device:string = "";
        let lotNumber:string ="";
        let turn:string = "";
        let counter:number = 0;       
        const dateCol:DateCol[] = [];
        const deviceCol:DeviceCol[] = [];
        const lotNumberCol:LotNumberCol[] = [];
        const turnCol:TurnCol[] = [];
   
                //Turn Total
         //1. Turn 이 같은 애들끼리 분류하고 rowsCount 찾기
         searchData.map((element,index)=>{
            if(index === 0){
                //@ts-ignore
                lotNumber = element.lotNumber; //1.lotNumber 상관없이 처음의 turn 부터 수집하기위해
            }
            
            if(element.lotNumber == lotNumber){ //2. 첫행의 처음 lotNumber부터 수집 시작
                if(element.turn != turn &&
                    element.turn != null &&
                    element.turn != undefined){ //2-1. 동일 lotNumber 내에서 turn이 바뀐경우 turnCol push
                        turn = element.turn;
                        turnCol.push({
                            rowCount: 1,
                            //@ts-ignore
                            TransTime : element.transTime,
                            //@ts-ignore
                            deviceName : element.device,
                            lotNumber : element.lotNumber,
                            turn : element.turn,
                            turnYield : element.passRate != undefined && typeof element.passRate === "number"? element.passRate : 0,
                            turnTestDie : element.qtyTestDie != undefined && typeof element.qtyTestDie === "number"? element.qtyTestDie : 0,
                            turnGoodDie : element.qtyGoodDie != undefined && typeof element.qtyGoodDie === "number"? element.qtyGoodDie : 0,
                            turnFailDie : element.qtyFailDie != undefined && typeof element.qtyFailDie === "number"? element.qtyFailDie : 0,
                        })
                    }else { // 2-2. 이전행의 turn과 동일한경우 rowCount 증가
                        turnCol[turnCol.length-1].rowCount++;
                        turnCol[turnCol.length-1].turnYield   += element.passRate != undefined && typeof element.passRate === "number"? element.passRate : 0;
                        turnCol[turnCol.length-1].turnTestDie += element.qtyTestDie != undefined && typeof element.qtyTestDie === "number"? element.qtyTestDie : 0;
                        turnCol[turnCol.length-1].turnGoodDie += element.qtyGoodDie != undefined && typeof element.qtyGoodDie === "number"? element.qtyGoodDie : 0;
                        turnCol[turnCol.length-1].turnFailDie += element.qtyFailDie != undefined && typeof element.qtyFailDie === "number"? element.qtyFailDie : 0;
                    }

            }else{ //3. LotNumber가 달라지면 turn동일 유무와 상관없이 새로 push
                //@ts-ignore
                lotNumber = element.lotNumber; //현재 새로 수집한 turn의 lotNumber 세팅
                //@ts-ignore
                turn = element.turn;
                turnCol.push({
                    rowCount: 1,
                    //@ts-ignore
                    TransTime : element.transTime,
                    //@ts-ignore
                    deviceName : element.device,
                     //@ts-ignore
                    lotNumber : element.lotNumber,
                    //@ts-ignore
                    turn : element.turn,

                  turnYield : element.passRate != undefined && typeof element.passRate === "number"? element.passRate : 0,
                  turnTestDie : element.qtyTestDie != undefined && typeof element.qtyTestDie === "number"? element.qtyTestDie : 0,
                  turnGoodDie : element.qtyGoodDie != undefined && typeof element.qtyGoodDie === "number"? element.qtyGoodDie : 0,
                  turnFailDie : element.qtyFailDie != undefined && typeof element.qtyFailDie === "number"? element.qtyFailDie : 0,
                })
            }
        })
       
        //2.  분류한 turnquf total Row 삽입
        for(let i =0; i<turnCol.length;i++){
            let tempProbeYield:number = turnCol[i].turnGoodDie/turnCol[i].turnTestDie;
            searchData.splice(counter,0,{
            transTime : turnCol[i].TransTime,
            device : turnCol[i].deviceName,
            lotNumber : turnCol[i].lotNumber,
            turn : turnCol[i].turn + "*",
            colSpanFour : turnCol[i].rowCount,
            isTurn : true,
            cellColor : '#EEB8B8',
            passRate : +(tempProbeYield * 100).toFixed(2),
            qtyTestDie : (turnCol[i].turnTestDie).toString(),
            qtyGoodDie : (turnCol[i].turnGoodDie).toString(),
            qtyFailDie : (turnCol[i].turnFailDie).toString(),
            })
            counter += turnCol[i].rowCount +1;
        }

        console.log(searchData);
        //주의사항 : searchData에 total Row를 삽입하기 위하여 위와 같은 for문을 돌려 삽입을 하였다.
        //하지만 위의 콘솔.로그를 보면 이미 넣지도 않았는데 이후의 total row들이 search데이터에 다 들어가있다.
        //그리고 map이 먼저 다 읽히고 for문이 읽히는 것 같다. 이유는 위에서 for문으로 이미 turn에 대한 total row를 삽입했는데도 
        //밑에 삽입한 로우의 값이 아무런 영향을 주지 않는다(ex 삽입한 total row가 yield, testdie, gooddie 등등의 합계에 영향이 없다.)
        //추측하건데 useEffect안에서는 map이 모두 다 읽히고 다음에 for문이 다 읽히는거 같다. 기입한 순서가 아니라.


        counter = 0;
        transTime = "";
        device = "";
        lotNumber = "";

        //LotNumber Total
         //1. LotNumber 이 같은 애들끼리 분류하고 rowsCount 찾기
        searchData.map((element,index)=>{
            if(index === 0){
                //@ts-ignore
                device = element.device; //1.device 상관없이 처음의 lotNumber 부터 수집하기위해
            }
            
            if(element.device == device){ //2. 첫행의 처음 lotNumber부터 수집 시작
                if(element.lotNumber != lotNumber &&
                    element.lotNumber != null &&
                    element.lotNumber != undefined){ //2-1. 동일 Device 내에서 lotNumber종류가 바뀐경우 lotNumberCol push
                        lotNumber = element.lotNumber;
                        lotNumberCol.push({
                            rowCount: 1,
                            //@ts-ignore
                            TransTime : element.transTime,
                            //@ts-ignore
                            deviceName : element.device,
                            lotNumber : element.lotNumber,
                            lotNumberYield : element.passRate != undefined && typeof element.passRate === "number"? element.passRate : 0,
                            lotNumberTestDie : element.qtyTestDie != undefined && typeof element.qtyTestDie === "number"? element.qtyTestDie : 0,
                            lotNumberGoodDie : element.qtyGoodDie != undefined && typeof element.qtyGoodDie === "number"? element.qtyGoodDie : 0,
                            lotNumberFailDie : element.qtyFailDie != undefined && typeof element.qtyFailDie === "number"? element.qtyFailDie : 0,
                        })
                    }else { // 2-2. 이전행의 lotNumber와 동일한경우 rowCount 증가
                        lotNumberCol[lotNumberCol.length-1].rowCount++;
                        lotNumberCol[lotNumberCol.length-1].lotNumberYield   += element.passRate != undefined && typeof element.passRate === "number"? element.passRate : 0;
                        lotNumberCol[lotNumberCol.length-1].lotNumberTestDie += element.qtyTestDie != undefined && typeof element.qtyTestDie === "number"? element.qtyTestDie : 0;
                        lotNumberCol[lotNumberCol.length-1].lotNumberGoodDie += element.qtyGoodDie != undefined && typeof element.qtyGoodDie === "number"? element.qtyGoodDie : 0;
                        lotNumberCol[lotNumberCol.length-1].lotNumberFailDie += element.qtyFailDie != undefined && typeof element.qtyFailDie === "number"? element.qtyFailDie : 0;
                    }

            }else{ //3. Device가 달라지면 lotnumber동일 유무와 상관없이 새로 push
                //@ts-ignore
                device = element.device; //현재 새로 수집한 lotNumber의 Device 세팅
                //@ts-ignore
                lotNumber = element.lotNumber;
                lotNumberCol.push({
                    rowCount: 1,
                    //@ts-ignore
                    TransTime : element.transTime,
                    //@ts-ignore
                    deviceName : element.device,
                     //@ts-ignore
                    lotNumber : element.lotNumber,
                    lotNumberYield : element.passRate != undefined && typeof element.passRate === "number"? element.passRate : 0,
                    lotNumberTestDie : element.qtyTestDie != undefined && typeof element.qtyTestDie === "number"? element.qtyTestDie : 0,
                    lotNumberGoodDie : element.qtyGoodDie != undefined && typeof element.qtyGoodDie === "number"? element.qtyGoodDie : 0,
                    lotNumberFailDie : element.qtyFailDie != undefined && typeof element.qtyFailDie === "number"? element.qtyFailDie : 0,

                })
            }
        })

      
        //2.  분류한 Row 삽입
        for(let i =0; i<lotNumberCol.length;i++){
            let tempProbeYield:number = lotNumberCol[i].lotNumberGoodDie/lotNumberCol[i].lotNumberTestDie;
            searchData.splice(counter,0,{
                transTime : lotNumberCol[i].TransTime,
                device : lotNumberCol[i].deviceName,
                lotNumber : lotNumberCol[i].lotNumber + "*",
                colSpanThree : lotNumberCol[i].rowCount,
                isLotNumber : true,
                cellColor : '#B4FBFF',
                passRate : +(tempProbeYield * 100).toFixed(2),
                qtyTestDie : (lotNumberCol[i].lotNumberTestDie).toString(),
                qtyGoodDie : (lotNumberCol[i].lotNumberGoodDie).toString(),
                qtyFailDie : (lotNumberCol[i].lotNumberFailDie).toString(),
            })
            counter += lotNumberCol[i].rowCount +1;
        }

        counter = 0;
        transTime = "";
        device = "";
        
        //DEVICE Total
        //1. DEVICE 이 같은 애들끼리 분류하고 rowsCount 찾기
        searchData.map((element,index)=>{
            if(index === 0){
                //@ts-ignore
                transTime = element.transTime; //1. TransTime 상관없이 처음 device부터 갯수를 분류하기위해 세팅
            }

            if(element.transTime == transTime){ //2. 첫행의 처음 device부터 수집 시작
                if(element.device != device &&
                    element.device != null &&
                    element.device != undefined){ //2-1. 동일 TransTime 내에서 Devie종류가 바뀐경우 deviceCol push
                        device = element.device;
                        console.log("1");
                        deviceCol.push({
                            rowCount: 1,
                            //@ts-ignore
                            TransTime : element.transTime,
                            deviceName : element.device,
                            deviceYield : element.passRate != undefined && typeof element.passRate === "number"? element.passRate : 0,
                            deviceTestDie : element.qtyTestDie != undefined && typeof element.qtyTestDie === "number"? element.qtyTestDie : 0,
                            deviceGoodDie : element.qtyGoodDie != undefined && typeof element.qtyGoodDie === "number"? element.qtyGoodDie : 0,
                            deviceFailDie : element.qtyFailDie != undefined && typeof element.qtyFailDie === "number"? element.qtyFailDie : 0,
                        })
                    }else { 
                        deviceCol[deviceCol.length-1].rowCount++;// 2-2. 이전행의 Device와 동일한경우 rowCount 증가
                        deviceCol[deviceCol.length-1].deviceYield += element.passRate != undefined && typeof element.passRate === "number"? element.passRate : 0;
                        deviceCol[deviceCol.length-1].deviceTestDie += element.qtyTestDie != undefined && typeof element.qtyTestDie === "number"? element.qtyTestDie : 0;
                        deviceCol[deviceCol.length-1].deviceGoodDie += element.qtyGoodDie != undefined && typeof element.qtyGoodDie === "number"? element.qtyGoodDie : 0;
                        deviceCol[deviceCol.length-1].deviceFailDie += element.qtyFailDie != undefined && typeof element.qtyFailDie === "number"? element.qtyFailDie : 0;
                    }

            }else{ //3. TransTime이 달라지면 Device동일 유무와 상관없이 새로 push
                //@ts-ignore
                transTime = element.transTime; //현재 새로 수집한 Device의 TransTime 세팅
                //@ts-ignore
                device = element.device;
                deviceCol.push({
                    rowCount: 1,
                    //@ts-ignore
                    TransTime : element.transTime,
                    //@ts-ignore
                    deviceName : element.device,
                    deviceYield : element.passRate != undefined && typeof element.passRate === "number"? element.passRate : 0,
                    deviceTestDie : element.qtyTestDie != undefined && typeof element.qtyTestDie === "number"? element.qtyTestDie : 0,
                    deviceGoodDie : element.qtyGoodDie != undefined && typeof element.qtyGoodDie === "number"? element.qtyGoodDie : 0,
                    deviceFailDie : element.qtyFailDie != undefined && typeof element.qtyFailDie === "number"? element.qtyFailDie : 0,
                })

            }
        })

        //2.  분류한 Row 삽입
        for(let i =0; i<deviceCol.length;i++){
            let tempProbeYield:number = deviceCol[i].deviceGoodDie/deviceCol[i].deviceTestDie;
            searchData.splice(counter,0,{
                transTime : deviceCol[i].TransTime,
                device : deviceCol[i].deviceName + "*",
                colSpanTwo : deviceCol[i].rowCount,
                isDevice : true,
                cellColor : '#9DE4FF',
                passRate : +(tempProbeYield * 100).toFixed(2),
                qtyTestDie : (deviceCol[i].deviceTestDie).toString(),
                qtyGoodDie : (deviceCol[i].deviceGoodDie).toString(),
                qtyFailDie : (deviceCol[i].deviceFailDie).toString(),
            })
            counter += deviceCol[i].rowCount +1;
        }
        
        //TRANSTIME Total
        counter = 0;
        transTime = "";
        //1. TransTime 이 같은 애들끼리 분류하고 rowsCount 찾기
        searchData.map((element)=>{
            if(element.qtyTestDie != undefined && typeof element.qtyTestDie === "number"){
                totalTestDie += element.qtyTestDie;
            }
            if(element.qtyGoodDie !=undefined && typeof element.qtyGoodDie === "number"){
                totalGoodDie += element.qtyGoodDie;
            }
            if(element.qtyFailDie != undefined && typeof element.qtyFailDie === "number"){
                totalFailDie += element.qtyFailDie;
            }

            if(element.transTime != transTime &&
                element.transTime !=null && 
                element.transTime != undefined){
                transTime = element.transTime;
                dateCol.push({
                    rowCount : 1,
                    TransTime : element.transTime,
                    dateYield : element.passRate != undefined && typeof element.passRate === "number"? element.passRate : 0,
                    dateTestDie : element.qtyTestDie != undefined && typeof element.qtyTestDie === "number"? element.qtyTestDie : 0,
                    dateGoodDie : element.qtyGoodDie != undefined && typeof element.qtyGoodDie === "number"? element.qtyGoodDie : 0,
                    dateFailDie : element.qtyFailDie != undefined && typeof element.qtyFailDie === "number"? element.qtyFailDie : 0,
                });
            }else{
                dateCol[dateCol.length-1].rowCount++;
                dateCol[dateCol.length-1].dateYield += element.passRate != undefined && typeof element.passRate === "number"? element.passRate : 0;
                dateCol[dateCol.length-1].dateTestDie += element.qtyTestDie != undefined && typeof element.qtyTestDie === "number"? element.qtyTestDie : 0;
                dateCol[dateCol.length-1].dateGoodDie += element.qtyGoodDie != undefined && typeof element.qtyGoodDie === "number"? element.qtyGoodDie : 0;
                dateCol[dateCol.length-1].dateFailDie += element.qtyFailDie != undefined && typeof element.qtyFailDie === "number"? element.qtyFailDie : 0;
            }
        })

        //2.  분류한 Row 삽입
        for(let i = 0; i<dateCol.length; i++){
            let tempProbeYield:number = dateCol[i].dateGoodDie/dateCol[i].dateTestDie;
            searchData.splice(counter,0,{
                transTime : dateCol[i].TransTime + "*",
                colSpan : dateCol[i].rowCount,
                isTranstime : true,
                isDevice : false,
                cellColor : '#BECDFF',
                passRate : +(tempProbeYield* 100).toFixed(2),
                qtyTestDie : (dateCol[i].dateTestDie).toString(),
                qtyGoodDie : (dateCol[i].dateGoodDie).toString(),
                qtyFailDie : (dateCol[i].dateFailDie).toString(),
            })
            // searchData[counter +1].isTranstime = true;
            // searchData[counter +1].colSpan = dateCol[i].rowCount;
            counter += dateCol[i].rowCount +1;

            if(i === dateCol.length -1){
                searchData.splice(0,0,{
                    transTime : "Total",
                    passRate : +(totalGoodDie/totalTestDie * 100).toFixed(2),
                    qtyTestDie : totalTestDie.toString(),
                    qtyGoodDie : totalGoodDie.toString(),
                    qtyFailDie : totalFailDie.toString(),
                    isTotal : true,
                    //isTranstime : true,
                    cellColor : '#BDFFC7',
                })
                break;
            }
        }

        //1000자리 구분자 넣기
        searchData.map((element) =>{
            element.qtyFailDie = element.qtyFailDie !=undefined? addCommaToString(+element.qtyFailDie):undefined;
            element.qtyGoodDie = element.qtyGoodDie !=undefined? (+element.qtyGoodDie).toLocaleString():undefined;
            element.qtyTestDie = element.qtyTestDie !=undefined? Intl.NumberFormat('en-US').format(+element.qtyTestDie):undefined;
        })

        
        startTransition(()=>{
            setTableBodies((
                <tbody key={"bodies"}>
                {searchData.map((element,index) => (
                    <React.Fragment key={"body"+index}>
                        <tr>
                            {element.isTotal ? element.cellColor == undefined ? <td><span>{element.transTime}</span></td> : <td style={{ backgroundColor: element.cellColor, fontWeight: 'bold' }}><span>{element.transTime}</span></td>
                                    :
                                        element.isTranstime ? (
                                            element.cellColor == undefined ?
                                                <td><span>{element.transTime}</span></td>
                                                :
                                                <td  style={{
                                                // @ts-ignore
                                                    //gridRow: `span ${element.colSpan}`, backgroundColor: element.cellColor
                                                    backgroundColor: element.cellColor, fontWeight: 'bold'  
                                                }}
                                                ><span>{element.transTime}</span></td>
                                        ) : <td><span>{element.transTime}</span></td>}
                            {element.isTotal ? element.cellColor == undefined ? <td><span>{element.device}</span></td> : <td style={{ backgroundColor: element.cellColor, fontWeight: 'bold' }}><span>{element.device}</span></td>
                                :
                                element.isTranstime ? element.cellColor == undefined ? <td><span>{element.device}</span></td> : <td style={{ backgroundColor: element.cellColor, fontWeight: 'bold' }}> <span>{element.device}</span></td>
                                    :
                                    element.isDevice ? (
                                        <td
                                            style={{
                                                //@ts-ignore
                                                backgroundColor: element.cellColor, fontWeight: 'bold'
                                            }}
                                        >
                                            <span>{element.device}</span>
                                        </td>
                                    ): <td><span>{element.device}</span></td>}
                            {element.isTotal ? element.cellColor == undefined ? <td><span>{element.lotNumber}</span></td> : <td style={{ backgroundColor: element.cellColor, fontWeight: 'bold' }}><span>{element.lotNumber}</span></td>
                                :
                                element.isTranstime ? element.cellColor == undefined ? <td><span>{element.lotNumber}</span></td> : <td style={{ backgroundColor: element.cellColor, fontWeight: 'bold' }}> <span>{element.lotNumber}</span></td>
                                    :
                                    element.isDevice ? element.cellColor == undefined ? <td><span>{element.lotNumber}</span></td> : <td style={{ backgroundColor: element.cellColor, fontWeight: 'bold' }}><span>{element.lotNumber}</span></td>
                                        :
                                        element.isLotNumber ? (<td
                                            style={{
                                                //@ts-ignore
                                                backgroundColor: element.cellColor, fontWeight: 'bold'
                                            }}
                                        >
                                            <span>{element.lotNumber}</span>
                                        </td> )
                                        : <td><span>{element.lotNumber}</span></td> }
                            {element.cellColor == undefined? <td><span>{element.turn}</span></td> : <td style={{backgroundColor:element.cellColor, fontWeight: 'bold'}}><span>{element.turn}</span></td>}
                            {element.cellColor == undefined? <td><span>{element.passRate}</span></td> : <td style={{backgroundColor:element.cellColor, fontWeight: 'bold'}}><span>{element.passRate}</span></td>}
                            {element.cellColor == undefined? <td><span>{element.qtyTestDie}</span></td> : <td style={{backgroundColor:element.cellColor, fontWeight: 'bold'}}><span>{element.qtyTestDie}</span></td>}
                            {element.cellColor == undefined? <td><span>{element.qtyGoodDie}</span></td> : <td style={{backgroundColor:element.cellColor, fontWeight: 'bold'}}><span>{element.qtyGoodDie}</span></td>}
                            {element.cellColor == undefined? <td><span>{element.qtyFailDie}</span></td> : <td style={{backgroundColor:element.cellColor, fontWeight: 'bold'}}><span>{element.qtyFailDie}</span></td>}
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
                    name="AVIYieldReport"
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


