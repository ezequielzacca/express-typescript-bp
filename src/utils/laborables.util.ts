import * as moment from 'moment';
import { DateRange } from 'moment-range';
import { isWeekendDay } from 'moment-business';
import * as database from '../database/database';

export class Laborable {
    private _diasNoLaborables: Array<moment.Moment> = [];

    constructor() {
        this.initialize();
    }

    private initialize() {
        setTimeout(() => {
            database.getDB().collection('feriados').find({}).toArray((err, feriados) => {
                if (err)
                    throw err;
                feriados.map(feriado => {
                    this._diasNoLaborables.push(moment(feriado.fecha));
                });
            })
        }, 2000);

    }

    public esNoLaborable(fecha: moment.Moment): boolean {
        let toReturn = false;
        //Por ahora no controlamos si es fin de semana
        /*if (isWeekendDay(fecha)) {
            console.log('Es fin de semana');
            toReturn = true;
            
        }*/
        
        this._diasNoLaborables.map(feriado => {
            if (feriado.isSame(fecha, 'day')) {
                console.log('Es feriado');
                toReturn = true;
            }
        });
        return toReturn;
    }
}