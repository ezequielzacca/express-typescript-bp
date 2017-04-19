import {Router, Request, Response, NextFunction} from 'express';
import * as database from "../database/database";
import {ObjectID} from "mongodb";
import * as _ from "underscore";

export class PacientesRouter {
  router: Router

  /**
   * Initialize the PacientesRouter
   */
  constructor() {
    this.router = Router();
    this.init();
  }

  /**
   * GET all Pacientes.
   */
  public getAll(req: Request, res: Response, next: NextFunction) {
    database.getDB().collection('pacientes').find({}).toArray((err,pacientes)=>{
      if(err)
        throw err;
      res.json(pacientes);
    });  
    
  }

  /**
   * GET all Pacientes.
   */
  public createOne(req: Request, res: Response, next: NextFunction) {
  let auditoriaInfo = {fechaAlta:new Date(),fechaModificacion:null};
  let entity = Object.assign({},_.omit(req.body,'_id'),auditoriaInfo);
    database.getDB().collection('pacientes').insert(entity,(err,result)=>{
        if(err){
            throw err;
        }
        res.send(result.ops[0]);
    });  
    
  }

   /**
   * GET single Paciente.
   */
  public getOne(req: Request, res: Response, next: NextFunction) {
    console.log(req.params.id);
    database.getDB().collection('pacientes').findOne({_id:ObjectID.createFromHexString(req.params.id)},(err,especialidad)=>{
      if(err)
        throw err;
      res.json(especialidad);
    });  
    
  }

  

  /**
   * UPDATE single Paciente.
   */
  public updateOne(req: Request, res: Response, next: NextFunction) {
    //when updating we need to remove the id property of the object in order to make it inmutable
    let auditoriaInfo = {fechaModificacion:new Date()};
    let entity = Object.assign({},_.omit(req.body,'_id'),auditoriaInfo);
    database.getDB().collection('pacientes').findOneAndUpdate({_id:ObjectID.createFromHexString(req.params.id)},{$set:entity},(err,result)=>{
        if(err){
            throw err;
        }
        res.send(result.value);
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
const pacientesRouter = new PacientesRouter();
pacientesRouter.init();

export default pacientesRouter.router;