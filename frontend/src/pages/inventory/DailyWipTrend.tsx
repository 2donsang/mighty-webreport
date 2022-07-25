import React from 'react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Icon from '../../components/common/Icon';
import StackedBar from '../../components/common/StackedBar';
import VerticalBar, { IBarDataSet } from '../../components/common/VerticalBar';
import SearchSelector from '../../components/form/SearchSelector';
import TableForm from '../../components/form/TableForm';
import { RootState } from '../../modules';
import { showAlertModal } from '../../modules/action/alertAction';
import { CSVHeader, INaturalDate, ISearchBox, TableHeader } from '../../types/type';
import { IDevice, ILotNumber, ILotStatus, IOperation } from '../../types/userData';
import ApiUtil from '../../utils/ApiUtil';
import { getDateString } from '../../utils/dateUtil';
import { getRGBA } from '../../utils/RGBAUtil';
import * as S from './style.DailyWipTrend';

const tableHeaders: TableHeader[] = [
    { text: "Operation", width: "130px" },
    { text: "공정", width: "130px" },
    { text: "1일", width: "80px" },
    { text: "2일", width: "80px" },
    { text: "3일", width: "80px" },
    { text: "4일", width: "80px" },
    { text: "5일", width: "80px" },
    { text: "6일", width: "80px" },
    { text: "7일", width: "80px" },
    { text: "8일", width: "80px" },
    { text: "9일", width: "80px" },
    { text: "10일", width: "80px" },
    { text: "11일", width: "80px" },
    { text: "12일", width: "80px" },
    { text: "13일", width: "80px" },
    { text: "14일", width: "80px" },
    { text: "15일", width: "80px" },
    { text: "16일", width: "80px" },
    { text: "17일", width: "80px" },
    { text: "18일", width: "80px" },
    { text: "19일", width: "80px" },
    { text: "20일", width: "80px" },
    { text: "21일", width: "80px" },
    { text: "22일", width: "80px" },
    { text: "23일", width: "80px" },
    { text: "24일", width: "80px" },
    { text: "25일", width: "80px" },
    { text: "26일", width: "80px" },
    { text: "27일", width: "80px" },
    { text: "28일", width: "80px" },
    { text: "29일", width: "80px" },
    { text: "30일", width: "80px" },
    { text: "31일", width: "80px" },
];


const CSVHeaders: CSVHeader[] = [
    { label: "제품", key: "device" },
    { label: "공정", key: "operation" },
    { label: "LOT_Number", key: "lotNumber" },
    { label: `4"_M1 Scratch`, key: "m1Scratch" },
    { label: `6"_Crack`, key: "crack" },
    { label: `6"_Chip`, key: "chip" },
    { label: `6"_Scratch`, key: "scratch" },
];

interface IDefectStatus {
    device: string;
    operation: string;
    lotNumber: string;
    totalLbrQty: number;
    lossScrapQty: number;
    lossRepairQty: number;
    m1Scratch: number;
    crack: number;
    chip: number;
    scratch: number;
}


interface IDailyWipTrend {
    operation: string; operationDesc: string;
    day1:number; day11:number; day21:number;
    day2:number; day12:number; day22:number;
    day3:number; day13:number; day23:number;
    day4:number; day14:number; day24:number;
    day5:number; day15:number; day25:number;
    day6:number; day16:number; day26:number;
    day7:number; day17:number; day27:number;
    day8:number; day18:number; day28:number;
    day9:number; day19:number; day29:number;
    day10:number; day20:number; day30:number; day31:number;

}

const labels: string[] = ['4"_M1 Scratch', '6"_Crack', '6"Chip', '6"_Scratch', 'test', '합계'];
const dailyLabels: string[] = [];


const DailyWipTrend = () => {
    const langState = useSelector((state: RootState) => state.langReducer);
    // 제품, LOT 번호, 공정, LOT Status
    const [isLookDown, setIsLookDown] = useState(true);
    const [devices, setDevices] = useState<ISearchBox[]>([]);
    const [checkedDevices, setCheckedDevices] = useState<ISearchBox[]>([]);
    const [lotNumbers, setLotnumbers] = useState<ISearchBox[]>([]);
    const [checkedLotNumbers, setCheckedLotNumbers] = useState<ISearchBox[]>([]);
    const [operations, setOperations] = useState<ISearchBox[]>([]);
    const [checkedOperations, setCheckedOperations] = useState<ISearchBox[]>([]);
    const [isTable, setIsTable] = useState(true);
    const [defectByLotNumber, setDefectByLotNumber] = useState<IBarDataSet[]>([]);
    const [dailyWipTrend, setDailyWipTrend] = useState<IBarDataSet[]>([]);
    const [tableBodies, setTableBodies] = useState<JSX.Element>((<tbody></tbody>));
    const [searchData, setSearchData] = useState<IDailyWipTrend[]>([]);

    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [currentDate, setCurrentDate] = useState(new Date());

    const dispatch = useDispatch();

    const [dailyWipColumnNames, setDailyWipColumnNames] = useState<INaturalDate[]>([]);
    const [newTableHeader, setNewTableHeader] = useState<TableHeader[]>(tableHeaders);

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();       
        async function callAPI() {
            //debugger
            let startYear = getDateString(startDate).substring(0, 4);
            let startMonth = getDateString(startDate).substring(4, 6);
            let currentMonth = getDateString(currentDate).substring(4, 6);
            let newLastDate = new Date(Number(startYear), Number(startMonth), 0);
            let endDate2 = currentMonth == startMonth ? getDateString(endDate) : getDateString(newLastDate);
            console.log("가공된 endDate: "+endDate2)
            const params: object = {
                dates: {
                    startDate: getDateString(startDate),
                    endDate: endDate2,
                },
                devices: checkedDevices,
                lotNumbers: checkedLotNumbers,
                operations: checkedOperations,
            }

            //debugger

            const resCol = await ApiUtil.post("/search/daily-wip-columnName", params);

            dailyWipColumnNames.splice(0, dailyWipColumnNames.length);
            resCol.data.dailyWipColumnName.map((element: INaturalDate) => {
                let date = element.naturalDate.substring(4, 6) + "/" + element.naturalDate.substring(6);
                return dailyWipColumnNames.push({
                    naturalDate: date,
                })
            })
            setDailyWipColumnNames(resCol.data.dailyWipColumnName);

            //차트 X축용 세팅
            dailyLabels.splice(0, dailyLabels.length);
            dailyWipColumnNames.map((element: INaturalDate) => {
                dailyLabels.push(element.naturalDate)
            })
            console.log(dailyLabels);

            //그리드 컬럼해더 세팅
            // newTableHeader.splice(0, newTableHeader.length);
            // newTableHeader.push({ text: "operation", width: "130px" });
            // newTableHeader.push({ text: "공정", width: "130px" });
            // dailyWipColumnNames.map((element) => {
            //     newTableHeader.push({
            //         text: element.naturalDate,
            //         width: "100px"
            //     })
            // })
            // setNewTableHeader(newTableHeader);

            const res = await ApiUtil.post("/search/daily-wip-trend", params);
            //debugger
            
            if (res.data.dailyWipTrend.length == 0) {
                dispatch(showAlertModal("확인메세지", "데이터", "가 없습니다."));
            }
            setSearchData(res.data.dailyWipTrend);

        }
        console.log(document.getElementsByClassName('tableForm'))
        callAPI();
    }

    useEffect(() => {
        async function callAPI() {
            // debugger
            const res = await ApiUtil.get(
                "/condition/deviceAndLotNumberAndOperation",);
            devices.splice(0, devices.length);
            res.data.devices.map((device: IDevice) => {
                return devices.push({
                    id: device.deviceId,
                    text: device.description,
                })
            })
            setDevices(devices);

            lotNumbers.splice(0, lotNumbers.length);
            res.data.lotNumbers.map((lotNumber: ILotNumber) => {
                return lotNumbers.push({
                    id: lotNumber.id,
                    text: lotNumber.id,
                })
            })
            setLotnumbers(lotNumbers);

            operations.splice(0, operations.length);
            res.data.operations.map((operation: IOperation) => {
                return operations.push({
                    id: operation.operation,
                    text: operation.description,
                })
            })
            setOperations(operations);
        }

        callAPI();
    }, [devices, operations, lotNumbers])


    useEffect(() => {

        dailyWipTrend.splice(0, dailyWipTrend.length);
        searchData.map((element, index) => {
            console.log(searchData);
            dailyWipTrend.push({
                label: element.operationDesc,
                data: [element.day1, element.day2, element.day3, element.day4, element.day5,
                element.day6, element.day7, element.day8, element.day9, element.day10,
                element.day11, element.day12, element.day13, element.day14, element.day15,
                element.day16, element.day17, element.day18, element.day19, element.day20,
                element.day21, element.day22, element.day23, element.day24, element.day25,
                element.day26, element.day27, element.day28, element.day29, element.day30,
                element.day31],
                backgroundColor: getRGBA(index + 4)
            })
        });
        setDailyWipTrend([...dailyWipTrend]);

        let day1:number = 0;
        let day2:number = 0;
        let day3:number = 0;
        let day4:number = 0;
        let day5:number = 0;
        let day6:number = 0;
        let day7:number = 0;
        let day8:number = 0;
        let day9:number = 0;
        let day10:number = 0;
        let day11:number = 0;
        let day12:number = 0;
        let day13:number = 0;
        let day14:number = 0;
        let day15:number = 0;
        let day16:number = 0;
        let day17:number = 0;
        let day18:number = 0;
        let day19:number = 0;
        let day20:number = 0;
        let day21:number = 0;
        let day22:number = 0;
        let day23:number = 0;
        let day24:number = 0;
        let day25:number = 0;
        let day26:number = 0;
        let day27:number = 0;
        let day28:number = 0;
        let day29:number = 0;
        let day30:number = 0;
        let day31:number = 0;
        let days: number[] = [];

        searchData.map((array, index) => {
            day1 += Number(array.day1);
            day2 += Number(array.day2);
            day3 += Number(array.day3);
            day4 += Number(array.day4);
            day5 += Number(array.day5);
            day6 += Number(array.day6);
            day7 += Number(array.day7);
            day8 += Number(array.day8);
            day9 += Number(array.day9);
            day10 += Number(array.day10);
            day11 += Number(array.day11);
            day12 += Number(array.day12);
            day13 += Number(array.day13);
            day14 += Number(array.day14);
            day15 += Number(array.day15);
            day16 += Number(array.day16);
            day17 += Number(array.day17);
            day18 += Number(array.day18);
            day19 += Number(array.day19);
            day20 += Number(array.day20);
            day21 += Number(array.day21);
            day22 += Number(array.day22);
            day23 += Number(array.day23);
            day24 += Number(array.day24);
            day25 += Number(array.day25);
            day26 += Number(array.day26);
            day27 += Number(array.day27);
            day28 += Number(array.day28);
            day29 += Number(array.day29);
            day30 += Number(array.day30);
            day31 += Number(array.day31);
        })
        searchData.splice(0, 0, {
            operation: "",
            operationDesc: "Total",
            day1: day1,
            day2: day2,
            day3: day3,
            day4: day4,
            day5: day6,
            day6: day7,
            day7: day8,
            day8: day9,
            day9: day9,
            day10: day10,
            day11: day11,
            day12: day12,
            day13: day13,
            day14: day14,
            day15: day15,
            day16: day16,
            day17: day17,
            day18: day18,
            day19: day19,
            day20: day20,
            day21: day21,
            day22: day22,
            day23: day23,
            day24: day24,
            day25: day25,
            day26: day26,
            day27: day27,
            day28: day28,
            day29: day29,
            day30: day30,
            day31: day31,
        })


        setTableBodies((
            <tbody
                key={"bodies"}
            >
                {searchData.map((element, index) => (
                    <React.Fragment
                        key={"body" + index}
                    >
                        <tr>
                            <td><span>{element.operation}</span></td>
                            <td><span>{element.operationDesc}</span></td>
                            <td><span>{element.day1}</span></td>
                            <td><span>{element.day2}</span></td>
                            <td><span>{element.day3}</span></td>
                            <td><span>{element.day4}</span></td>
                            <td><span>{element.day5}</span></td>
                            <td><span>{element.day6}</span></td>
                            <td><span>{element.day7}</span></td>
                            <td><span>{element.day8}</span></td>
                            <td><span>{element.day9}</span></td>
                            <td><span>{element.day10}</span></td>
                            <td><span>{element.day11}</span></td>
                            <td><span>{element.day12}</span></td>
                            <td><span>{element.day13}</span></td>
                            <td><span>{element.day14}</span></td>
                            <td><span>{element.day15}</span></td>
                            <td><span>{element.day16}</span></td>
                            <td><span>{element.day17}</span></td>
                            <td><span>{element.day18}</span></td>
                            <td><span>{element.day19}</span></td>
                            <td><span>{element.day20}</span></td>
                            <td><span>{element.day21}</span></td>
                            <td><span>{element.day22}</span></td>
                            <td><span>{element.day23}</span></td>
                            <td><span>{element.day24}</span></td>
                            <td><span>{element.day25}</span></td>
                            <td><span>{element.day26}</span></td>
                            <td><span>{element.day27}</span></td>
                            <td><span>{element.day28}</span></td>
                            <td><span>{element.day29}</span></td>
                            <td><span>{element.day30}</span></td>
                            <td><span>{element.day31}</span></td>
                        </tr>
                    </React.Fragment>
                ))}
            </tbody>
        ))

    }, [searchData])

    const setGridView = () => {
        setIsTable((prev) => !prev);
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
                <div className="chart-container">
                    <div className="charts">
                        <StackedBar
                            title="일별 재공 추이도"
                            labels={dailyLabels}
                            datasets={dailyWipTrend}
                        />
                    </div>
                    <div className="chart-menu">
                        <Icon
                            icon={isTable ? "gridOff" : "grid"}
                            size={26}
                            onClick={setGridView}
                        />
                    </div>
                </div>
                {isTable && (
                    <div className="tableForm">
                        <TableForm
                            name="LotStatus"
                            //tableHeaders={tableHeaders}
                            tableHeaders={newTableHeader}
                            tableBodies={tableBodies}
                            CSVHeaders={CSVHeaders}
                            CSVData={searchData}
                            isLookDown={isLookDown}
                            setIsLookDown={setIsLookDown}
                            isDateRange={false}
                            isDatePicker={true}
                            startDate={startDate}
                            endDate={endDate}
                            setStartDate={setStartDate}
                            setEndDate={setEndDate}
                        />
                    </div>
                )}
            </form>
        </S.Container>
    )
}

export default DailyWipTrend;
