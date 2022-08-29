import * as S from './style.TableForm';
import React, {useEffect, useMemo, useRef, useState} from "react";
import { render } from 'react-dom';
import { AgGridReact, AgGridColumn } from 'ag-grid-react'; // the AG Grid React Component

import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS

const GridForm = (() =>{

    return (
        <AgGridReact>
            <AgGridColumn field="make"></AgGridColumn>
            <AgGridColumn field="model"></AgGridColumn>
        </AgGridReact>
    );

})

export default GridForm;