import * as S from './style.ViewDefectStatus';
import SearchSelector from "../../components/form/SearchSelector";
import React, {useEffect, useState} from "react";
import {CSVHeader, ISearchBox, TableHeader} from "../../types/type";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../modules";
import ApiUtil from "../../utils/ApiUtil";
import {showAlertModal} from "../../modules/action/alertAction";
import TableForm from "../../components/form/TableForm";
import VerticalBar, {IBarDataSet} from "../../components/common/VerticalBar";
import {getRGBA} from "../../utils/RGBAUtil";
import Icon from "../../components/common/Icon";
import {IDevice, ILotNumber, IOperation} from "../../types/userData";
import {getDateString, getTodayString} from "../../utils/dateUtil";

const tableHeaders:TableHeader[] = [
    {text:"제품" , width: "130px"},
    {text:"공정" , width: "130px"},
    {text:"LOT_Number" , width: "100px"},
    {text:`4"_M1 Scratch` , width: "60px"},
    {text:`6"_Crack` , width: "60px"},
    {text:`6"_Chip` , width: "60px"},
    {text:`6"_Scratch` , width: "60px"},
];

const CSVHeaders:CSVHeader[] = [
    {label : "제품", key : "device"},
    {label : "공정", key : "operation"},
    {label : "LOT_Number", key : "lotNumber"},
    {label : `4"_M1 Scratch`, key : "m1Scratch"},
    {label : `6"_Crack`, key : "crack"},
    {label : `6"_Chip`, key : "chip"},
    {label : `6"_Scratch`, key : "scratch"},
];

interface IDefectStatus {
    device : string;
    operation: string;
    lotNumber: string;
    totalLbrQty: number;
    lossScrapQty: number;
    lossRepairQty: number;
    m1Scratch : number;
    crack : number;
    chip : number;
    scratch : number;
}

const labels:string[] = ['4"_M1 Scratch', '6"_Crack', '6"Chip', '6"_Scratch', '합계' ];

const ViewDefectStatus = () => {
    const [operations, setOperations] = useState<ISearchBox[]>([]);
    const [checkedOperations, setCheckedOperations] = useState<ISearchBox[]>([]);
    const [devices, setDevices] = useState<ISearchBox[]>([]);
    const [checkedDevices, setCheckedDevices] = useState<ISearchBox[]>([]);
    const [lotNumbers, setLotNumbers] = useState<ISearchBox[]>([]);
    const [checkedLotNumbers, setCheckedLotNumbers] = useState<ISearchBox[]>([]);
    const [searchData,setSearchData] = useState<IDefectStatus[]>([]);
    const [isLookDown,setIsLookDown] = useState(false);
    const [tableBodies, setTableBodies] = useState<JSX.Element>((<tbody></tbody>));
    const [isTable,setIsTable] = useState(true);
    const [startDate,setStartDate] = useState(new Date());
    const [endDate,setEndDate] = useState(new Date());
    const [defectByDevice,setDefectByDevice] = useState<IBarDataSet[]>([]);
    const [defectByOperation,setDefectByOperation] = useState<IBarDataSet[]>([]);
    const [defectByLotNumber,setDefectByLotNumber] = useState<IBarDataSet[]>([]);
    const dispatch = useDispatch();
    const langState = useSelector((state:RootState) => state.langReducer);

    const onSubmit = (event : React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        async function callAPI(){
            const params:object = {
                dates : {
                    startDate : getDateString(startDate),
                    endDate : getDateString(endDate)
                },
                operations : checkedOperations,
                devices : checkedDevices,
                lotNumbers : checkedLotNumbers
            }
            const res = await ApiUtil.post("/search/defect-status",params);
            if(res.data.defectStatus.length === 0 ){
                dispatch(showAlertModal("확인 메세지","데이터","가 없습니다."));
            }
            setSearchData(res.data.defectStatus);
        }
        callAPI();
    }

    useEffect(()=>{
        async function callAPI(){
            const res = await ApiUtil.get(
                "/condition/operationAndDeviceAndLotNumber",
            )
            // 초기화
            operations.splice(0,operations.length);
            res.data.operations.map((operation : IOperation) => {
                return operations.push({
                    id: operation.operation,
                    text : `${operation.operation} : ${operation.description}`
                })
            })
            setOperations(operations);
            devices.splice(0,devices.length);
            res.data.devices.map((device : IDevice) => {
                return devices.push({
                    id: device.deviceId,
                    text : device.description,
                    condition : device.customer
                })
            })
            setDevices(devices);
            lotNumbers.splice(0,lotNumbers.length);
            res.data.lotNumbers.map((lotNumber : ILotNumber) => {
                return lotNumbers.push({
                    id: lotNumber.id,
                    text : lotNumber.text,
                })
            })
            setLotNumbers(lotNumbers);
        }
        callAPI();
    },[ operations, devices , lotNumbers]);

    useEffect(()=>{
        setTableBodies((
            <tbody
                key={"bodies"}
            >
            {searchData.map((element,index)=>(
                <React.Fragment
                    key={"body"+index}
                >
                    <tr>
                        <td><span>{element.device}</span></td>
                        <td><span>{element.operation}</span></td>
                        <td><span>{element.lotNumber}</span></td>
                        <td><span>{element.m1Scratch}</span></td>
                        <td><span>{element.crack}</span></td>
                        <td><span>{element.chip}</span></td>
                        <td><span>{element.scratch}</span></td>
                    </tr>
                </React.Fragment>
            ))}
            </tbody>
        ))

        defectByDevice.splice(0,defectByDevice.length);
        defectByOperation.splice(0,defectByOperation.length);
        defectByLotNumber.splice(0,defectByLotNumber.length);
        searchData.map((element,index) => {
            defectByDevice.push({
                label : element.device,
                data : [element.m1Scratch,element.crack,element.chip,element.scratch,element.totalLbrQty],
                backgroundColor : getRGBA(index)
            })
        });
        searchData.map((element,index) => {
            defectByOperation.push({
                label : element.operation,
                data : [element.m1Scratch,element.crack,element.chip,element.scratch,element.totalLbrQty],
                backgroundColor : getRGBA(index+2)
            })
        });
        searchData.map((element,index) => {
            defectByLotNumber.push({
                label : element.lotNumber,
                data : [element.m1Scratch,element.crack,element.chip,element.scratch,element.totalLbrQty],
                backgroundColor : getRGBA(index+4)
            })
        });
        setDefectByDevice([...defectByDevice]);
        setDefectByOperation([...defectByOperation]);
        setDefectByLotNumber([...defectByLotNumber]);

    },[searchData])

    const setGridView = () => {
        setIsTable((prev) => !prev);
    }

    return (
        <S.Container
            isLookDown={isLookDown}
        >
            <form onSubmit={onSubmit}>
                <div className='condition-container'>
                    <SearchSelector
                        title={langState.isKor ? "공정" : "Operation"}
                        list={operations}
                        selected={checkedOperations}
                        selector={setCheckedOperations}
                    />
                    <SearchSelector
                        title={langState.isKor ? "Lot Number" : "Lot Number"}
                        list={lotNumbers}
                        selected={checkedLotNumbers}
                        selector={setCheckedLotNumbers}
                    />
                    <SearchSelector
                        title={langState.isKor ? "제품" : "Device"}
                        list={devices}
                        selected={checkedDevices}
                        selector={setCheckedDevices}
                        hasDesc={true}
                    />
                </div>
                {isTable &&
                    (<TableForm
                    name="DefectStatus"
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
                    />)}
                <div className="chart-container">
                    <div className="chart-menu">
                        <Icon
                            icon={isTable ? "gridOff" : "grid" }
                            size={26}
                            onClick={setGridView}
                        />
                    </div>
                    <div className="charts">
                        <VerticalBar
                            title="제품별 불량현황"
                            labels={labels}
                            datasets={defectByDevice}
                        />
                        <VerticalBar
                            title="공정별 불량현황"
                            labels={labels}
                            datasets={defectByOperation}
                        />
                        <VerticalBar
                            title="Lot별 불량현황"
                            labels={labels}
                            datasets={defectByLotNumber}
                        />
                    </div>
                </div>
            </form>
        </S.Container>
    );
}

export default ViewDefectStatus;
