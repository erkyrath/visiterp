import React from 'react';
import { useState, useContext, useEffect, useRef } from 'react';

import { find_sourceloc_for_id } from './gamedat';

import { ReactCtx } from './context';
import { ResultItem, set_search_term } from './search';

type SearchFieldCallback = (has_focus?: boolean, has_term?: boolean) => void;
export type SearchFieldRock = {
    callback: SearchFieldCallback | null;
};

export function SearchField({ updatefunc }:{ updatefunc:SearchFieldCallback })
{
    let inputref = useRefInput();

    function evhan_focus(focus: boolean) {
        let hasterm = ((inputref.current && inputref.current.value.length) ? true : false);
        updatefunc(focus, hasterm);
    }
    
    function evhan_change(ev: ChangeEv) {
        if (inputref.current) {
            set_search_term(inputref.current.value);
            let hasterm = (inputref.current.value.length ? true : false);
            updatefunc(undefined, hasterm);
        }
    }
    
    return (
        <div className="SearchBox">
            <div className="SearchIcon">&#x26B2;</div>
            <input className="SearchField" type="search" ref={ inputref } onChange={ evhan_change } onFocus={ ()=>evhan_focus(true) } onBlur={ ()=>evhan_focus(false) } />
        </div>
    );
}

export function SearchResults({ rock }:{ rock:SearchFieldRock })
{
    const [ hasFocus, setHasFocus ] = useState(false);
    const [ hasTerm, setHasTerm ] = useState(false);
    const [ resultArrived, setResultArrived ] = useState(false);
    const [ resultList, setResultList ] = useState([] as ResultItem[]);
    
    let rctx = useContext(ReactCtx);
    let resultref = useRefDiv();

    let index = 0;
    let ells = resultList.map((result) => {
        return (
            <li key={ index++ } className="SearchResultItem" onClick={ ()=>evhan_click(result.idtype, result.sourceloc) }>
                <span className="SearchResultInner">
                    <span className="SearchResultType">{ result.idtype }</span> <code>{ result.label }</code>
                </span>
            </li>
        );
    });

    useEffect(() => {
        function evhan_change(has_focus?: boolean, has_term?: boolean) {
            if (has_focus !== undefined) {
                if (has_focus) {
                    setHasFocus(true);
                }
                else {
                    window.setTimeout(() => {
                        setHasFocus(false);
                    }, 150);                
                }
            }
            if (has_term !== undefined) {
                setHasTerm(has_term);
                if (!has_term)
                    setResultArrived(false);
            }
        }
        rock.callback = evhan_change;
        return () => {
            rock.callback = null;
        }
    });
    
    useEffect(() => {
        function evhan_list(ev: Event) {
            let list: ResultItem[] = (ev as CustomEvent).detail;
            setResultList(list);
            setResultArrived(true);
        };
        window.addEventListener('search-results', evhan_list);
        return () => {
            window.removeEventListener('search-results', evhan_list);
        };
    });

    function evhan_click(idtype: string, sourceloc: string) {
        rctx.setLoc(sourceloc, (idtype == 'GLOB'));
    }
    
    if (!(hasFocus && resultArrived)) {
        return null;
    }

    return (
        <div className="SearchResults" ref={ resultref }>
            <ul>
                { ells }
                { ells.length == 0 && (
                    <li><i>no results</i></li>
                ) }
            </ul>
        </div>
    );
}

type ChangeEv = React.ChangeEvent<HTMLInputElement>;
const useRefInput = () => useRef<HTMLInputElement>(null);
const useRefDiv = () => useRef<HTMLDivElement>(null);
