import * as S from './style.Header';
import LogoutBtn from "./LogoutBtn";
import {useSelector} from "react-redux";
import {RootState} from "../../../modules";
import {Link} from "react-router-dom";
import Menus from "./Menus";
import Language from "./Language";
import DarkToggle from "./DarkToggle";

const Header = () => {
    const authState = useSelector((state:RootState) => state.authReducer);

    return(
        <S.Container>
            <div className='header'>
                <div>
                    <a href="/">
                        <img
                            src={require("../../../assets/img/sub_logo_sawnics.jpg")}
                            alt="logo"
                        />
                    </a>
                </div>
                {authState.isLogin
                    ?
                    (<div className='nav-container'>
                        <div className='logout-container'>
                            {/* <DarkToggle /> */}
                            <Language />
                            <LogoutBtn />
                        </div>
                        <div className='menu-container'>
                            <Menus />
                        </div>
                    </div>)
                    : null }
            </div>
        </S.Container>
    );
};

export default Header;
