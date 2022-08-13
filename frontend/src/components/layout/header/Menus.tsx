import * as S from './style.Menus';
import {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {RootState} from "../../../modules";
import Menu from "./Menu";

const Menus = () => {

    const [menus,setMenus] = useState([]);
    const langState = useSelector((state:RootState) => state.langReducer);

    useEffect(()=>{
        console.log(JSON.parse(localStorage.getItem("menus") || ""));
        setMenus(JSON.parse(localStorage.getItem("menus") || ""));
        console.log("로그인후 langState는 ? "+langState.isKor);
    },[]);


    return (
        <S.Container>
            {menus.map((menu : any) => (               
                <div key={menu.menuId} className='menu-parent'>
                    {langState.isKor ? menu.menuNameKor : menu.menuNameEng }
                    <div className='menu-children'>
                        {menu.child.map((child : any) => (
                            <Menu
                                key={child.menuId}
                                menuName={child.menuNameEng}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </S.Container>
    );
}

export default Menus;
