import { IAuditable } from './auditable.interface';
import { DateRange } from 'moment-range';

import { ObjectID } from 'mongodb';
export interface IAgenda extends IAuditable{
    nombre:string;
    duracionTurno:number;
    localizacion:ILocalizacion;
    medicoId:ObjectID;
    fechaBaja?:Date;
    dias:Array<IDiaSemanal>;
    extraordinarios:Array<IDiaExtraordinario>;
    excluir:IExcluir;
}
/**
 * Simboliza una direccion y puntos en el mapa
 */
export interface ILocalizacion{
    direccion:string;
    latitud:number;
    longitud:number;
}

export interface IDiaSemanal{
    //0: Lunes, 1: Martes ... 6: Domingo
    numero:number;
    horarios:Array<IHorario>;
}

export interface IDiaExtraordinario{
    fecha:string;
    horarios:Array<IHorario>;
}

export interface IHorario{
    desde:string;
    hasta:string;
}

export interface IExcluir{
    rango:Array<IHorario>;
    dias:Array<IDiaExtraordinario>;
}

export interface IRangosExcluir{
    dias:Array<DateRange>;
    horarios:Array<DateRange>;
}
