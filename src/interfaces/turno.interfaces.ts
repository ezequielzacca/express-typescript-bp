import { ObjectID } from 'mongodb';
import { IAuditable } from './auditable.interface';
export interface ITurno extends IAuditable{
    fecha:Date;
    agendaId:ObjectID;
}