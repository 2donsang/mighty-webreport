import React from 'react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Icon from '../../components/common/Icon';
import StackedBar from '../../components/common/StackedBar';
import GroupBar from '../../components/common/GroupBar';
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
    operationDesc: string;
    day1:string; day11:string; day21:string;
    day2:string; day12:string; day22:string;
    day3:string; day13:string; day23:string;
    day4:string; day14:string; day24:string;
    day5:string; day15:string; day25:string;
    day6:string; day16:string; day26:string;
    day7:string; day17:string; day27:string;
    day8:string; day18:string; day28:string;
    day9:string; day19:string; day29:string;
    day10:string; day20:string; day30:string; day31:string;

}

//const labels: string[] = ['4"_M1 Scratch', '6"_Crack', '6"Chip', '6"_Scratch', 'test', '합계'];
const dailyLabels: string[] = [];


const DailyWipTrend = () => {
    const langState = useSelector((state: RootState) => state.langReducer);

    const tableHeaders: TableHeader[] = [
        { text: langState.isKor? "공정" : "Operation" , width: "160px" },
        { text: langState.isKor? "1일" : "1st" , width: "80px" },
        { text: langState.isKor? "2일" : "2nd"   , width: "80px" },
        { text: langState.isKor? "3일" : "3rd"  , width: "80px" },
        { text: langState.isKor? "4일" : "4th"  , width: "80px" },
        { text: langState.isKor? "5일" : "5th"  , width: "80px" },
        { text: langState.isKor? "6일" : "6th"  , width: "80px" },
        { text: langState.isKor? "7일" : "7th"  , width: "80px" },
        { text: langState.isKor? "8일" : "8th"  , width: "80px" },
        { text: langState.isKor? "9일" : "9th"  , width: "80px" },
        { text: langState.isKor? "10일" : "10th"  , width: "80px" },
        { text: langState.isKor? "11일" : "11th"  , width: "80px" },
        { text: langState.isKor? "12일" : "12th"  , width: "80px" },
        { text: langState.isKor? "13일" : "13th"  , width: "80px" },
        { text: langState.isKor? "14일" : "14th"  , width: "80px" },
        { text: langState.isKor? "15일" : "15th"  , width: "80px" },
        { text: langState.isKor? "16일" : "16th"  , width: "80px" },
        { text: langState.isKor? "17일" : "17th"  , width: "80px" },
        { text: langState.isKor? "18일" : "18th"  , width: "80px" },
        { text: langState.isKor? "19일" : "19th"  , width: "80px" },
        { text: langState.isKor? "20일" : "20th"  , width: "80px" },
        { text: langState.isKor? "21일" : "21th"  , width: "80px" },
        { text: langState.isKor? "22일" : "22th"  , width: "80px" },
        { text: langState.isKor? "23일" : "23th"  , width: "80px" },
        { text: langState.isKor? "24일" : "24th"  , width: "80px" },
        { text: langState.isKor? "25일" : "25th"  , width: "80px" },
        { text: langState.isKor? "26일" : "26th"  , width: "80px" },
        { text: langState.isKor? "27일" : "27th"  , width: "80px" },
        { text: langState.isKor? "28일" : "28th"  , width: "80px" },
        { text: langState.isKor? "29일" : "29th"  , width: "80px" },
        { text: langState.isKor? "30일" : "30th"  , width: "80px" },
        { text: langState.isKor? "31일" : "31th"  , width: "80px" },
    ];

    const CSVHeaders: CSVHeader[] = [
        { label: langState.isKor? "공정" : "Operation"  , key: "operationDesc" },
        { label: langState.isKor? "1일" : "1st" , key: "day1" },
        { label: langState.isKor? "2일" : "2nd" , key: "day2" },
        { label: langState.isKor? "3일" : "3rd" , key: "day3" },
        { label: langState.isKor? "4일" : "4th" , key: "day4" },
        { label: langState.isKor? "5일" : "5th" , key: "day5" },
        { label: langState.isKor? "6일" : "6th" , key: "day6" },
        { label: langState.isKor? "7일" : "7th" , key: "day7" },
        { label: langState.isKor? "8일" : "8th" , key: "day8" },
        { label: langState.isKor? "9일" : "9th" , key: "day9" },
        { label: langState.isKor? "10일" : "10th", key: "day10" },
        { label: langState.isKor? "11일" : "11th", key: "day11" },
        { label: langState.isKor? "12일" : "12th", key: "day12" },
        { label: langState.isKor? "13일" : "13th", key: "day13" },
        { label: langState.isKor? "14일" : "14th", key: "day14" },
        { label: langState.isKor? "15일" : "15th", key: "day15" },
        { label: langState.isKor? "16일" : "16th", key: "day16" },
        { label: langState.isKor? "17일" : "17th", key: "day17" },
        { label: langState.isKor? "18일" : "18th", key: "day18" },
        { label: langState.isKor? "19일" : "19th", key: "day19" },
        { label: langState.isKor? "20일" : "20th", key: "day20" },
        { label: langState.isKor? "21일" : "21th", key: "day21" },
        { label: langState.isKor? "22일" : "22th", key: "day22" },
        { label: langState.isKor? "23일" : "23th", key: "day23" },
        { label: langState.isKor? "24일" : "24th", key: "day24" },
        { label: langState.isKor? "25일" : "25th", key: "day25" },
        { label: langState.isKor? "26일" : "26th", key: "day26" },
        { label: langState.isKor? "27일" : "27th", key: "day27" },
        { label: langState.isKor? "28일" : "28th", key: "day28" },
        { label: langState.isKor? "29일" : "29th", key: "day29" },
        { label: langState.isKor? "30일" : "30th", key: "day30" },
        { label: langState.isKor? "31일" : "31th", key: "day31" },
    
    ];

    // 제품, LOT 번호, 공정, LOT Status
    const [isLookDown, setIsLookDown] = useState(true);
    const [devices, setDevices] = useState<ISearchBox[]>([]);
    const [checkedDevices, setCheckedDevices] = useState<ISearchBox[]>([]);
    const [lotNumbers, setLotnumbers] = useState<ISearchBox[]>([]);
    const [checkedLotNumbers, setCheckedLotNumbers] = useState<ISearchBox[]>([]);
    const [operations, setOperations] = useState<ISearchBox[]>([]);
    const [checkedOperations, setCheckedOperations] = useState<ISearchBox[]>([]);
    const [isTable, setIsTable] = useState(true);
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

            const res = await ApiUtil.post("/search/daily-wip-trend", params);
            //debugger
            
            if (res.data.dailyWipTrend.length == 0) {
                if(langState.isKor)
                {
                    dispatch(showAlertModal("확인메세지","데이터","가 없습니다."));
                }else{
                    dispatch(showAlertModal("Information","Data"," does not exist."));
                }
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

    useEffect(() =>{
            // //그리드 컬럼해더 세팅
            // newTableHeader.splice(0, newTableHeader.length);
            // newTableHeader.push({ text: "공정", width: "130px" });
            // dailyWipColumnNames.map((element) => {
            //     newTableHeader.push({
            //         text: element.naturalDate,
            //         width: "100px"
            //     })
            // })
            // setNewTableHeader(newTableHeader);
    },[dailyWipColumnNames])

    useEffect(() => {
        dailyWipTrend.splice(0, dailyWipTrend.length);
        searchData.map((element, index) => {
            dailyWipTrend.push({
                label: element.operationDesc,
                data: [
                    +element.day1, 
                    +element.day2, 
                    +element.day3, 
                    +element.day4, 
                    +element.day5,
                    +element.day6, 
                    +element.day7, 
                    +element.day8,
                    +element.day9, 
                    +element.day10,
                    +element.day11, 
                    +element.day12, 
                    +element.day13, 
                    +element.day14, 
                    +element.day15,
                    +element.day16, 
                    +element.day17, 
                    +element.day18, 
                    +element.day19, 
                    +element.day20,
                    +element.day21, 
                    +element.day22, 
                    +element.day23, 
                    +element.day24, 
                    +element.day25,
                    +element.day26, 
                    +element.day27, 
                    +element.day28, 
                    +element.day29, 
                    +element.day30,
                    +element.day31,],
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
            operationDesc: "Total",
            day1: day1.toString(),
            day2: day2.toString(),
            day3: day3.toString(),
            day4: day4.toString(),
            day5: day6.toString(),
            day6: day7.toString(),
            day7: day8.toString(),
            day8: day9.toString(),
            day9: day9.toString(),
            day10: day10.toString(),
            day11: day11.toString(),
            day12: day12.toString(),
            day13: day13.toString(),
            day14: day14.toString(),
            day15: day15.toString(),
            day16: day16.toString(),
            day17: day17.toString(),
            day18: day18.toString(),
            day19: day19.toString(),
            day20: day20.toString(),
            day21: day21.toString(),
            day22: day22.toString(),
            day23: day23.toString(),
            day24: day24.toString(),
            day25: day25.toString(),
            day26: day26.toString(),
            day27: day27.toString(),
            day28: day28.toString(),
            day29: day29.toString(),
            day30: day30.toString(),
            day31: day31.toString(),
        })

        //1000자리 구분자 넣기
        searchData.map((element,index) =>{
            element.day1 = (+element.day1).toLocaleString();
            element.day2 = (+element.day2).toLocaleString();
            element.day3 = (+element.day3).toLocaleString();
            element.day4 = (+element.day4).toLocaleString();
            element.day5 = (+element.day5).toLocaleString();
            element.day6 = (+element.day6).toLocaleString();
            element.day7 = (+element.day7).toLocaleString();
            element.day8 = (+element.day8).toLocaleString();
            element.day9 = (+element.day9).toLocaleString();
            element.day10 = (+element.day10).toLocaleString();
            element.day11 = (+element.day11).toLocaleString();
            element.day12 = (+element.day12).toLocaleString();
            element.day13 = (+element.day13).toLocaleString();
            element.day14 = (+element.day14).toLocaleString();
            element.day15 = (+element.day15).toLocaleString();
            element.day16 = (+element.day16).toLocaleString();
            element.day17 = (+element.day17).toLocaleString();
            element.day18 = (+element.day18).toLocaleString();
            element.day19 = (+element.day19).toLocaleString();
            element.day20 = (+element.day20).toLocaleString();
            element.day21 = (+element.day21).toLocaleString();
            element.day22 = (+element.day22).toLocaleString();
            element.day23 = (+element.day23).toLocaleString();
            element.day24 = (+element.day24).toLocaleString();
            element.day25 = (+element.day25).toLocaleString();
            element.day26 = (+element.day26).toLocaleString();
            element.day27 = (+element.day27).toLocaleString();
            element.day28 = (+element.day28).toLocaleString();
            element.day29 = (+element.day29).toLocaleString();
            element.day30 = (+element.day30).toLocaleString();
            element.day31 = (+element.day31).toLocaleString();
            
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
                <div className='condition_chart'>
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
                                title= {langState.isKor? "일자별 재공 추이도" : "Daily Wip Trend"}
                                labels={dailyLabels}
                                datasets={dailyWipTrend}
                            />
                              {/* <GroupBar
                                title= {langState.isKor? "일자별 재공 추이도" : "Daily Wip Trend"}
                                labels={dailyLabels}
                                datasets={dailyWipTrend}
                            /> */}
                        </div>
                        <div className="chart-menu">
                            <Icon
                                icon={isTable ? "gridOff" : "grid"}
                                size={26}
                                onClick={setGridView}
                            />
                        </div>
                    </div>
                </div>
                {isTable && (
                    <div className="tableForm">
                        <TableForm
                            name="DailyWipTrend"
                            tableHeaders={tableHeaders}
                            //tableHeaders={newTableHeader}
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
