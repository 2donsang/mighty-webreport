import styled from "styled-components";
import color from "../../styles/color";

export const Container = styled.div<{isLookDown:boolean}>`
  width: 100%;
  height: 100%;
  position: relative;
  .test-degree-container{
    border: 1px solid ${color.lightgray};
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    margin-bottom: 10px;
    margin-right: 10px;
    .test-type{
      padding: 10px;
      label {
        padding-right: 10px;
      }
      select{
        width: 80px;
        border : 1px solid ${color.lightgray};
      }
    }
    .degree{
      padding: 10px;
      div:nth-child(1){
        label{
          padding-right: 10px;
        }
        input{
          width: 80px;
          border: 1px solid ${color.lightgray};
        }
        margin-bottom: 10px;
      }
    }  
    div:nth-child(3){
      padding: 10px;
    }
  }
  ${(props) => props.isLookDown
          ?
          `form{
          display: flex;
          flex-direction: column;
          .condition-container{
            display: flex;

          }
      }`
          :
          `form{
          display: flex;
          .condition-container{
            display: flex;
            flex-direction: column;
            gap: 20px;
          }
      }`
  }
`;
