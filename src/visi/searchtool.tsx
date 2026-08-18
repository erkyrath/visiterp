import React from 'react';
import { useState, useContext, useEffect, useRef } from 'react';

import { find_sourceloc_for_id } from './gamedat';

import { ReactCtx } from './context';
import { ResultItem, SearchEventDetail, set_search_term } from './search';

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
    const [ resultHasMore, setResultHasMore ] = useState(false);
    
    let rctx = useContext(ReactCtx);
    let resultref = useRefDiv();

    let index = 0;
    let ells = resultList.map((result) => {
        return (
            <OneSearchResult key={ index++ } result={ result } />
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
            let detail: SearchEventDetail = (ev as CustomEvent).detail;
            setResultList(detail.results);
            setResultHasMore(detail.more);
            setResultArrived(true);
        };
        window.addEventListener('search-results', evhan_list);
        return () => {
            window.removeEventListener('search-results', evhan_list);
        };
    });

    if (!(hasFocus && hasTerm && resultArrived)) {
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

function OneSearchResult({ result }: {result:ResultItem })
{
    let rctx = useContext(ReactCtx);
    
    let hasloc = result.sourceloc && result.sourceloc.length;
    let cla = hasloc ? "SearchResultItem Location" : "SearchResultItem NoLocation";

    let spanel;
    if (result.span) {
        let pre = result.label.slice(0, result.span.pos);
        let mid = result.label.slice(result.span.pos, result.span.pos+result.span.len);
        let post = result.label.slice(result.span.pos+result.span.len);
        spanel = (
            <span>{ pre }<b>{ mid }</b>{ post }</span>
        );
    }
    else {
        spanel = (
            <span>{ result.label }</span>
        );
    }
    
    function evhan_click(idtype: string, sourceloc: string) {
        rctx.setLoc(sourceloc, (idtype == 'GLOB'));
    }
    
    return (
        <li className={ cla } onClick={ ()=>evhan_click(result.idtype, result.sourceloc) }>
            <span className="SearchResultInner">
                { (result.idtype == 'str') ?
                  <span className="SearchResultString">{ spanel }</span>
                  :
                  <>
                      <span className="SearchResultType">{ result.idtype }</span>
                      <code>{ spanel }</code>
                  </>
                }
            </span>
        </li>
    );
}

type ChangeEv = React.ChangeEvent<HTMLInputElement>;
const useRefInput = () => useRef<HTMLInputElement>(null);
const useRefDiv = () => useRef<HTMLDivElement>(null);
