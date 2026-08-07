import { RoutineData } from './gametypes';

export type ResultItem = {
    idtype: string;
    label: string;
    sourceloc: string;
};

let current_term: string = '';
let results: ResultItem[] = [];
let event_id = 0;

const MAX_RESULTS = 20;

export function set_search_term(val: string)
{
    val = val.toUpperCase();
    if (val == current_term) {
        return;
    }

    current_term = val;
    results = [];

    if (event_id) {
        clearInterval(event_id);
        event_id = 0;
    }

    event_id = setInterval(search_worker, 500) as unknown as number;
}

function search_worker()
{
    console.log('### search_worker');
    if (current_term == '') {
        clearInterval(event_id);
        event_id = 0;
        window.dispatchEvent(new CustomEvent('search-results', { detail:[] }));
        return;
    }

    const winany = (window as any);

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

    clearInterval(event_id);
    event_id = 0;
    
    console.log('### dispatching', results.length);
    window.dispatchEvent(new CustomEvent('search-results', { detail:[ ...results ] }));
}
