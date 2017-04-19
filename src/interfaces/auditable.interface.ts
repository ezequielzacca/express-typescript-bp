import { ObjectID } from 'mongodb';
export interface IAuditable{
    _id?:ObjectID;
    fechaAlta:Date;
    fechaModificacion?:Date;
}