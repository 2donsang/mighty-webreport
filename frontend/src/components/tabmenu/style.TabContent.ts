import styled from "styled-components";

export const Container = styled.div<{selected:boolean}>`
  overflow-y: auto;
  // height: auto;
  height: 1100px;
  ${(props)=> props.selected 
          ?
          `display: block;`
          :
          `display: none;`
    }
`;
