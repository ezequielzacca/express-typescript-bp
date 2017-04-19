import { NO_LABORABLES_WS } from './../constants/ext-urls.constants';
import { AGENDAS_COLLECTION, FERIADOS_COLLECTION } from './../constants/collections.constants';
import { Feriado } from './../interfaces/feriado.interfaces';
import { IAgenda, IRangosExcluir } from './../interfaces/agenda.interfaces';
import { Router, Request, Response, NextFunction } from 'express';
import * as database from '../database/database';
import { ObjectID } from 'mongodb';
import * as _ from 'underscore';
import * as request from 'request';
import * as moment from 'moment';
import { DateRange } from 'moment-range';
import * as async from 'async';
import { Laborable } from './../utils/laborables.util';

const laborableUtil = new Laborable();
export class AgendasRouter {
  public router: Router

  /**
   * Initialize the AgendasRouter
   */
  constructor() {
    this.router = Router();
    this.init();
  }

  /**
   * SET new Agenda for MD.
   */
  public setNew(req: Request, res: Response, next: NextFunction) {
    let auditoriaInfo = { fechaAlta: new Date(), fechaModificacion: null };
    let entity = Object.assign({}, _.omit(req.body, '_id'), auditoriaInfo,
      //I have to overwrite medicoId because it comes as a string and i need it as ObjectID
      { medicoId: ObjectID.createFromHexString(req.body.medicoId) });
    /*database.getDB().collection('agendas')
      .insert(entity, (err, result) => {
        if (err) {
          throw err;
        }
        res.send(result.ops[0]);*/
        //let agenda: Agenda = result.ops[0];
        let agenda: IAgenda = entity;
        let turnosArray:Array<string> = [];
        /**
         * Genera los turnos basados en lo que el usuario cargo en la agenda
         */
        let ahora = moment();
        //let algunTiempoDesdeAhora = moment().add(3, 'w');
        let algunTiempoDesdeAhora = moment().add(2, 'y');
        let rangoCalendario = new DateRange(ahora, algunTiempoDesdeAhora);
        let rangosExcluir: IRangosExcluir = {
          dias: [],
          horarios: []
        };
        //debo excluir los rangos de dias a excluir que especifico el medico
        agenda.excluir.rango.map(periodo => {
          let desde: moment.Moment = moment(periodo.desde, "YYYY-MM-DD").hours(0).minutes(0).seconds(0);
          let hasta: moment.Moment = moment(periodo.hasta, "YYYY-MM-DD").hours(23).minutes(59).seconds(59);
          //genero el rango basado en dia desde y hasta y lo substraigo del rango calendario
          rangosExcluir.dias.push(new DateRange(desde, hasta));
        });
        //ahora debo excluir las horas particulares de los dias especificos que el medico desea excluir
        agenda.excluir.dias.map(dia => {
          //el medico puede especificar un array de horarios asi que debo iterar por cada uno
          dia.horarios.map(horario => {
            //desde es el dia
            let desde: moment.Moment = moment(dia.fecha, "YYYY-MM-DD");
            //y hasta tambien por eso lo clono
            let hasta: moment.Moment = desde.clone();
            desde.hours(parseInt(horario.desde.split(":")[0])).minutes(parseInt(horario.desde.split(":")[1]));
            hasta.hours(parseInt(horario.hasta.split(":")[0])).minutes(parseInt(horario.hasta.split(":")[1]));
            rangosExcluir.horarios.push(new DateRange(desde, hasta));
          });

        });
        //duracion del turno en minutos
        const duracionTurno = agenda.duracionTurno;
        //let twoYearsFromNow = moment().add(2, 'y');
        //let calendarRange = new DateRange(now, twoYearsFromNow);

        const dias = Array.from(rangoCalendario.by('days'));
        /**
           * Por cada dia debo verificar que
           * 1) El numero de dia de la semana
           *    sea igual a alguno de los numeros que estan en la agenda
           *    a) Si es igual entonces por cada rango horario genero el turno
           *    b) Si no es igual tengo que verificar que no sea un dia extraordinario
           */
        dias.map(diaActual => {
          let estaExcluido = false;
          rangosExcluir.dias.map(rango => {
            if (rango.contains(diaActual))
              estaExcluido = true;
          })
          //representa el numero de dia de la semana
          let numeroDeDia = parseInt(diaActual.format('d'));
          let eseDiaTrabaja = agenda.dias.filter(dia => dia.numero === numeroDeDia).length > 0;
          let esFeriado = laborableUtil.esNoLaborable(diaActual);
          if (eseDiaTrabaja && !estaExcluido && !esFeriado) {
            let horarios = agenda.dias.find(dia => dia.numero === numeroDeDia).horarios;
            horarios.map(horario => {
              let desde = moment(diaActual)
                //horario.desde = "20:50", usando split obtengo un array con ["20","50"]
                .hours(parseInt(horario.desde.split(":")[0]))
                .minutes(parseInt(horario.desde.split(":")[1]));
              let hasta = moment(diaActual)
                .hours(parseInt(horario.hasta.split(":")[0]))
                .minutes(parseInt(horario.hasta.split(":")[1]));
              let rangoHorario = new DateRange(desde, hasta);
              //Creo los momentos basados en el rango horario, cada 15 minutos excluyendo el limite
              const turnos = Array.from(rangoHorario.by('minutes',
                { exclusive: true, step: duracionTurno }
              ));
              turnos.map((turno, index) => {
                let estaExcluido = false;
                rangosExcluir.horarios.map(rango => {
                  if (rango.contains(turno))
                    estaExcluido = true;
                });
                if (!estaExcluido) {
                  turnosArray.push(turno.format("DD-MM-YYYY HH:mm"));
                }

              });
            });
          }
        });
        res.json(turnosArray);

      //});

  }

  /**
   * GET all Agendas of certain MD.
   */
  public getByMedico(req: Request, res: Response, next: NextFunction) {
    database.getDB().collection(AGENDAS_COLLECTION)
      .find({}).toArray((err, agendas) => {
        if (err)
          throw err;
        res.json(agendas);
      });
  }

  /**
   * SETUP de feriados
   */
  public setUpFeriados(req: Request, res: Response, next: NextFunction) {
    request(NO_LABORABLES_WS + req.params.anio, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        //Borrar feriados para ese año si existen
        database.getDB().collection('feriados')
          .deleteMany({ anio: parseInt(req.params.anio) }, (err) => {
            if (err)
              throw err;
            //Una vez borrados los anteriores debo guardar los nuevos
            let feriados: Array<Feriado> = JSON.parse(body); // Print the google web page.
            async.eachOf(feriados, (feriado, key, callback) => {
              database.getDB().collection(FERIADOS_COLLECTION)
                .insert({
                  fecha: moment(`${feriado.dia}-${feriado.mes}-${req.body.anio}`, 'D-M-YYYY').toDate(),
                  anio: parseInt(req.params.anio)
                }, (err, agendas) => {
                  if (err)
                    return callback(err);
                  return callback();
                });
            }, (err) => {
              if (err)
                throw err;
              return res.json(feriados);
            });
          });
      }
    });
  }

  /**
   * Take each handler, and attach to one of the Express.Router's
   * endpoints.
   */
  init() {
    this.router.get('/', this.getByMedico);
    this.router.post('/', this.setNew);
    this.router.post('/setupferiados/:anio', this.setUpFeriados);
    //TODO this.router.post('/:id', this.getOne);
  }
}

// Create the HeroRouter, and export its configured Express.Router
const agendasRouter = new AgendasRouter();
agendasRouter.init();

export default agendasRouter.router;


