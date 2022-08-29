export interface IMemberTable {

}

export interface ICustomer {
    customer : string;
    customerName : string;
}

export interface IOperation {
    operation : string;
    description : string;
    customer: string;
}

export interface IDevice {
    deviceId : string;
    description : string;
    customer : string;
}

export interface ILotNumber {
    id : string;
    text : string;
}

export interface IPlantTable {
    id : string;
    description? : string | null;
    numberOfShift : number;
    activePlant : string;
    daysPerWeek : number;
    hoursPerDay : number;
    regTime? : string | null;
    regUser? : string | null;
    shiftStartOne? : string | null;
    shiftStartTwo? : string | null;
    shiftStartThree? : string | null;
    shiftStartFour? : string | null;
}

export interface ILotStatus {
    device?: string| null;
    lotNumber?: string| null;
    operation?: string| null;
    operationDesc?: string |null;
    operationCount?:string|null;
    routeCount?:string| null;
    enterOperTime?: string| null;
    qtyOne?: string| null;
    qtyTwo?: string | null;
    customer?: string | null;
    processFlag?: string| null;
    startDate?: string|null;
    endDate?: string|null;
    isOperation?: boolean;
    colSpan? : number;
}

export interface IAVIYield{
    failCodeList?: string| null;
    transTime?: string| null;
    device?: string| null;
    lotNumber?: string| null;
    mainLot?: string| null;
    waferId?: string| null;
    slotId?: string| null;
    turn?: string| null;
    passRate?: number| null;
    qtyGoodDie?: string| null;
    qtyTestDie?: string| null;
    qtyFailDie?: string| null;
    isTranstime?: boolean;
    colSpan?: number;
    isDevice?: boolean;
    colSpanTwo?:number;
    isLotNumber?:boolean;
    colSpanThree?:number;
    isTurn?:boolean;
    colSpanFour?:number;
    cellColor?: string| null;
    isTotal?:boolean;

}

export interface IPTESTYield{
    transTime?: string| null;
    device?: string| null;
    lotNumber?: string| null;
    waferId?: string| null;
    operation?: string| null;
    turn?: string| null;
    yield?: number| null;
    qtyTestDie?: string| null;
    qtyGoodDie?: string| null;
    qtyFailDie?: string| null;
    testDate?: string|null;
    isTranstime?: boolean;
    colSpan?: number;
    isDevice?: boolean;
    colSpanTwo?:number;
    isLotNumber?:boolean;
    colSpanThree?:number;
    isTurn?:boolean;
    colSpanFour?:number;
    cellColor?: string| null;
    isTotal?:boolean;
}

export interface ITotalYield{
    device?: string|null;
    lotNumber?: string|null;
    waferId?: string|null;
    turn?: string|null;
    totalProbe?: string|null;
    passProbe?: string|null;
    failProbe?: string|null;
    yieldProbe?: number|null;
    b2?: string|null;
    b3?: string|null;
    b4?: string|null;
    b5?: string|null;
    b6?: string|null;
    b7?: string|null;
    b8?: string|null;
    totalAvi?: string|null;
    passAvi?: string|null;
    yieldAvi?: number|null;
    shipmentDate?: string|null;
    cumYield?: number|null;
    isTranstime?: boolean;
    colSpan?: number;
    isDevice?: boolean;
    colSpanTwo?:number;
    isLotNumber?:boolean;
    colSpanThree?:number;
    isTurn?:boolean;
    colSpanFour?:number;
    cellColor?: string| null;
    isTotal?:boolean;
}


export interface DateCol {
    rowCount: number;
    TransTime: string;   
    dateYield:number;
    dateTestDie:number;
    dateGoodDie:number;
    dateFailDie:number;
}
export interface DeviceCol{
    rowCount: number;
    TransTime: string;   
    deviceName: string;
    deviceYield: number;
    deviceTestDie: number;
    deviceGoodDie: number;
    deviceFailDie: number;   
}
export interface LotNumberCol{
    rowCount: number;
    TransTime: string;   
    deviceName: string;   
    lotNumber: string;
    lotNumberYield: number,
    lotNumberTestDie: number,
    lotNumberGoodDie: number,
    lotNumberFailDie: number,
}

export interface TurnCol{
    rowCount: number;
    TransTime: string;   
    deviceName: string;   
    lotNumber: string;
    waferId?: string | null;
    operation?: string | null;
    turn : string;
    turnYield: number,
    turnTestDie: number,
    turnGoodDie: number,
    turnFailDie: number,
}

export interface TotalCol{
    rowCount: number;
    rowCountTwo?: number;
    rowCountThree?: number;
    TransTime?: string | null;   
    deviceName: string;   
    lotNumber?: string |null;
    waferId?: string | null;
    turn? : string | null;
    TestDieProbe: number,
    GoodDieProbe: number,
    FailDieProbe: number,
    YieldProbe: number,
    TestDieAvi: number,
    GoodDieAvi: number,
    FailDieAvi?: number | null,
    YieldAvi: number,
    YieldCum:number,
}

