import React from 'react';
import { useContext, useRef } from 'react';

import { find_sourceloc_for_id } from './gamedat';

import { ReactCtx } from './context';

export function SearchField()
{
    let inputref = useRefInput();

    function evhan_focus() {
        console.log('### focus');
    }
    
    function evhan_blur() {
        console.log('### blur');
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

export function SearchResults()
{
    let rctx = useContext(ReactCtx);
    
    function evhan_click(idtype: string, id: string) {
        let loc = find_sourceloc_for_id(idtype, id);
        if (loc) {
            rctx.setLoc(loc, (idtype == 'GLOB'));
        }
    }
    
    return (
        <div className="SearchResults">
            <ul>
                <li className="SearchResultItem" onClick={ ()=>evhan_click('OBJ', 'SWORD') }>obj <code>SWORD</code></li>
                <li className="SearchResultItem" onClick={ ()=>evhan_click('RTN', 'LANTERN') }>rtn <code>LANTERN</code></li>
            </ul>
        </div>
    );
}

type ChangeEv = React.ChangeEvent<HTMLInputElement>;
const useRefInput = () => useRef<HTMLInputElement>(null);
