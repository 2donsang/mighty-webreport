import * as S from "./style.SearchSelector";
import {ISearchBox} from "../../types/type";
import React, {useEffect, useRef, useState} from "react";
import Icon from "../common/Icon";
import {useSelector} from "react-redux";
import {RootState} from "../../modules";

interface IProps {
    title : string;
    list : ISearchBox[];
    selected : ISearchBox[];
    selector :  React.Dispatch<React.SetStateAction<ISearchBox[]>>;
    hasDesc? : boolean;
}

const SearchSelector = ({ title , list , selected, selector, hasDesc = false} : IProps) => {

    const [search,setSearch] = useState("");
    const [searched,setSearched] = useState<ISearchBox[]>([]);
    const [showText,setShowText] = useState(false);
    const [focus,setFocus] = useState(false);
    const [searchBoxFocusItem,setSearchBoxFocusItem] = useState(-1);
    const [resultBoxFocusItem,setResultBoxFocusItem] = useState(-1);
    const langState = useSelector((state:RootState) => state.langReducer );

    const searchedRef = useRef<HTMLUListElement>(null);


    const onChange = (event : React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value);
    }

    const onSelect = (event : React.MouseEvent<HTMLLIElement>) => {
        if(event.currentTarget instanceof Element){
            const index : number = list.findIndex((element)=> element.id === event.currentTarget.id );
            select(list[index].id, list[index].text);
        }
    }

    const onFocus = () => {
        setSearched(list.filter(isSearched));
        if(list.filter(isSearched).length !== 0 ){
            setFocus(true);
        }
    }

    const onBlur = (event : React.FocusEvent<HTMLInputElement>) => {
        setFocus(false);
    }

    const deleteInput = () => {
        setSearch("");
    }

    const onKeyDown = (event : React.KeyboardEvent<HTMLInputElement>) => {
        if(searched.length===0 || event.key === "Escape"){
            setFocus(false);
        }else if(event.key === "ArrowDown"){
            event.preventDefault();
            setSearchBoxFocusItem((prev)=>{
                if(prev >= searched.length-1) {
                    // @ts-ignore
                    searchedRef.current.scrollTop = 0;
                    return 0;
                }
                if(searchedRef.current!==null &&
                    (prev*20 - searchedRef.current.scrollTop >120 ||
                    searchedRef.current.scrollTop - prev*20 >30)){
                    searchedRef.current.scrollTop = prev*20-128;
                }
                return prev + 1;
            });
            setFocus(true);
        }else if(event.key === "ArrowUp"){
            event.preventDefault();
            setSearchBoxFocusItem((prev)=>{
                if(prev <= 0) {
                    // @ts-ignore
                    searchedRef.current.scrollTop = searchedRef.current.scrollHeight;
                    return searched.length-1;
                }
                if(searchedRef.current!==null &&
                    (prev*20 - searchedRef.current.scrollTop >=160 ||
                        searchedRef.current.scrollTop - prev*20 >=-10)){
                    searchedRef.current.scrollTop = prev*20-20;
                }
                return prev-1;
            });
            setFocus(true);
        }else if(event.key === "Enter"){
            if( searchBoxFocusItem === -1) {
                select(searched[0].id,
                    searched[0].text);
            }else{
                select(searched[searchBoxFocusItem].id,
                    searched[searchBoxFocusItem].text);
            }
        } else{
            setSearchBoxFocusItem(-1);
            setFocus(true);
        }
    }

    const isSearched = (element : ISearchBox) => {
        return !selected.find((item) => item.id === element.id) && (
            showText ? element.id.toUpperCase().includes(search.toUpperCase())
            : element.text.toUpperCase().includes(search.toUpperCase()));
    }

    const textEffect = (text : string ) => {
        if(search===""){
            return text;
        }
        const indexes = text.toUpperCase().matchAll(new RegExp(search.toUpperCase(),'gi'));
        let result = text;
        let count : number = 0;
        while (true){
            const {value,done}  = indexes.next();
            if(done) break;
            result = [
                // @ts-ignore
                result.slice(0,value.index+count*13),
                "<bold>",
                // @ts-ignore
                result.slice(value.index+count*13,value.index+search.length+count*13),
                "</bold>",
                // @ts-ignore
                result.slice(value.index+search.length+count*13)].join('');
            count++;
        }
        return result;
    }

    const select = ( id : string , text : string) => {
        selector((prev) => {
            return [...prev,
                {
                    id : id,
                    text : text,
                }]
        });
        setSearched(list.filter(isSearched));
        setSearchBoxFocusItem(-1);
        setFocus(false);
    }

    const onDelete = (event : React.MouseEvent<HTMLLIElement>) => {
        setResultBoxFocusItem(-1);
        if(event.currentTarget instanceof Element){
            selector(
                selected.filter(value => value.id !== event.currentTarget.id)
            );
            setSearched(list.filter(isSearched));
        }
    }

    const deleteAll = () => {
        setResultBoxFocusItem(-1);
        selector([]);
    }

    useEffect(()=>{
        setSearched(list.filter(isSearched));
    },[list,search,selected])

    useEffect(()=>{
        if(searched.length===0){
            setFocus(false);
        }
    },[searched])

    useEffect(()=>{
        selector([]);
    },[list])

    const ChangeIcon = () => (<Icon icon="change" size={20} className='change'/>)
    const SearchIcon = () => (<Icon icon="search" size={15} className='search'/>)
    const XIcon = () => (<Icon icon="x" size={10} className='delete-input' onClick={deleteInput}/>);

    return (
        <S.Container>
            <div className='header'>
                {title}
            </div>
            {
                hasDesc &&
                (<div
                    className='change-container'
                    onClick={()=>setShowText((prev)=>!prev)}
                >
                    <ChangeIcon />
                    <span>{showText ? "name" : "desc"}</span>
                </div>)
            }

            <div className='search-box'>
                <SearchIcon />
                {search !== "" && (<XIcon />)}
                <input
                    type="text"
                    value={search}
                    placeholder="Search..."
                    onChange={onChange}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    onKeyDown={onKeyDown}
                    className={focus ? "focus" : undefined}
                />
                {focus && (
                <ul
                    ref={searchedRef}
                >
                    {searched.map((element,index)=>
                        (
                            <li
                                id={element.id}
                                key={element.id}
                                dangerouslySetInnerHTML={showText ? {__html: textEffect(element.id)} : {__html: textEffect(element.text)} }
                                onMouseDown={onSelect}
                                className={index===searchBoxFocusItem ? "focus-item" : undefined}
                            >
                            </li>
                                
                        )
                    )}
                </ul>)}
            </div>
            <ul className='selected-list'>
                {selected.map((element,index)=>(
                    <li
                        id={element.id}
                        key={element.id}
                        onDoubleClick={onDelete}
                        onClick={()=>setResultBoxFocusItem(index)}
                        className={resultBoxFocusItem===index ? "focus-item" : undefined}
                    >
                        {showText ? element.id : element.text}
                    </li>
                ))}
                {selected.length > 1 && (
                    <li
                        className={resultBoxFocusItem === selected.length ? "focus-item delete-all" : "delete-all"}
                        onDoubleClick={deleteAll}
                        onClick={()=>setResultBoxFocusItem(selected.length)}
                    >
                        {langState.isKor ? "전체삭제" : "Delete All"}
                    </li>
                )}
            </ul>
        </S.Container>
    );
};

export default SearchSelector;
