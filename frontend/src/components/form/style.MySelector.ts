import styled from "styled-components";
import color from "../../styles/color";

export const Container = styled.div`
border: 1px solid ${color.lightgray};
//resize: horizontal;
position: relative;
margin-right: 10px;
margin-bottom: 10px;
overflow-x: auto;
overflow-y: hidden;
padding: 10px;
min-width: 230px;
border-radius: 10px;
  .header{
    font-size : 1.1rem;
    margin-bottom: 5px;
  }

`;
