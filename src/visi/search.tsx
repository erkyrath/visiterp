import React from 'react';
import { useContext, useEffect, useRef } from 'react';

import { find_sourceloc_for_id } from './gamedat';

import { ReactCtx } from './context';

type SearchFieldCallback = (visible: boolean) => void;
export type SearchFieldRock = {
    callback: SearchFieldCallback | null;
};

export function SearchField({ change }:{ change:SearchFieldCallback })
{
    let inputref = useRefInput();

    function evhan_focus() {
        console.log('### focus');
        change(true);
    }
    
    function evhan_blur() {
        console.log('### blur');
        change(false);
    }
    
    function evhan_change(ev: ChangeEv) {
        if (inputref.current) {
            console.log('### change', inputref.current.value);
        }
    }
    
    return (
        <div className="SearchBox">
            <div className="SearchIcon">&#x26B2;</div>
            <input className="SearchField" type="search" ref={ inputref } onChange={ evhan_change } onFocus={ evhan_focus } onBlur={ evhan_blur } />
        </div>
    );
}

export function SearchResults({ rock }:{ rock:SearchFieldRock })
{
    let rctx = useContext(ReactCtx);
    let resultref = useRefDiv();

    useEffect(() => {
        function evhan_change(visible: boolean) {
            console.log('### change visible', visible);
            if (resultref.current) {
                if (visible) {
                    resultref.current.classList.add('Visible');
                }
                else {
                    resultref.current.classList.remove('Visible');
                }
            }
        }
        rock.callback = evhan_change;
        return () => {
            rock.callback = null;
        }
    });
    
    function evhan_click(idtype: string, id: string) {
        let loc = find_sourceloc_for_id(idtype, id);
        if (loc) {
            rctx.setLoc(loc, (idtype == 'GLOB'));
        }
    }
    
    return (
        <div className="SearchResults" ref={ resultref }>
            <ul>
                <li className="SearchResultItem" onClick={ ()=>evhan_click('OBJ', 'SWORD') }>
                    <span className="SearchResultInner">
                        <span className="SearchResultType">obj</span> <code>SWORD</code>
                    </span>
                </li>
                <li className="SearchResultItem" onClick={ ()=>evhan_click('RTN', 'LANTERN') }>
                    <span className="SearchResultInner">
                        <span className="SearchResultType">rtn</span> <code>LANTERN</code>
                    </span>
                </li>
            </ul>
        </div>
    );
}

type ChangeEv = React.ChangeEvent<HTMLInputElement>;
const useRefInput = () => useRef<HTMLInputElement>(null);
const useRefDiv = () => useRef<HTMLDivElement>(null);
