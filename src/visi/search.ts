import { ObjectData, RoutineData } from './gametypes';

export type ResultItem = {
    idtype: string;
    label: string;
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

    timer_id = setInterval(search_worker, 500) as unknown as number;
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
    if (freespace < 0) {
        stage = -1;
        finished = true;
    }
    
    switch (stage) {
    case 0:
        newres = search_objects_globals(freespace);
        break;
    default:
        finished = true;
        break;
    }

    if (finished) {
        clearInterval(timer_id);
        timer_id = 0;
        return;
    }

    stage++;

    if (newres.length > freespace) {
        newres.length = freespace;
    }

    if (newres.length) {
        results = [ ...results, ...newres ];
    
        console.log('### dispatching', results.length);
        window.dispatchEvent(new CustomEvent('search-results', { detail:[ ...results ] }));
    }
}

function search_objects_globals(freespace: number): ResultItem[]
{
    let res = [];
    
    const winany = (window as any);

    const gamedat_objects: ObjectData[] = winany.gamedat_objects;
    for (let obj of gamedat_objects) {
        if (obj.name.indexOf(current_term) >= 0) {
            res.push({ idtype:'obj', label:obj.name, sourceloc:obj.sourceloc });
            
        }
    }

    if (res.length >= freespace)
        return res;
    
    const gamedat_globals: ObjectData[] = winany.gamedat_globals;
    for (let obj of gamedat_globals) {
        if (obj.name.indexOf(current_term) >= 0) {
            res.push({ idtype:'glob', label:obj.name, sourceloc:obj.sourceloc });
            
        }
    }

    return res;
}

function search_routines(): ResultItem[]
{
    let res = [];
    
    const winany = (window as any);

    const gamedat_routines: RoutineData[] = winany.gamedat_routines;
    for (let obj of gamedat_routines) {
        if (obj.name.indexOf(current_term) >= 0) {
            res.push({ idtype:'rtn', label:obj.name, sourceloc:obj.sourceloc });
            
        }
    }
    
    return res;
}
