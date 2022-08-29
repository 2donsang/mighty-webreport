import styled from "styled-components";
import color from "../../styles/color";
import {TableHeader} from "../../types/type";

export const Container = styled.div<{headers:TableHeader[] , isViewAll:boolean , isLookDown:boolean}>`
  overflow: hidden;
  width: 100%;
  table{
    display: grid;
    overflow: auto;
    border: 1px solid ${color.lightgray};
    height: ${(props) => {
        if(props.isViewAll){
            return `690px`;
        }else if(props.isLookDown){
            return `400px`;
        }else {
            return `690px`;
        }
    }};
    grid-template-columns: ${(props) => (props.headers.map((header)=> {
        return `minmax(${header.width},1fr) `;   
    }))}; 
    grid-template-rows: 30px repeat(auto-fill, 20px);
  }

  table thead,
  table tbody,
  table tr {
    display: contents;
  }
  
  table th {
    width: 100%;
    position: sticky;
    top: 0;
    color: ${color.white};
    background-color: ${color.darkBlue};
    border: 1px solid black;
  }
  
  table th{
    height: 30px;
  }
  
  table th,
  table td {
    font-size: 14px;
    text-align: left;
    padding: 4px 4px;
  }
  
  table th span,
  table td span {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    display: block;
  }

  table tr td {
    border-bottom: 1px solid #ccc;
  }
  
  table tbody tr:nth-child(2n-1) td{
    background: ${color.ghost};
  }

  table tbody tr:nth-child(2n) td{
    background: ${color.white};
  }
  
  & .resize-handle {
    display: block;
    position: absolute;
    cursor: col-resize;
    width: 7px;
    right: 0;
    top: 0;
    z-index: 1;
    border-right: 2px solid transparent;
  }

  & .resize-handle:hover {
    border-color: #ccc;
  }

  & .resize-handle.active {
    border-color: #517ea5;
  }

  .td-operation{
    background: ${color.lavender} !important;
  }
  .td-total{
    background: ${color.gray} !important;
  }
  
`;
