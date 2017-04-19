import { IAuditable } from './auditable.interface';
export interface IMedico extends IAuditable{
    
    nombre:string;
    matricula:number;

}