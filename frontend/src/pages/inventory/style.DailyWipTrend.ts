import styled from "styled-components";

export const Container = styled.div<{isLookDown:boolean}>`
    width: 100%;
    height: 100%;
    position: relative;
    ${(props) => props.isLookDown ?
        `form{
            display : flex;
            flex-direction : column;
            .condition_chart{
                display : flex;
                flex-directon : row;
            }
            .condition_container{               
                display : grid;
                grid-template-columns : repeat(1, 1fr);
                grid-template-rows : repeat(3, 1fr);
                div:nth-child(2){
                    grid-column: 1/2;
                    grid-row : 2/3;
                }
                div:nth-child(3){
                    grid-column: 1/2;
                    grid-row : 3;
                }
            }
            .tableForm{
                height:auto;
            }
        }`   
        :
        `form{
            display : flex;
            flex-direction : column-reverse;
            .condition_container{
                visibility: hidden;
                height : 0px;
                } 
        }`
    }

    .chart-container{
        ${(props) => props.isLookDown ?
            `
            padding-top: 20px;
            padding-left: 80px;
            ` 
            : 
            `padding-left: 400px;` 
        };
        .chart-menu{    
        text-align: right;
        margin-right: 22px;
        svg {
            cursor: pointer;
        }
        svg:hover {
            opacity: 0.7;
        }
        }
        .charts {
        display: flex;
        flex-direction: ${(props) => props.isLookDown ?`column` : `row` };
        justify-content: space-between;
        align-items : center;
        width : auto;
        }  
    }
`;