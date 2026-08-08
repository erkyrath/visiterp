import { ObjectData, RoutineData } from './gametypes';
import { gamedat_object_names, gamedat_global_names, gamedat_routine_names } from './gamedat';

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
        newres = search_exact(freespace);
        break;
    case 1:
        newres = search_objects_globals(freespace);
        break;
    case 2:
        newres = search_routines(freespace);
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
            window.dispatchEvent(new CustomEvent('search-results', { detail:[] }));
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
        window.dispatchEvent(new CustomEvent('search-results', { detail:[ ...results ] }));
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
    
    const gamedat_globals: ObjectData[] = winany.gamedat_globals;
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
