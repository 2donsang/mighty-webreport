import styled from "styled-components";

export const Container = styled.div<{isViewAll:boolean}>`
  overflow-y: auto;
  background-color: white;
  ${(props) => props.isViewAll && `
    position : absolute;
    top: 0;
    left: 0;  
    z-index: 10;
    width : 100%;
    overflow: auto;
    height : 1000px;
  `}
  .btn-container{
    margin-left: auto;
    .look-down{
      margin-bottom: -2px;
      margin-right: 4px;
      cursor: pointer;
    }
    .excel-btn{
      margin-right: 10px;
    }
    .search-btn{
      cursor: pointer;
      border: 0;
      background-color: inherit;
      margin-right: 4px;
    }
    .expand-btn{
      cursor: pointer;
    }
    svg:hover{
      opacity: 0.7;
    }
  }
  .result-header{
    display: flex;
    margin-bottom: 10px;
    padding-right: 20px;
  }
`;
