import { ObjectData, RoutineData } from './gametypes';

export type ResultItem = {
    idtype: string;
    label: string;
    exact?: boolean;
    sourceloc: string;
};

let current_term: string = '';
let results: ResultItem[] = [];
let timer_id = 0;

const MAX_RESULTS = 20;

export function set_search_term(val: string)
{
    val = val.toUpperCase().trim();
    if (val == current_term) {
        return;
    }

    current_term = val;
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

    const winany = (window as any);

    const gamedat_objects: ObjectData[] = winany.gamedat_objects;
    for (let obj of gamedat_objects) {
        if (obj.name.indexOf(current_term) >= 0) {
            results.push({ idtype:'obj', label:obj.name, sourceloc:obj.sourceloc });
            
            if (results.length >= MAX_RESULTS)
                break;
        }
    }
    
    const gamedat_routines: RoutineData[] = winany.gamedat_routines;
    if (results.length < MAX_RESULTS) {
        for (let obj of gamedat_routines) {
            if (obj.name.indexOf(current_term) >= 0) {
                results.push({ idtype:'rtn', label:obj.name, sourceloc:obj.sourceloc });
                
                if (results.length >= MAX_RESULTS)
                    break;
            }
        }
    }

    clearInterval(timer_id);
    timer_id = 0;
    
    console.log('### dispatching', results.length);
    window.dispatchEvent(new CustomEvent('search-results', { detail:[ ...results ] }));
}
