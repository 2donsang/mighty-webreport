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
                display : grid;
                grid-template-columns : 300px 300px 300px 1fr;
            }
        }`
        :
        `form{
            display : flex;
            flex-direction : row;
            .condition_container{
                display: flex;
                flex-direction: column;
                gap: 20px;
            }     
        }`
        
    }
`;