import * as S from './style.TotalYield';
import SearchSelector from "../../components/form/SearchSelector";
import TableForm from "../../components/form/TableForm";
import React, {ChangeEvent, startTransition, useEffect, useState} from "react";
import {CSVHeader, ISearchBox, TableHeader} from "../../types/type";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../modules";
import ApiUtil from '../../utils/ApiUtil';
import { DateCol, DeviceCol, IDevice, ILotNumber, IOperation, IPTESTYield, ITotalYield, LotNumberCol, TotalCol } from '../../types/userData';
import { getDate, getDateString, getMonthToMinute } from '../../utils/dateUtil';
import { showAlertModal } from '../../modules/action/alertAction';


const TotalYield = () => {
    const langState = useSelector((state:RootState) => state.langReducer);

    const tableHeaders:TableHeader[] = [   
        {text: langState.isKor? "제품"         :"Device"     , width: "450px"},
        {text: langState.isKor? "로트"         :"LOT"     , width: "120px"},
        {text: langState.isKor? "차수"         :"Test Number"     , width: "100px"},
        {text: langState.isKor? "WaferNo"      :"WaferNo"     , width: "130px"},
        {text: langState.isKor? "Total(PROBE)" :"Total(PROBE)"     , width: "100px"},
        {text: langState.isKor? "Pass(PROBE)"  :"Pass(PROBE)"     , width: "100px"},
        {text: langState.isKor? "Fail(PROBE)"  :"Fail(PROBE)"     , width: "100px"},
        {text: langState.isKor? "Yield(PROBE)" :"Yield(PROBE)"     , width: "100px"},
        {text: langState.isKor? "Bin2(PROBE)"  :"Bin2(PROBE)"     , width: "100px"},
        {text: langState.isKor? "Bin3(PROBE)"  :"Bin3(PROBE)"     , width: "100px"},
        {text: langState.isKor? "Bin4(PROBE)"  :"Bin4(PROBE)"     , width: "100px"},
        {text: langState.isKor? "Bin5(PROBE)"  :"Bin5(PROBE)"     , width: "100px"},
        {text: langState.isKor? "Bin6(PROBE)"  :"Bin6(PROBE)"     , width: "100px"},
        {text: langState.isKor? "Bin7(PROBE)"  :"Bin7(PROBE)"     , width: "100px"},
        {text: langState.isKor? "Bin8(PROBE)"  :"Bin8(PROBE)"     , width: "100px"},
        {text: langState.isKor? "Total(AVI)"   :"Total(AVI)"     , width: "100px"},
        {text: langState.isKor? "Pass(AVI)"    :"Pass(AVI)"     , width: "100px"},
        {text: langState.isKor? "Yield(AVI)"   :"Yield(AVI)"     , width: "100px"},
        {text: langState.isKor? "Shipping Date":"Shipping Date"     , width: "100px"},
        {text: langState.isKor? "Cum Yield":"Cum Yield"     , width: "100px"},
        
    ];
    
    const CSVHeaders:CSVHeader[] = [
        {label: langState.isKor? "제품" :"Device",                  key: "device"},
        {label: langState.isKor? "로트" : "LOT" ,                   key: "lotNumber"},
        {label: langState.isKor? "차수" : "Test Number" ,           key: "turn"},
        {label: langState.isKor? "WaferNo" :"WaferNo" ,             key: "waferId"},
        {label: langState.isKor? "Total(PROBE)" : "Total(PROBE)" ,  key: "totalProbe"},
        {label: langState.isKor? "Pass(PROBE)"  : "Pass(PROBE)" ,   key: "passProbe"},
        {label: langState.isKor? "Fail(PROBE)"  : "Fail(PROBE)" ,   key: "failProbe"},
        {label: langState.isKor? "Yield(PROBE)" : "Yield(PROBE)" ,  key: "yieldProbe"},
        {label: langState.isKor? "Bin2(PROBE)"  : "Bin2(PROBE)" ,   key: "b2"},
        {label: langState.isKor? "Bin3(PROBE)"  : "Bin3(PROBE)" ,   key: "b3"},
        {label: langState.isKor? "Bin4(PROBE)"  : "Bin4(PROBE)" ,   key: "b4"},
        {label: langState.isKor? "Bin5(PROBE)"  : "Bin5(PROBE)" ,   key: "b5"},
        {label: langState.isKor? "Bin6(PROBE)"  : "Bin6(PROBE)" ,   key: "b6"},
        {label: langState.isKor? "Bin7(PROBE)"  : "Bin7(PROBE)" ,   key: "b7"},
        {label: langState.isKor? "Bin8(PROBE)"  : "Bin8(PROBE)" ,   key: "b8"},
        {label: langState.isKor? "Total(AVI)"   : "Total(AVI)" ,    key: "totalAvi"},
        {label: langState.isKor? "Pass(AVI)"  : "Pass(AVI)" ,       key: "passAvi"},
        {label: langState.isKor? "Yield(AVI)" : "Yield(AVI)",       key: "yieldAvi"},
        {label: langState.isKor? "Shipping Date" : "Shipping Date" ,key: "shipmentDate"},
        {label: langState.isKor? "Cum Yield" : "Cum Yield" ,key: "cumYield"},

    ];

    const [checkedDevices, setCheckedDevices] = useState<ISearchBox[]>([]);
    const [devices, setDevices] = useState<ISearchBox[]>([]);
    const [lotNumbers, setLotnumbers] = useState<ISearchBox[]>([]);
    const [checkedLotNumbers, setCheckedLotNumbers] = useState<ISearchBox[]>([]);
    const [searchData,setSearchData] = useState<ITotalYield[]>([]);
    const [isLookDown,setIsLookDown] = useState(false);
    const [tableBodies, setTableBodies] = useState<JSX.Element>((<tbody></tbody>));
    const [startDate,setStartDate] = useState(new Date("2000-01-01"));
    const [endDate,setEndDate] = useState(new Date());
    const [existBothData, setExistBothData] = useState(false);
    const [baseYield, setBaseYield] = useState("");
    const [originTotalRowCnt, setOriginTotalRowCnt] = useState<number>(0);

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
                    checkBoxOne : existBothData,
                    inputTextOne : baseYield,
                    
                    
                }

                const res = await ApiUtil.post("/search/total-yield-report",params);
                setOriginTotalRowCnt(res.data.totalYieldReport.length);
                if(res.data.totalYieldReport.length ==0){
                    if(langState.isKor)
                    {
                        dispatch(showAlertModal("확인메세지","데이터","가 없습니다."));
                    }else{
                        dispatch(showAlertModal("Information","Data"," does not exist."));
                    }
                }
                searchData.splice(0,searchData.length);
                setSearchData(res.data.totalYieldReport);
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

        }
        callAPI();
    },[devices,lotNumbers]) 

    useEffect(()=>{
        
        let device:string = "";
        let lotNumber:string ="";
        let turn:string ="";
        let counter:number = 0;
        const totalCol:TotalCol[] = [];
        const deviceCol:TotalCol[] = [];
        const lotNumberCol:TotalCol[] = [];
        const turnCol:TotalCol[] = [];


        let totalProbe:number = 0;
        let passProbe:number =0;
        let failProbe:number = 0;
        let totalAvi:number = 0;
        let passAvi:number = 0;

        //Total
        searchData.map((element,index)=>{
            if(element.totalProbe != undefined && typeof element.totalProbe ==='number'){
                totalProbe += element.totalProbe;
            }
            if(element.passProbe != undefined && typeof element.passProbe ==='number'){
                passProbe += element.passProbe;
            }
            if(element.failProbe != undefined && typeof element.failProbe ==='number'){
                failProbe += element.failProbe;
            }
            if(element.totalAvi != undefined && typeof element.totalAvi ==='number'){
                totalAvi += element.totalAvi;
            }
            if(element.passAvi != undefined && typeof element.passAvi ==='number'){
                passAvi += element.passAvi;
            }
          
            if(index == 0){
                totalCol.push({
                    //@ts-ignore
                    rowCount : element.yieldAvi !=undefined? 1 : 0, //yieldAvi total 계산을 위한 카운트
                    //@ts-ignore
                    YieldAvi : element.yieldAvi !=undefined? element.yieldAvi : 0,

                    //@ts-ignore
                    rowCountTwo : element.cumYield !=undefined && element.cumYield !=0? 1 : 0, // yieldCum total 계산을 위한 카운트
                    //@ts-ignore
                    YieldCum : element.cumYield !=undefined? element.cumYield : 0,

                    //@ts-ignore
                    rowCountThree : element.yieldProbe != undefined && element.yieldProbe !=0? 1 : 0, //yieldProbe total 계산을 위한 카운트
                    //@ts-ignore
                    YieldProbe : element.yieldProbe !=undefined? element.yieldProbe : 0,

                    //@ts-ignore
                    deviceName : element.device,
                })
            }else{
                totalCol[totalCol.length-1].rowCount += element.yieldAvi !=undefined? 1 : 0;
                //@ts-ignore
                totalCol[totalCol.length-1].YieldAvi += element.yieldAvi !=undefined? element.yieldAvi : 0;
                //@ts-ignore
                totalCol[totalCol.length-1].rowCountTwo += element.cumYield !=undefined && element.cumYield !=0? 1 : 0;
                //@ts-ignore
                totalCol[totalCol.length-1].YieldCum += element.cumYield !=undefined? element.cumYield : 0;
                //@ts-ignore
                totalCol[totalCol.length-1].rowCountThree += element.yieldProbe !=undefined && element.yieldProbe !=0? 1 : 0;
                //@ts-ignore
                totalCol[totalCol.length-1].YieldProbe += element.yieldProbe != undefined? element.yieldProbe:0;
                
                //@ts-ignore
                totalCol[totalCol.length-1].deviceName  = element.device;
                
            }
        })

           //turn
           searchData.map((element,index)=>{
            if(index === 0){
                console.log("0번째 인덱스"+index);
                //@ts-ignore
                lotNumber = element.lotNumber; //1. Lotnumber 상관없이 처음  turn부터 갯수를 분류하기위해 세팅(lotnumber에 여러 turn이 걸릴수 있어서)
            }
            
            if(element.lotNumber == lotNumber){  //2. 첫행의 처음 turn 부터 수집 시작 lotNumber를 맞춰서 무조건 타게한다.
                if(element.turn != turn &&
                    element.turn != null &&
                    element.turn != undefined){ //2-1. 동일 Device 내에서 lotNumber가 바뀐경우 lotNumberCol push
                        turn = element.turn;
                        turnCol.push({
                            rowCount: 1,
                            //@ts-ignore
                            deviceName : element.device,
                            lotNumber : element.lotNumber,
                            turn : element.turn,
                            waferId : element.waferId,
                            TestDieProbe : element.totalProbe != undefined && typeof element.totalProbe === "number"? element.totalProbe : 0,
                            GoodDieProbe : element.passProbe != undefined && typeof element.passProbe === "number"? element.passProbe : 0,
                            FailDieProbe : element.failProbe != undefined && typeof element.failProbe === "number"? element.failProbe : 0,
                            YieldProbe : element.yieldProbe != undefined && typeof element.yieldProbe === "number"? element.yieldProbe : 0,
                            TestDieAvi : element.totalAvi != undefined && typeof element.totalAvi === "number"? element.totalAvi : 0,
                            GoodDieAvi : element.passAvi != undefined && typeof element.passAvi === "number"? element.passAvi : 0,
                            YieldAvi : element.yieldAvi != undefined && typeof element.yieldAvi === "number"? element.yieldAvi : 0,
                            YieldCum : element.cumYield != undefined && typeof element.cumYield === "number"? element.cumYield : 0,
                        })
                    }else {
                        turnCol[turnCol.length-1].rowCount++;
                        turnCol[turnCol.length-1].TestDieProbe   += element.totalProbe != undefined && typeof element.totalProbe === "number"? element.totalProbe : 0;
                        turnCol[turnCol.length-1].GoodDieProbe += element.passProbe != undefined && typeof element.passProbe === "number"? element.passProbe : 0;
                        turnCol[turnCol.length-1].FailDieProbe += element.failProbe != undefined && typeof element.failProbe === "number"? element.failProbe : 0;
                        turnCol[turnCol.length-1].YieldProbe += element.yieldProbe != undefined && typeof element.yieldProbe === "number"? element.yieldProbe : 0;
                        turnCol[turnCol.length-1].TestDieAvi += element.totalAvi != undefined && typeof element.totalAvi === "number"? element.totalAvi : 0;
                        turnCol[turnCol.length-1].GoodDieAvi += element.passAvi != undefined && typeof element.passAvi === "number"? element.passAvi : 0;
                        turnCol[turnCol.length-1].YieldAvi += element.yieldAvi != undefined && typeof element.yieldAvi === "number"? element.yieldAvi : 0;
                        turnCol[turnCol.length-1].YieldCum += element.cumYield != undefined && typeof element.cumYield === "number"? element.cumYield : 0;
                        
                    }

            }else{ //3. LotNumber가 달라지면 turn 동일 유무와 상관없이 새로 push
                //@ts-ignore
                lotNumber = element.lotNumber; //현재 새로 수집한 turn의 lotnumber 세팅
                //@ts-ignore
                turn = element.turn;
                turnCol.push({
                    rowCount: 1,
                    //@ts-ignore
                     deviceName : element.device,
                     //@ts-ignore
                     lotNumber : element.lotNumber,
                     //@ts-ignore
                     waferId : element.waferId,
                    turn : element.turn,
                    TestDieProbe : element.totalProbe != undefined && typeof element.totalProbe === "number"? element.totalProbe : 0,
                    GoodDieProbe : element.passProbe != undefined && typeof element.passProbe === "number"? element.passProbe : 0,
                    FailDieProbe : element.failProbe != undefined && typeof element.failProbe === "number"? element.failProbe : 0,
                    YieldProbe : element.yieldProbe != undefined && typeof element.yieldProbe === "number"? element.yieldProbe : 0,
                    TestDieAvi : element.totalAvi != undefined && typeof element.totalAvi === "number"? element.totalAvi : 0,
                    GoodDieAvi : element.passAvi != undefined && typeof element.passAvi === "number"? element.passAvi : 0,
                    YieldAvi : element.yieldAvi != undefined && typeof element.yieldAvi === "number"? element.yieldAvi : 0,
                    YieldCum : element.cumYield != undefined && typeof element.cumYield === "number"? element.cumYield : 0,
                })
            }
        })
        
        //turn total 삽입
        for(let i =0; i<turnCol.length;i++){
            let tempProbeYield:number = turnCol[i].GoodDieProbe/turnCol[i].TestDieProbe;
            let tempAviYield:number = turnCol[i].GoodDieAvi/turnCol[i].TestDieAvi;
            
            //i==0? counter += turnCol[i].rowCount : counter += turnCol[i].rowCount+1 ;
            
            searchData.splice(counter,0,{
                device : turnCol[i].deviceName,
                lotNumber : turnCol[i].lotNumber,
                turn : turnCol[i].turn + "*",
                colSpanFour : turnCol[i].rowCount,
                isTurn : true,
                cellColor : '#EEB8B8',
                totalProbe : (turnCol[i].TestDieProbe).toString(),
                passProbe : (turnCol[i].GoodDieProbe).toString(),
                failProbe : (turnCol[i].FailDieProbe).toString(),
                totalAvi : (turnCol[i].TestDieAvi).toString(),
                passAvi : (turnCol[i].GoodDieAvi).toString(),

                //Probe와 AVI 2개중 하나라도 0인경우
                yieldProbe : turnCol[i].GoodDieProbe !=undefined && turnCol[i].GoodDieProbe >0? +(tempProbeYield * 100).toFixed(2) : 0,
                yieldAvi : turnCol[i].GoodDieAvi !=undefined && turnCol[i].GoodDieAvi >0? +(tempAviYield * 100).toFixed(2): 0,
                cumYield : (turnCol[i].GoodDieProbe !=undefined && turnCol[i].GoodDieProbe >0) &&
                            (turnCol[i].GoodDieAvi !=undefined && turnCol[i].GoodDieAvi >0) ? +((tempProbeYield * tempAviYield)*100).toFixed(2) //cumYield 계산식 : (Probe일드*AVI일드)*100 ??
                            : (turnCol[i].GoodDieProbe ==undefined || turnCol[i].GoodDieProbe ===0)? +(tempAviYield*100).toFixed(2) : +(tempProbeYield*100).toFixed(2),
            })
            counter += turnCol[i].rowCount +1;           
        }
 
        device = "";
        lotNumber = "";

        //lotNumber
        searchData.map((element, index) => {
            if (index === 0) {
                console.log("0번째 인덱스" + index);
                //@ts-ignore
                device = element.device;
            }

            if (element.device == device) {
                if (element.lotNumber != lotNumber &&
                    element.lotNumber != null &&
                    element.lotNumber != undefined) {
                    lotNumber = element.lotNumber;
                    lotNumberCol.push({
                        rowCount: 1,
                        //@ts-ignore
                        deviceName: element.device,
                        lotNumber: element.lotNumber,
                        waferId: element.waferId,
                        TestDieProbe: element.totalProbe != undefined && typeof element.totalProbe === "number" ? element.totalProbe : 0,
                        GoodDieProbe: element.passProbe != undefined && typeof element.passProbe === "number" ? element.passProbe : 0,
                        FailDieProbe: element.failProbe != undefined && typeof element.failProbe === "number" ? element.failProbe : 0,
                        YieldProbe: element.yieldProbe != undefined && typeof element.yieldProbe === "number" ? element.yieldProbe : 0,
                        TestDieAvi: element.totalAvi != undefined && typeof element.totalAvi === "number" ? element.totalAvi : 0,
                        GoodDieAvi: element.passAvi != undefined && typeof element.passAvi === "number" ? element.passAvi : 0,
                        YieldAvi: element.yieldAvi != undefined && typeof element.yieldAvi === "number" ? element.yieldAvi : 0,
                        YieldCum: element.cumYield != undefined && typeof element.cumYield === "number" ? element.cumYield : 0,
                    })
                } else {
                    lotNumberCol[lotNumberCol.length - 1].rowCount++;
                    lotNumberCol[lotNumberCol.length - 1].TestDieProbe += element.totalProbe != undefined && typeof element.totalProbe === "number" ? element.totalProbe : 0;
                    lotNumberCol[lotNumberCol.length - 1].GoodDieProbe += element.passProbe != undefined && typeof element.passProbe === "number" ? element.passProbe : 0;
                    lotNumberCol[lotNumberCol.length - 1].FailDieProbe += element.failProbe != undefined && typeof element.failProbe === "number" ? element.failProbe : 0;
                    lotNumberCol[lotNumberCol.length - 1].YieldProbe += element.yieldProbe != undefined && typeof element.yieldProbe === "number" ? element.yieldProbe : 0;
                    lotNumberCol[lotNumberCol.length - 1].TestDieAvi += element.totalAvi != undefined && typeof element.totalAvi === "number" ? element.totalAvi : 0;
                    lotNumberCol[lotNumberCol.length - 1].GoodDieAvi += element.passAvi != undefined && typeof element.passAvi === "number" ? element.passAvi : 0;
                    lotNumberCol[lotNumberCol.length - 1].YieldAvi += element.yieldAvi != undefined && typeof element.yieldAvi === "number" ? element.yieldAvi : 0;
                    lotNumberCol[lotNumberCol.length - 1].YieldCum += element.cumYield != undefined && typeof element.cumYield === "number" ? element.cumYield : 0;

                }

            } else {
                //@ts-ignore
                device = element.device;
                //@ts-ignore
                lotNumber = element.lotNumber;

                lotNumberCol.push({
                    rowCount: 1,
                    //@ts-ignore
                    deviceName: element.device,
                    //@ts-ignore
                    waferId: element.waferId,
                    //@ts-ignore
                    lotNumber: element.lotNumber,
                    TestDieProbe: element.totalProbe != undefined && typeof element.totalProbe === "number" ? element.totalProbe : 0,
                    GoodDieProbe: element.passProbe != undefined && typeof element.passProbe === "number" ? element.passProbe : 0,
                    FailDieProbe: element.failProbe != undefined && typeof element.failProbe === "number" ? element.failProbe : 0,
                    YieldProbe: element.yieldProbe != undefined && typeof element.yieldProbe === "number" ? element.yieldProbe : 0,
                    TestDieAvi: element.totalAvi != undefined && typeof element.totalAvi === "number" ? element.totalAvi : 0,
                    GoodDieAvi: element.passAvi != undefined && typeof element.passAvi === "number" ? element.passAvi : 0,
                    YieldAvi: element.yieldAvi != undefined && typeof element.yieldAvi === "number" ? element.yieldAvi : 0,
                    YieldCum: element.cumYield != undefined && typeof element.cumYield === "number" ? element.cumYield : 0,
                })
            }
        })

        //lotnumber total 삽입
        counter = 0;
        for (let i = 0; i < lotNumberCol.length; i++) {
            let tempProbeYield: number = lotNumberCol[i].GoodDieProbe / lotNumberCol[i].TestDieProbe;
            let tempAviYield: number = lotNumberCol[i].GoodDieAvi / lotNumberCol[i].TestDieAvi;
            searchData.splice(counter, 0, {
                device: lotNumberCol[i].deviceName,
                lotNumber: lotNumberCol[i].lotNumber + "*",
                turn: lotNumberCol[i].turn,
                colSpanFour: lotNumberCol[i].rowCount,
                isLotNumber: true,
                cellColor: '#B4FBFF',
                totalProbe: (lotNumberCol[i].TestDieProbe).toString(),
                passProbe: (lotNumberCol[i].GoodDieProbe).toString(),
                failProbe: (lotNumberCol[i].FailDieProbe).toString(),
                totalAvi: (lotNumberCol[i].TestDieAvi).toString(),
                passAvi: (lotNumberCol[i].GoodDieAvi).toString(),

                yieldProbe: lotNumberCol[i].GoodDieProbe != undefined && lotNumberCol[i].GoodDieProbe > 0 ? +(tempProbeYield * 100).toFixed(2) : 0,
                yieldAvi: lotNumberCol[i].GoodDieAvi != undefined && lotNumberCol[i].GoodDieAvi > 0 ? +(tempAviYield * 100).toFixed(2) : 0,
                cumYield: (lotNumberCol[i].GoodDieProbe != undefined && lotNumberCol[i].GoodDieProbe > 0) &&
                    (lotNumberCol[i].GoodDieAvi != undefined && lotNumberCol[i].GoodDieAvi > 0) ? +((tempProbeYield * tempAviYield) * 100).toFixed(2)
                    : (lotNumberCol[i].GoodDieProbe == undefined || lotNumberCol[i].GoodDieProbe === 0) ? +(tempAviYield * 100).toFixed(2) : +(tempProbeYield * 100).toFixed(2),

            })
            counter += lotNumberCol[i].rowCount + 1;
        }

        device = "";
        lotNumber = "";

        //Device
        searchData.map((element) => {

            if (element.device != device &&
                element.device != null &&
                element.device != undefined) {
                device = element.device;
                deviceCol.push({
                    rowCount: 1,
                    //@ts-ignore
                    deviceName: element.device,
                    waferId: element.waferId,
                    TestDieProbe: element.totalProbe != undefined && typeof element.totalProbe === "number" ? element.totalProbe : 0,
                    GoodDieProbe: element.passProbe != undefined && typeof element.passProbe === "number" ? element.passProbe : 0,
                    FailDieProbe: element.failProbe != undefined && typeof element.failProbe === "number" ? element.failProbe : 0,
                    YieldProbe: element.yieldProbe != undefined && typeof element.yieldProbe === "number" ? element.yieldProbe : 0,
                    TestDieAvi: element.totalAvi != undefined && typeof element.totalAvi === "number" ? element.totalAvi : 0,
                    GoodDieAvi: element.passAvi != undefined && typeof element.passAvi === "number" ? element.passAvi : 0,
                    YieldAvi: element.yieldAvi != undefined && typeof element.yieldAvi === "number" ? element.yieldAvi : 0,
                    YieldCum: element.cumYield != undefined && typeof element.cumYield === "number" ? element.cumYield : 0,
                })
            } else {
                deviceCol[deviceCol.length - 1].rowCount++;
                deviceCol[deviceCol.length - 1].TestDieProbe += element.totalProbe != undefined && typeof element.totalProbe === "number" ? element.totalProbe : 0;
                deviceCol[deviceCol.length - 1].GoodDieProbe += element.passProbe != undefined && typeof element.passProbe === "number" ? element.passProbe : 0;
                deviceCol[deviceCol.length - 1].FailDieProbe += element.failProbe != undefined && typeof element.failProbe === "number" ? element.failProbe : 0;
                deviceCol[deviceCol.length - 1].YieldProbe += element.yieldProbe != undefined && typeof element.yieldProbe === "number" ? element.yieldProbe : 0;
                deviceCol[deviceCol.length - 1].TestDieAvi += element.totalAvi != undefined && typeof element.totalAvi === "number" ? element.totalAvi : 0;
                deviceCol[deviceCol.length - 1].GoodDieAvi += element.passAvi != undefined && typeof element.passAvi === "number" ? element.passAvi : 0;
                deviceCol[deviceCol.length - 1].YieldAvi += element.yieldAvi != undefined && typeof element.yieldAvi === "number" ? element.yieldAvi : 0;
                deviceCol[deviceCol.length - 1].YieldCum += element.cumYield != undefined && typeof element.cumYield === "number" ? element.cumYield : 0;
            }
        })

        //device total 삽입
        counter = 0;
        for (let i = 0; i < deviceCol.length; i++) {
            let tempProbeYield: number = deviceCol[i].GoodDieProbe / deviceCol[i].TestDieProbe;
            let tempAviYield: number = deviceCol[i].GoodDieAvi / deviceCol[i].TestDieAvi;
            searchData.splice(counter, 0, {
                device: deviceCol[i].deviceName + "*",
                colSpan: deviceCol[i].rowCount,
                isDevice: true,
                cellColor: '#BECDFF',
                totalProbe: (deviceCol[i].TestDieProbe).toString(),
                passProbe: (deviceCol[i].GoodDieProbe).toString(),
                failProbe: (deviceCol[i].FailDieProbe).toString(),
                totalAvi: (deviceCol[i].TestDieAvi).toString(),
                passAvi: (deviceCol[i].GoodDieAvi).toString(),
                yieldProbe: deviceCol[i].GoodDieProbe != undefined && deviceCol[i].GoodDieProbe > 0 ? +(tempProbeYield * 100).toFixed(2) : 0,
                yieldAvi: deviceCol[i].GoodDieAvi != undefined && deviceCol[i].GoodDieAvi > 0 ? +(tempAviYield * 100).toFixed(2) : 0,
                cumYield: (deviceCol[i].GoodDieProbe != undefined && deviceCol[i].GoodDieProbe > 0) &&
                    (deviceCol[i].GoodDieAvi != undefined && deviceCol[i].GoodDieAvi > 0) ? +((tempProbeYield * tempAviYield) * 100).toFixed(2)
                    : (deviceCol[i].GoodDieProbe == undefined || deviceCol[i].GoodDieProbe === 0) ? +(tempAviYield * 100).toFixed(2) : +(tempProbeYield * 100).toFixed(2),

            })

            counter += deviceCol[i].rowCount + 1;
        }

        //total 삽입
        counter = 0;
        for (let i = 0; i < totalCol.length; i++) {
            searchData.splice(counter, 0, {
                device: "Total",
                totalProbe: totalProbe.toString(),
                passProbe: passProbe.toString(),
                failProbe: failProbe.toString(),
                totalAvi: totalAvi.toString(),
                passAvi: passAvi.toString(),

                //// 수량으로 total  yield 구하기              
                //yieldProbe: passProbe != undefined && passProbe > 0 ? +((passProbe / totalProbe) * 100).toFixed(2) : 0,
                // yieldAvi : passAvi !=undefined && passAvi > 0 ?  +((passAvi/totalAvi)*100).toFixed(2): 0, 

                ////cumYield 공식(ProbeYield * AviYield * 100)으로 구하기
                // cumYield : (passProbe !=undefined && passProbe >0) &&
                //             (passAvi !=undefined && passAvi >0) ? +(((passProbe/totalProbe)*(passAvi/totalAvi))*100).toFixed(2) 
                //             : (passProbe ==undefined || passProbe ===0)? +(passAvi/totalAvi*100).toFixed(2) : +(passProbe/totalProbe*100).toFixed(2),

                // yield의 합을 갯수로 나눠서 구하기
                //@ts-ignore 
                yieldProbe : +(+(totalCol[totalCol.length-1].YieldProbe.toFixed(2)) / totalCol[totalCol.length-1].rowCountThree).toFixed(2),

                //@ts-ignore 
                yieldAvi: +(+(totalCol[totalCol.length - 1].YieldAvi.toFixed(2)) / totalCol[totalCol.length - 1].rowCount).toFixed(2),
                //@ts-ignore 
                cumYield: +(totalCol[totalCol.length - 1].YieldCum / totalCol[totalCol.length - 1].rowCountTwo).toFixed(2),

                isTotal: true,
                cellColor: '#BDFFC7',
            })
        }

    
        //1000자리 구분자 넣기
        searchData.map((element) => {
            element.totalProbe = element.totalProbe != undefined ? addCommaToString(+element.totalProbe) : undefined;
            element.passProbe = element.passProbe != undefined ? addCommaToString(+element.passProbe) : undefined;
            element.failProbe = element.failProbe != undefined ? addCommaToString(+element.failProbe) : undefined;
            element.totalAvi = element.totalAvi != undefined ? addCommaToString(+element.totalAvi) : undefined;
            element.passAvi = element.passAvi != undefined ? addCommaToString(+element.passAvi) : undefined;
        })
        
        
        startTransition(()=>{
            setTableBodies((
                <tbody key={"bodies"}>
                {searchData.map((element,index) => (
                    <React.Fragment key={"body"+index}>
                        <tr>
                            {element.isTotal? element.cellColor == undefined? <td><span>{element.device}</span></td> : <td style={{backgroundColor:element.cellColor, fontWeight: 'bold'}}><span>{element.device}</span></td>
                                :
                                element.isDevice ? 
                                    <td
                                        //@ts-ignore
                                        style={{backgroundColor:element.cellColor, fontWeight: 'bold'}}
                                    >
                                        <span>{element.device}</span></td>
                                    :
                                    <td><span>{element.device}</span></td>
                            }
                            {element.isTotal? element.cellColor == undefined? <td><span>{element.lotNumber}</span></td> : <td style={{backgroundColor:element.cellColor, fontWeight: 'bold'}}><span>{element.lotNumber}</span></td>
                                :
                                element.isDevice? element.cellColor == undefined? <td><span>{element.lotNumber}</span></td> : <td style={{backgroundColor:element.cellColor, fontWeight: 'bold'}}><span>{element.lotNumber}</span></td>
                                    :
                                    element.isLotNumber? 
                                        <td 
                                            //@ts-ignore
                                            style={{backgroundColor:element.cellColor, fontWeight: 'bold'}}><span>{element.lotNumber}</span></td>
                                        :
                                        <td><span>{element.lotNumber}</span></td>
                            }
                            
                            {element.isTotal? element.cellColor == undefined? <td><span>{element.turn}</span></td> : <td style={{backgroundColor:element.cellColor, fontWeight: 'bold'}}><span>{element.turn}</span></td>
                                :
                                element.isDevice? element.cellColor == undefined? <td><span>{element.turn}</span></td> : <td style={{backgroundColor:element.cellColor, fontWeight: 'bold'}}><span>{element.turn}</span></td>
                                    :
                                    element.isLotNumber? element.cellColor == undefined? <td><span>{element.turn}</span></td> : <td style={{backgroundColor:element.cellColor, fontWeight: 'bold'}}><span>{element.turn}</span></td>
                                    :
                                        element.isTurn?
                                            //@ts-ignore 
                                            <td style={{backgroundColor:element.cellColor, fontWeight: 'bold'}}><span>{element.turn}</span></td>
                                            :
                                            <td><span>{element.turn}</span></td>
                            }
                            
                            {element.cellColor == undefined? <td><span>{element.waferId}</span></td> : <td style={{backgroundColor:element.cellColor, fontWeight: 'bold'}}><span>{element.waferId}</span></td>}
                            {element.cellColor == undefined? <td><span>{element.totalProbe}</span></td> : <td style={{backgroundColor:element.cellColor, fontWeight: 'bold'}}><span>{element.totalProbe}</span></td>}
                            {element.cellColor == undefined? <td><span>{element.passProbe}</span></td> : <td style={{backgroundColor:element.cellColor, fontWeight: 'bold'}}><span>{element.passProbe}</span></td>}
                            {element.cellColor == undefined? <td><span>{element.failProbe}</span></td> : <td style={{backgroundColor:element.cellColor, fontWeight: 'bold'}}><span>{element.failProbe}</span></td> }
                            {element.cellColor == undefined? <td><span>{element.yieldProbe}</span></td> : <td style={{backgroundColor:element.cellColor, fontWeight: 'bold'}}><span>{element.yieldProbe}</span></td>}
                            {element.cellColor == undefined? <td><span>{element.b2}</span></td> : <td style={{backgroundColor:element.cellColor, fontWeight: 'bold'}}><span>{element.b2}</span></td>}
                            {element.cellColor == undefined? <td><span>{element.b3}</span></td> : <td style={{backgroundColor:element.cellColor, fontWeight: 'bold'}}><span>{element.b3}</span></td>}
                            {element.cellColor == undefined? <td><span>{element.b4}</span></td> : <td style={{backgroundColor:element.cellColor, fontWeight: 'bold'}}><span>{element.b4}</span></td>}
                            {element.cellColor == undefined? <td><span>{element.b5}</span></td> : <td style={{backgroundColor:element.cellColor, fontWeight: 'bold'}}><span>{element.b5}</span></td>}
                            {element.cellColor == undefined? <td><span>{element.b6}</span></td> : <td style={{backgroundColor:element.cellColor, fontWeight: 'bold'}}><span>{element.b6}</span></td>}
                            {element.cellColor == undefined? <td><span>{element.b7}</span></td> : <td style={{backgroundColor:element.cellColor, fontWeight: 'bold'}}><span>{element.b7}</span></td>}
                            {element.cellColor == undefined? <td><span>{element.b8}</span></td> : <td style={{backgroundColor:element.cellColor, fontWeight: 'bold'}}><span>{element.b8}</span></td>}
                            {element.cellColor == undefined? <td><span>{element.totalAvi}</span></td> : <td style={{backgroundColor:element.cellColor, fontWeight: 'bold'}}><span>{element.totalAvi}</span></td>}
                            {element.cellColor == undefined? <td><span>{element.passAvi}</span></td> : <td style={{backgroundColor:element.cellColor, fontWeight: 'bold'}}><span>{element.passAvi}</span></td>}
                            {element.cellColor == undefined? <td><span>{element.yieldAvi}</span></td> : <td style={{backgroundColor:element.cellColor, fontWeight: 'bold'}}><span>{element.yieldAvi}</span></td>}
                            {element.cellColor == undefined? <td><span>{element.shipmentDate}</span></td> : <td style={{backgroundColor:element.cellColor, fontWeight: 'bold'}}><span>{element.shipmentDate}</span></td>}
                            {element.cellColor == undefined? <td><span>{element.cumYield}</span></td> : <td style={{backgroundColor:element.cellColor, fontWeight: 'bold'}}><span>{element.cumYield}</span></td>}

                            {/* <td><span>{element.device}</span></td>
                            <td><span>{element.lotNumber}</span></td>
                            <td><span>{element.turn}</span></td>
                            <td><span>{element.waferId}</span></td>
                            <td><span>{element.totalProbe}</span></td>
                            <td><span>{element.passProbe}</span></td>
                            <td><span>{element.failProbe}</span></td>
                            <td><span>{element.yieldProbe}</span></td>
                            <td><span>{element.b2}</span></td>
                            <td><span>{element.b3}</span></td>
                            <td><span>{element.b4}</span></td>
                            <td><span>{element.b5}</span></td>
                            <td><span>{element.b6}</span></td>
                            <td><span>{element.b7}</span></td>
                            <td><span>{element.b8}</span></td>
                            <td><span>{element.totalAvi}</span></td>
                            <td><span>{element.passAvi}</span></td>
                            <td><span>{element.yieldAvi}</span></td>
                            <td><span>{element.shipmentDate}</span></td>
                            <td><span>{element.cumYield}</span></td> */}
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

    const existBothDataChanged = ((e:ChangeEvent<HTMLInputElement>)=>{
            setExistBothData(e.target.checked);
            
    })
    const baseYieldChanged =((e:ChangeEvent<HTMLInputElement>) =>{
        setBaseYield((e.target.value).replace(/[^0-9]/g, ''));
    })

    return (
        <S.Container
            isLookDown={isLookDown}
        >
            <form onSubmit={onSubmit}>
                <div className='condition-container'>
                    <div className="test-degree-container">
                        <div className="degree">
                            <div>
                                <label>{langState.isKor? 'Cum Yield 기준' :'Base Cum Yield'} </label>
                                <input type="text" value={baseYield} onChange={baseYieldChanged}/>
                            </div>
                            {/* <div>
                                <input className="check-box" type="checkbox" />
                                <label>최종차수</label>
                            </div> */}
                        </div>
                        <div>
                            <input className="check-box" type="checkbox"  onChange={existBothDataChanged} />
                            <label>{langState.isKor? "PTEST AVI Data 둘다 있는것만 보기":"Both PTEST and AVI exist"}</label>
                        </div>
                    </div>
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
                </div>
                <TableForm
                    name="TotalYieldReport"
                    tableHeaders={tableHeaders}
                    tableBodies={tableBodies}
                    CSVHeaders={CSVHeaders}
                    CSVData={searchData}
                    isLookDown={isLookDown}
                    setIsLookDown={setIsLookDown}
                    isDateRange={true}
                    isDatePicker={false}
                    startDate={startDate}
                    endDate={endDate}
                    setStartDate={setStartDate}
                    setEndDate={setEndDate}
                />
            </form>
        </S.Container>
    )
}

export default TotalYield;
