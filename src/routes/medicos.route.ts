import { MEDICOS_COLLECTION } from './../constants/collections.constants';
import { IMedico } from './../interfaces/medico.interfaces';
import {Router, Request, Response, NextFunction} from 'express';
import * as database from "../database/database";
import {ObjectID} from "mongodb";
import * as _ from "underscore";

export class MedicosRouter {
  public router: Router

  /**
   * Initialize the MedicosRouter
   */
  constructor() {
    this.router = Router();
    this.init();
  }

  /**
   * GET all Medicos.
   */
  public getAll(req: Request, res: Response, next: NextFunction) {
    database.getDB().collection(MEDICOS_COLLECTION).find({}).toArray((err,medicos:Array<IMedico>)=>{
      if(err)
        throw err;
      res.json(medicos);
    });  
    
  }

  /**
   * GET all Medicos.
   */
  public createOne(req: Request, res: Response, next: NextFunction) {
  let auditoriaInfo = {fechaAlta:new Date(),fechaModificacion:null};
  let entity:IMedico = Object.assign({},_.omit(req.body,'_id'),auditoriaInfo);
    database.getDB().collection(MEDICOS_COLLECTION).insert(entity,(err,result)=>{
        if(err){
            throw err;
        }
        res.send(<IMedico>result.ops[0]);
    });  
    
  }

   /**
   * GET all Medicos.
   */
  public getOne(req: Request, res: Response, next: NextFunction) {
    console.log(req.params.id);
    database.getDB().collection(MEDICOS_COLLECTION).findOne({_id:ObjectID.createFromHexString(req.params.id)},(err,medico:IMedico)=>{
      if(err)
        throw err;
      res.json(medico);
    });  
    
  }

  

  /**
   * UPDATE single Medico.
   */
  public updateOne(req: Request, res: Response, next: NextFunction) {
    //when updating we need to remove the id property of the object in order to make it inmutable
    let auditoriaInfo = {fechaModificacion:new Date()};
    let entity:IMedico = Object.assign({},_.omit(req.body,'_id'),auditoriaInfo);
    database.getDB().collection(MEDICOS_COLLECTION).findOneAndUpdate({_id:ObjectID.createFromHexString(req.params.id)},{$set:entity},(err,result)=>{
        if(err){
            throw err;
        }
        res.send(<IMedico>result.value);
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
const medicosRouter = new MedicosRouter();
medicosRouter.init();

export default medicosRouter.router;