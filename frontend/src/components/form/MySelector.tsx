import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import ReactSelect, { components as RSComponents }  from "react-select";
import { ISearchBox, TableHeader, CSVHeader, IDropDown } from '../../types/type';


const MySelect = ({title,options, selected, setSelected }:any) => {

  const [selectedOption, setSelectedOption] = useState([]);

  
  const multiValueContainer = ({selectProps, data}:any) => {
    const label = data.label;
    const allSelected = selectProps.value;
    //@ts-ignore
    const index = allSelected.findIndex(selected => selected.label === label);
    const isLastSelected = index === allSelected.length - 1;
    const labelSuffix = isLastSelected ? ` (${allSelected.length})` : ", ";
    const val = `${label}${labelSuffix}`;
    return val;
  };

  const customStyles = {
    valueContainer: (provided:any, state:any) => ({
      ...provided,
      //textOverflow: "ellipsis",
      maxWidth: "95%",
      whiteSpace: "nowrap",
      overflow: "hidden",
      display: "initial"
    }),
    option: (styles:any, { data, isDisabled, isFocused, isSelected }:any) => {
      
      console.log({ data, isDisabled, isFocused, isSelected });
      return {
        ...styles,
        backgroundColor: isSelected ? "#999999" : "white",
        color: "#333333"
      };
    }
  };


  const handleChange = (newValue:any) => {
    setSelected(newValue);
  };

  return (
      <div className="App">
        <div className='header'>
          {title}
        </div>
        <ReactSelect
          defaultValue={selectedOption}
          //@ts-ignore
          onChange={handleChange}
          options={options}
          closeMenuOnSelect={false}
          hideSelectedOptions={false}
          isMulti={true}
          //controlShouldRenderValue={false}
          isSearchable={true}
          components={{
            //@ts-ignore    
            MultiValueContainer: multiValueContainer
          }}
          styles={customStyles}
        />
      </div>
  );


};


export default MySelect;
