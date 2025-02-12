import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import {Bar} from "react-chartjs-2";
import * as S from './style.GroupBar';

export interface IBarDataSet {
    label : string,
    data : number[],
    backgroundColor : string;
}

interface IProps {
    title : string;
    labels : string[];
    datasets : IBarDataSet[];
}

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const StackedBar = ({ title , labels , datasets }:IProps) => {
    const options = {
        
        responsive : true,
        plugins : {
            legend : {
                position : 'bottom' as const,
            },
            title : {
                display : true,
                text : title
            },
            
        }, 
        interaction: {
            mode: 'index' as const,
            intersect: false,
          },      
        scales: {
            x: {
              stacked: true,             
            },
            y: {
              stacked: true,             
            },
          },
    }

    const data = {
        labels,
        datasets
    }

    return (
        <S.Container>
            <Bar
                options={options}
                data={data}
            />
        </S.Container>
    )
}

export default StackedBar;
