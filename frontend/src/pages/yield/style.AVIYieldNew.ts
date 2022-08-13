import styled from "styled-components";

export const Container = styled.div<{isLookDown:boolean}>`
    width: 100%;
    height: 100%;
    position: relative;
    ${(props) => props.isLookDown ?
        `form{
            display : flex;
            flex-direction : column;
            .condition_container{               
                // display : grid;
                //   grid-template-columns : repeat(4, 1fr);
                // //gap: 20px 20px;
                // div:nth-child(3){
                //     grid-column: 3/3;
                //     grid-row : 1/2;
                // }
                display: flex;
            }
        }`
        :
        `form{
            display : flex;
            flex-direction : row;
            .condition_container{
                display : grid;
                grid-template-columns : 1fr;
                //gap: 20px 20px;
                grid-template-rows: repeat(4, minmax(100px, auto));
                // div:nth-child(3){
                //     grid-column-start : 1;
                //     grid-column-end : 3;
                // }
            }     
        }`
        
    }
`;