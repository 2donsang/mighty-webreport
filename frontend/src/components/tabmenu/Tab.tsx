import * as S from './style.Tab';
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../modules";
import {setTabList, focusTabList} from "../../modules/action/tabMenuAction";
import {MouseEventFunction} from "../../types/type";


interface IProps {
    selected : boolean;
    label : string;
    labelKor : string;
    onClick : MouseEventFunction;
}

const Tab = ({selected , label , labelKor , onClick}:IProps) => {

    const tabList = useSelector((state:RootState)=>state.tabMenuReducer);
    const langState = useSelector((state:RootState) => state.langReducer);
    const dispatch = useDispatch();
    const onDelete = (event:React.MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
        const index = tabList.findIndex((element)=>element.label === label);
        if(index !== -1) {
            tabList.splice(index,1);
            dispatch(setTabList([...tabList]));
        }
    }

    return (
        <S.Container
            selected={selected}
            onClick={onClick}
        >
            <div
                className='tab-label'
            >
                {langState.isKor ? labelKor : label}
            </div>
            <div
                className='tab-delete'
                onClick={onDelete}
            >
                &nbsp;X
            </div>
        </S.Container>
    );
}

export default Tab;
