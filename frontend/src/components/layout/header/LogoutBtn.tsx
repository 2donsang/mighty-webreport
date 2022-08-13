import * as S from './style.LogoutBtn';
import Icon from "../../common/Icon";
import {useNavigate} from "react-router-dom";
import {useDispatch} from "react-redux";
import {setLogOut} from "../../../modules/action/authAction";

const LogoutBtn = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const onClick = () => {
        dispatch(setLogOut());
        localStorage.removeItem('auth-token');
        navigate("/login");
    }

    const Logout = () => (<Icon icon="logout" size={25} />);

    return (
        <S.Container onClick={onClick}>
            <Logout />
        </S.Container>
    );
}

export default LogoutBtn;
