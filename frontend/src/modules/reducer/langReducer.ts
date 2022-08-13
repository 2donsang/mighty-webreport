import * as A from '../action/langAction';

type TLangAction = ReturnType<typeof A.setLangKor> | ReturnType<typeof A.setLangEng>;

interface ILang {
    isKor: boolean;
}

const initialState:ILang = {
    isKor : false,
};

const langReducer = (state:ILang = initialState, action:TLangAction) => {
    switch (action.type) {
        case A.SET_LANG_KOR :
            return {
                 isKor: true,
            };
        case A.SET_LANG_ENG :
            return {
                 isKor: false,
            };
        default :
            return state;
    };
};

export default langReducer;
