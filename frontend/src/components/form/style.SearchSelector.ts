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
  .change-container{
    cursor: pointer;
    .change{
      position: absolute;
      top: 6px;
      right: 14px;
    }
    span {
      position: absolute;
      width: 22px;
      top: 24px;
      right: 14px;
      font-size: 3px;
    }
  }
  .change-container:hover{
    opacity: 0.7;
  }
  .search-box{
    position: relative;
    margin-bottom: 10px;
    input{
      padding: 0 20px;
      border: 2px solid ${color.lightgray};
      border-radius: 10px;
      width: 100%;
      height: 30px;
      outline: 0;
    }
    .focus{
      border-radius: 10px 10px 0px 0px;
      border-bottom: 2px solid ${color.lightgray};
    }
    ul{
      background-color: white;
      position: absolute;
      width: 100%;
      max-height: 80px;
      overflow-y: auto;
      z-index: 1;
      list-style-position:inside;
      border-left: 2px solid ${color.lightgray};
      border-right: 2px solid ${color.lightgray};
      border-bottom: 2px solid ${color.lightgray};
      border-radius: 0px 0px 10px 10px;
      justify-content: center;
      li{
        width: 100%;
        overflow-x: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        cursor: pointer;
        padding-left: 20px;
        height: 20px;
        bold{
          color: ${color.red};
        }
      }
      li.focus-item{
        background-color: ${color.lightgray};
      }
      li:hover{
        background-color: ${color.lightgray};
      }
    }
    .search{
      left: 4px;
      top: 8px;
      position: absolute;
    }
    .delete-input{
      cursor: pointer;
      right: 20px;
      top: 10px;
      z-index: 1;
      position: absolute;
    }
  }
  .selected-list{
    border: 2px solid ${color.lightgray};
    border-radius: 10px;
    height: 60px;
    width: 100%;
    overflow-y: auto;
    list-style-position:inside;
    li{
      cursor: pointer;
      padding: 2px 10px;
      overflow-x: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    li.focus-item{
      background-color: ${color.lightgray};
    }
    li.delete-all{
      text-align: center;
      color: #ea3847;
    }
  }

`;
