import { IEspecialidad } from './../interfaces/especialidad.interfaces';
import { ESPECIALIDADES_COLLECTION } from './../constants/collections.constants';
import {Router, Request, Response, NextFunction} from 'express';
import * as database from "../database/database";
import {ObjectID} from "mongodb";
import * as _ from "underscore";

export class EspecialidadRouter {
  public router: Router

  /**
   * Initialize the EspecialidadesRouter
   */
  constructor() {
    this.router = Router();
    this.init();
  }

  /**
   * GET all Especialidades.
   */
  public getAll(req: Request, res: Response, next: NextFunction) {
    database.getDB().collection(ESPECIALIDADES_COLLECTION).find({}).toArray((err,especialidades:Array<IEspecialidad>)=>{
      if(err)
        throw err;
      res.json(especialidades);
    });  
    
  }

  /**
   * ADD new Especialidad.
   */
  public createOne(req: Request, res: Response, next: NextFunction) {
  let auditoriaInfo = {fechaAlta:new Date(),fechaModificacion:null};
  let entity:IEspecialidad = Object.assign({},_.omit(req.body,'_id'),auditoriaInfo);
    database.getDB().collection(ESPECIALIDADES_COLLECTION).insert(entity,(err,result)=>{
        if(err){
            throw err;
        }
        res.send(<IEspecialidad>result.ops[0]);
    });  
    
  }

   /**
   * GET single Especialidad.
   */
  public getOne(req: Request, res: Response, next: NextFunction) {
    console.log(req.params.id);
    database.getDB().collection(ESPECIALIDADES_COLLECTION)
      .findOne({_id:ObjectID.createFromHexString(req.params.id)},(err,especialidad:IEspecialidad)=>{
      if(err)
        throw err;
      res.json(especialidad);
    });  
    
  }

  

  /**
   * UPDATE single Especialidad.
   */
  public updateOne(req: Request, res: Response, next: NextFunction) {
    //when updating we need to remove the id property of the object in order to make it inmutable
    let auditoriaInfo = {fechaModificacion:new Date()};
    let entity:IEspecialidad = Object.assign({},_.omit(req.body,'_id'),auditoriaInfo);
    database.getDB().collection(ESPECIALIDADES_COLLECTION)
      .findOneAndUpdate({_id:ObjectID.createFromHexString(req.params.id)},{$set:entity},(err,result)=>{
        if(err){
            throw err;
        }
        res.send(<IEspecialidad>result.value);
    });  
    
  }

  /**
   * Take each handler, and attach to one of the Express.Router's
   * endpoints.
   */
  init() {
    this.router.get('/', this.getAll);
    this.router.get('/:id', this.getOne);
    this.router.post('/', this.createOne);
    this.router.post('/:id', this.updateOne);
    //TODO this.router.post('/:id', this.getOne);
    
  }

}

// Create the HeroRouter, and export its configured Express.Router
const especialidadRouter = new EspecialidadRouter();
especialidadRouter.init();

export default especialidadRouter.router;