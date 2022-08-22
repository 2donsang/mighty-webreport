import * as S from './style.Login';
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Icon from "../../components/common/Icon";
import color from "../../styles/color";
import Select from "../../components/common/Select";
import {useEffect, useState} from "react";
import {LoginUtil} from "../../utils/ApiUtil";
import {Option} from "../../types/type";
import {IPlantTable} from "../../types/userData";
import {useDispatch} from "react-redux";
import {showAlertModal} from "../../modules/action/alertAction";
import {useNavigate} from "react-router-dom";
import {setLogIn} from "../../modules/action/authAction";
import useTitle from "../../utils/UseHooks";
import { useSelector } from 'react-redux';
import { RootState } from '../../modules';

const Login = () => {
    const langState = useSelector((state:RootState) => state.langReducer);
    
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [userId,setUserId] = useState("");
    const [password,setPassword] = useState("");
    const [plant,setPlant] = useState("");
    const [plants,setPlants] = useState<Array<Option>>([{text: "PLANT", value: "NotC"}]);

    const onChangeId = (event : React.ChangeEvent<HTMLInputElement>) => {
        const regExp = /[{}[\]/?.,;:|)*~`!^\\-_+┼<>@#$%&'"(=]/gi;
        if(regExp.test(event.target.value)){
            return;
        }
        setUserId(event.target.value.toUpperCase());
    }

    const onChangePassword = (event : React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
    }

    const onChangeSelect = (event : React.ChangeEvent<HTMLSelectElement>) => {
        setPlant(event.target.value);
    }

    const onSubmit = (event : React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const user : object = {
            id : userId,
            password : password,
            plant : plant
        };

        async function callAPI(){
            await LoginUtil.post("/auth/signin", user)
                .then((res)=>{
                    if(res.headers.code==="000"){
                        if(langState.isKor){
                            dispatch(showAlertModal('경고 메세지','비밀번호','가 틀렸습니다.',undefined));
                        }else{
                            dispatch(showAlertModal('Warning Message','The password is incorrect.','',undefined));
                        }
                        
                    }else if(res.headers.code==="020" && res.data.token!==undefined){
                        localStorage.setItem('auth-token' , res.data.token);
                        localStorage.setItem('menus' , JSON.stringify(res.data.menus));
                        dispatch(setLogIn());
                        navigate("/")
                    }else if(res.headers.code==="006") {
                        if(langState.isKor){
                            dispatch(showAlertModal('경고 메세지','권한','이 존재하지 않습니다.',undefined));
                        }else{
                            dispatch(showAlertModal('Warning Message','You do not have permission.','',undefined));
                        }
                        
                    }else {
                        if(langState.isKor){
                            dispatch(showAlertModal('경고 메세지','','알 수 없는 문제가 발생했습니다.',undefined));
                        }else{
                            dispatch(showAlertModal('Warning Message','','An unknown problem has occurred.',undefined));
                        }
                        
                    }
                })
                .catch((error)=>{
                    if(langState.isKor){
                        dispatch(showAlertModal('경고 메세지','','알 수 없는 문제가 발생했습니다.',undefined));
                    }else{
                        dispatch(showAlertModal('Warning Message','','An unknown problem has occurred.',undefined));
                    }
                });
        }

        callAPI();
    };

    useTitle(" : 로그인");

    useEffect(()=>{
        const removeBlankId : string = userId.replace(/ /g,"");
        if(removeBlankId === ""){
            return
        }
        async function callAPI(){
            const res = await LoginUtil.get(
                "/auth/plant",
                {
                    params : {
                        userId : removeBlankId
                    }
            });
            if(res.data.length===0){
                setPlants([{text: "PLANT", value: "NotC"}]);
                return;
            }else{
                setPlants([]);
                res.data.map((data : IPlantTable) => {
                    return setPlants((prev) => {
                        return [...prev,
                            {
                                text : data.id,
                                value : data.id
                            }]
                    });
                });
            }
        }
        callAPI();
    },[userId])

    useEffect(()=>{
        if(plants[0].text==="PLANT"
            &&plants[0].value==="NotC"){
            setPlant("");
            return
        }
        setPlant(plants[0].text);
    },[plants])

    useEffect(()=>{
        const URLSearch = new URLSearchParams(window.location.search);
        const error:string|null = URLSearch.get("error");
        if(error==="token-error"){
            dispatch(showAlertModal("경고 메세지","인증","이 만료되었습니다."));
        }

    },[]);

    const svgSize : number = 20;
    const svgColor = color.gray;
    const Account = () => (<Icon icon="account" size={svgSize} color={svgColor} />)
    const Lock = () => (<Icon icon="lock" size={svgSize} color={svgColor} />)
    const Factory = () => (<Icon icon="factory" size={20} />);

    return (
        <S.Container>
            <div className='form-container'>
                <form onSubmit={onSubmit} className="login-form">
                    <div className="form-title">
                        <h2 className="form-title">로그인</h2>
                    </div>
                    <Input
                        onChange={onChangeId}
                        name="id"
                        value={userId}
                        svg={<Account />}
                        place="아이디를 입력해주세요"
                        required={true}
                        autoFocus={true}
                    />
                    <Input
                        onChange={onChangePassword}
                        name="password"
                        value={password}
                        svg={<Lock />}
                        place="비밀번호를 입력해주세요"
                        required={true}
                        type="password" />
                    <Select
                        options={plants}
                        onChange={onChangeSelect}
                        svg={<Factory />}
                    />
                    <div className="button-container">
                        <Button
                            disabled={plant===""||password===""}
                            color={color.babyBlue}
                            text="로그인"
                        />
                    </div>
                </form>
            </div>
        </S.Container>
    );
}

export default Login;
