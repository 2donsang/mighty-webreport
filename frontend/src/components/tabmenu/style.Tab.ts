import styled from "styled-components";
import color from "../../styles/color";

export const Container = styled.div<{selected:boolean}>`
  display: flex;
  padding: 10px;
  cursor: pointer;
  font-size: 14px;
  border-right: 1px solid lightgray;
  background : ${(props) => props.selected 
      ? 
          `linear-gradient(to top,#ffffff 0%,#e6e6e6 100%) #ffffff`
      :
          `linear-gradient(to bottom,#ffffff 0%,#e6e6e6 100%) #ffffff`
  };
  ${(props) => props.selected && 
    `border-top: 3px solid blue;`
  }
  .tab-delete{
    margin-left: 2px;
  }
  .tab-delete:hover{
    color: ${color.red};
  }
`;
