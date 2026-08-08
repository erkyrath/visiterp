import { ObjectData, RoutineData, GlobalData, ConstantData } from './gametypes';
import { gamedat_object_names, gamedat_global_names, gamedat_constant_names, gamedat_routine_names } from './gamedat';

export type SearchEventDetail = {
    results: ResultItem[];
    more: boolean;
};

export type ResultItem = {
    idtype: string;
    label: string;
    span?: { pos:number, len:number },
    exact?: boolean;
    sourceloc: string;
};

let current_term: string = '';
let results: ResultItem[] = [];
let stage = 0;
let timer_id = 0;

const MAX_RESULTS = 20;

export function set_search_term(val: string)
{
    val = val.toUpperCase().trim();
    if (val == current_term) {
        return;
    }

    current_term = val;
    stage = 0;
    results = [];

    if (timer_id) {
        clearInterval(timer_id);
        timer_id = 0;
    }

    timer_id = setInterval(search_worker, 100) as unknown as number;
}

function search_worker()
{
    console.log('### search_worker');
    if (current_term == '') {
        clearInterval(timer_id);
        timer_id = 0;
        return;
    }

    let finished = false;
    let newres: ResultItem[] = [];

    let freespace = MAX_RESULTS - results.length;
    if (freespace <= 0) {
        stage = -1;
        finished = true;
    }
    
    switch (stage) {
    case 0:
        newres = search_exact(freespace);
        break;
    case 1:
        newres = search_objects_globals(freespace);
        break;
    case 2:
        newres = search_routines(freespace);
        break;
    case 3:
        newres = search_constants(freespace);
        break;
    case 4:
        newres = search_strings(freespace);
        break;
    default:
        finished = true;
        break;
    }

    if (finished) {
        clearInterval(timer_id);
        timer_id = 0;

        if (!results.length) {
            // We never sent any intermediate results, so supply final closure.
            let detail: SearchEventDetail = { results: [], more: false };
            window.dispatchEvent(new CustomEvent('search-results', { detail:detail }));
        }
        
        return;
    }

    stage++;

    if (newres.length > freespace) {
        newres.length = freespace;
    }

    if (newres.length) {
        // We only send results if new ones have been found.
        results = [ ...results, ...newres ];
    
        console.log('### dispatching', results.length);
        let detail: SearchEventDetail = { results: [ ...results ], more: (results.length >= MAX_RESULTS) };
        window.dispatchEvent(new CustomEvent('search-results', { detail:detail }));
    }
}

function search_exact(freespace: number): ResultItem[]
{
    let res = [];

    let obj = gamedat_object_names.get(current_term);
    if (obj) {
        res.push({ idtype:'obj', label:obj.name, sourceloc:obj.sourceloc });
    }

    let glob = gamedat_global_names.get(current_term);
    if (glob) {
        res.push({ idtype:'glob', label:glob.name, sourceloc:glob.sourceloc });
    }

    let rtn = gamedat_routine_names.get(current_term);
    if (rtn) {
        res.push({ idtype:'rtn', label:rtn.name, sourceloc:rtn.sourceloc });
    }

    let con = gamedat_constant_names.get(current_term);
    if (con) {
        res.push({ idtype:'const', label:con.name, sourceloc:con.sourceloc });
    }

    return res;
}

function search_objects_globals(freespace: number): ResultItem[]
{
    let res = [];
    
    const winany = (window as any);

    const gamedat_objects: ObjectData[] = winany.gamedat_objects;
    for (let obj of gamedat_objects) {
        if (obj.name.indexOf(current_term) >= 0 && obj.name != current_term) {
            res.push({ idtype:'obj', label:obj.name, sourceloc:obj.sourceloc });
        }
    }

    if (res.length >= freespace)
        return res;
    
    const gamedat_globals: GlobalData[] = winany.gamedat_globals;
    for (let glob of gamedat_globals) {
        if (glob.name.indexOf(current_term) >= 0 && glob.name != current_term) {
            res.push({ idtype:'glob', label:glob.name, sourceloc:glob.sourceloc });
        }
    }

    return res;
}

function search_routines(freespace: number): ResultItem[]
{
    let res = [];
    
    const winany = (window as any);

    const gamedat_routines: RoutineData[] = winany.gamedat_routines;
    for (let rtn of gamedat_routines) {
        if (res.length >= freespace)
            break;
        
        if (rtn.name.indexOf(current_term) >= 0 && rtn.name != current_term) {
            res.push({ idtype:'rtn', label:rtn.name, sourceloc:rtn.sourceloc });
        }
    }
    
    return res;
}

function search_constants(freespace: number): ResultItem[]
{
    let res = [];
    
    const winany = (window as any);

    const gamedat_constants: ConstantData[] = winany.gamedat_constants;
    for (let con of gamedat_constants) {
        if (res.length >= freespace)
            break;
        
        if (con.name.indexOf(current_term) >= 0 && con.name != current_term) {
            res.push({ idtype:'const', label:con.name, sourceloc:con.sourceloc });
        }
    }
    
    return res;
}

let upstrings: { text:string, uptext:string, sourceloc:string }[] | null = null;

function search_strings(freespace: number): ResultItem[]
{
    if (upstrings == null) {
        const winany = (window as any);
        const gamedat_strings: any[] = winany.gamedat_strings;
        upstrings = gamedat_strings.map((obj) => ({ text: obj[1],  uptext: obj[1].toUpperCase(), sourceloc: obj[2] }));
    }
    
    let res = [];
    for (let str of upstrings) {
        if (res.length >= freespace)
            break;

        let pos = str.uptext.indexOf(current_term);
        if (pos >= 0) {
            let label = str.text;
            if (pos > 16) {
                label = '\u2026' + label.slice(pos-16);
                pos = 17;
            }
            if (label.length > 60) {
                label = label.slice(0, 60) + '\u2026';
            }
            let span = { pos:pos, len:current_term.length };
            res.push({ idtype:'str', label:label, span:span, sourceloc:str.sourceloc });
        }
    }

    return res;
}
