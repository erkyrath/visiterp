import React from 'react';
import { useRef } from 'react';

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
    return (
        <div className="SearchResults">
            <ul>
                <li className="SearchResultItem">obj LANTERN</li>
                <li className="SearchResultItem">rtn LANTERN-F</li>
            </ul>
        </div>
    );
}

type ChangeEv = React.ChangeEvent<HTMLInputElement>;
const useRefInput = () => useRef<HTMLInputElement>(null);
