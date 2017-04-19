"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ext_urls_constants_1 = require("./../constants/ext-urls.constants");
const collections_constants_1 = require("./../constants/collections.constants");
const express_1 = require("express");
const database = require("../database/database");
const mongodb_1 = require("mongodb");
const _ = require("underscore");
const request = require("request");
const moment = require("moment");
const moment_range_1 = require("moment-range");
const async = require("async");
const laborables_util_1 = require("./../utils/laborables.util");
const laborableUtil = new laborables_util_1.Laborable();
class AgendasRouter {
    /**
     * Initialize the AgendasRouter
     */
    constructor() {
        this.router = express_1.Router();
        this.init();
    }
    /**
     * SET new Agenda for MD.
     */
    setNew(req, res, next) {
        let auditoriaInfo = { fechaAlta: new Date(), fechaModificacion: null };
        let entity = Object.assign({}, _.omit(req.body, '_id'), auditoriaInfo, 
        //I have to overwrite medicoId because it comes as a string and i need it as ObjectID
        { medicoId: mongodb_1.ObjectID.createFromHexString(req.body.medicoId) });
        /*database.getDB().collection('agendas')
          .insert(entity, (err, result) => {
            if (err) {
              throw err;
            }
            res.send(result.ops[0]);*/
        //let agenda: Agenda = result.ops[0];
        let agenda = entity;
        let turnosArray = [];
        /**
         * Genera los turnos basados en lo que el usuario cargo en la agenda
         */
        let ahora = moment();
        //let algunTiempoDesdeAhora = moment().add(3, 'w');
        let algunTiempoDesdeAhora = moment().add(2, 'y');
        let rangoCalendario = new moment_range_1.DateRange(ahora, algunTiempoDesdeAhora);
        let rangosExcluir = {
            dias: [],
            horarios: []
        };
        //debo excluir los rangos de dias a excluir que especifico el medico
        agenda.excluir.rango.map(periodo => {
            let desde = moment(periodo.desde, "YYYY-MM-DD").hours(0).minutes(0).seconds(0);
            let hasta = moment(periodo.hasta, "YYYY-MM-DD").hours(23).minutes(59).seconds(59);
            //genero el rango basado en dia desde y hasta y lo substraigo del rango calendario
            rangosExcluir.dias.push(new moment_range_1.DateRange(desde, hasta));
        });
        //ahora debo excluir las horas particulares de los dias especificos que el medico desea excluir
        agenda.excluir.dias.map(dia => {
            //el medico puede especificar un array de horarios asi que debo iterar por cada uno
            dia.horarios.map(horario => {
                //desde es el dia
                let desde = moment(dia.fecha, "YYYY-MM-DD");
                //y hasta tambien por eso lo clono
                let hasta = desde.clone();
                desde.hours(parseInt(horario.desde.split(":")[0])).minutes(parseInt(horario.desde.split(":")[1]));
                hasta.hours(parseInt(horario.hasta.split(":")[0])).minutes(parseInt(horario.hasta.split(":")[1]));
                rangosExcluir.horarios.push(new moment_range_1.DateRange(desde, hasta));
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
            });
            //representa el numero de dia de la semana
            let numeroDeDia = parseInt(diaActual.format('d'));
            let eseDiaTrabaja = agenda.dias.filter(dia => dia.numero === numeroDeDia).length > 0;
            let esFeriado = laborableUtil.esNoLaborable(diaActual);
            if (eseDiaTrabaja && !estaExcluido && !esFeriado) {
                let horarios = agenda.dias.find(dia => dia.numero === numeroDeDia).horarios;
                horarios.map(horario => {
                    let desde = moment(diaActual)
                        .hours(parseInt(horario.desde.split(":")[0]))
                        .minutes(parseInt(horario.desde.split(":")[1]));
                    let hasta = moment(diaActual)
                        .hours(parseInt(horario.hasta.split(":")[0]))
                        .minutes(parseInt(horario.hasta.split(":")[1]));
                    let rangoHorario = new moment_range_1.DateRange(desde, hasta);
                    //Creo los momentos basados en el rango horario, cada 15 minutos excluyendo el limite
                    const turnos = Array.from(rangoHorario.by('minutes', { exclusive: true, step: duracionTurno }));
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
    getByMedico(req, res, next) {
        database.getDB().collection(collections_constants_1.AGENDAS_COLLECTION)
            .find({}).toArray((err, agendas) => {
            if (err)
                throw err;
            res.json(agendas);
        });
    }
    /**
     * SETUP de feriados
     */
    setUpFeriados(req, res, next) {
        request(ext_urls_constants_1.NO_LABORABLES_WS + req.params.anio, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                //Borrar feriados para ese año si existen
                database.getDB().collection('feriados')
                    .deleteMany({ anio: parseInt(req.params.anio) }, (err) => {
                    if (err)
                        throw err;
                    //Una vez borrados los anteriores debo guardar los nuevos
                    let feriados = JSON.parse(body); // Print the google web page.
                    async.eachOf(feriados, (feriado, key, callback) => {
                        database.getDB().collection(collections_constants_1.FERIADOS_COLLECTION)
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
exports.AgendasRouter = AgendasRouter;
// Create the HeroRouter, and export its configured Express.Router
const agendasRouter = new AgendasRouter();
agendasRouter.init();
exports.default = agendasRouter.router;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9yb3V0ZXMvYWdlbmRhLnJvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMEVBQXFFO0FBQ3JFLGdGQUErRjtBQUcvRixxQ0FBa0U7QUFDbEUsaURBQWlEO0FBQ2pELHFDQUFtQztBQUNuQyxnQ0FBZ0M7QUFDaEMsbUNBQW1DO0FBQ25DLGlDQUFpQztBQUNqQywrQ0FBeUM7QUFDekMsK0JBQStCO0FBQy9CLGdFQUF1RDtBQUV2RCxNQUFNLGFBQWEsR0FBRyxJQUFJLDJCQUFTLEVBQUUsQ0FBQztBQUN0QztJQUdFOztPQUVHO0lBQ0g7UUFDRSxJQUFJLENBQUMsTUFBTSxHQUFHLGdCQUFNLEVBQUUsQ0FBQztRQUN2QixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDZCxDQUFDO0lBRUQ7O09BRUc7SUFDSSxNQUFNLENBQUMsR0FBWSxFQUFFLEdBQWEsRUFBRSxJQUFrQjtRQUMzRCxJQUFJLGFBQWEsR0FBRyxFQUFFLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRSxFQUFFLGlCQUFpQixFQUFFLElBQUksRUFBRSxDQUFDO1FBQ3ZFLElBQUksTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxhQUFhO1FBQ25FLHFGQUFxRjtRQUNyRixFQUFFLFFBQVEsRUFBRSxrQkFBUSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2pFOzs7OztzQ0FLOEI7UUFDMUIscUNBQXFDO1FBQ3JDLElBQUksTUFBTSxHQUFZLE1BQU0sQ0FBQztRQUM3QixJQUFJLFdBQVcsR0FBaUIsRUFBRSxDQUFDO1FBQ25DOztXQUVHO1FBQ0gsSUFBSSxLQUFLLEdBQUcsTUFBTSxFQUFFLENBQUM7UUFDckIsbURBQW1EO1FBQ25ELElBQUkscUJBQXFCLEdBQUcsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNqRCxJQUFJLGVBQWUsR0FBRyxJQUFJLHdCQUFTLENBQUMsS0FBSyxFQUFFLHFCQUFxQixDQUFDLENBQUM7UUFDbEUsSUFBSSxhQUFhLEdBQW1CO1lBQ2xDLElBQUksRUFBRSxFQUFFO1lBQ1IsUUFBUSxFQUFFLEVBQUU7U0FDYixDQUFDO1FBQ0Ysb0VBQW9FO1FBQ3BFLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPO1lBQzlCLElBQUksS0FBSyxHQUFrQixNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxZQUFZLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5RixJQUFJLEtBQUssR0FBa0IsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsWUFBWSxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDakcsa0ZBQWtGO1lBQ2xGLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksd0JBQVMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUN2RCxDQUFDLENBQUMsQ0FBQztRQUNILCtGQUErRjtRQUMvRixNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRztZQUN6QixtRkFBbUY7WUFDbkYsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTztnQkFDdEIsaUJBQWlCO2dCQUNqQixJQUFJLEtBQUssR0FBa0IsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsWUFBWSxDQUFDLENBQUM7Z0JBQzNELGtDQUFrQztnQkFDbEMsSUFBSSxLQUFLLEdBQWtCLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDekMsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNsRyxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xHLGFBQWEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksd0JBQVMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUMzRCxDQUFDLENBQUMsQ0FBQztRQUVMLENBQUMsQ0FBQyxDQUFDO1FBQ0gsK0JBQStCO1FBQy9CLE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUM7UUFDM0MsNkNBQTZDO1FBQzdDLDBEQUEwRDtRQUUxRCxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNwRDs7Ozs7O2FBTUs7UUFDTCxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVM7WUFDaEIsSUFBSSxZQUFZLEdBQUcsS0FBSyxDQUFDO1lBQ3pCLGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUs7Z0JBQzFCLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQzVCLFlBQVksR0FBRyxJQUFJLENBQUM7WUFDeEIsQ0FBQyxDQUFDLENBQUE7WUFDRiwwQ0FBMEM7WUFDMUMsSUFBSSxXQUFXLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNsRCxJQUFJLGFBQWEsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxXQUFXLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1lBQ3JGLElBQUksU0FBUyxHQUFHLGFBQWEsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDdkQsRUFBRSxDQUFDLENBQUMsYUFBYSxJQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFDakQsSUFBSSxRQUFRLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssV0FBVyxDQUFDLENBQUMsUUFBUSxDQUFDO2dCQUM1RSxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU87b0JBQ2xCLElBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7eUJBRTFCLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt5QkFDNUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2xELElBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7eUJBQzFCLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt5QkFDNUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2xELElBQUksWUFBWSxHQUFHLElBQUksd0JBQVMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7b0JBQy9DLHFGQUFxRjtvQkFDckYsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFDakQsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsQ0FDekMsQ0FBQyxDQUFDO29CQUNILE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsS0FBSzt3QkFDdEIsSUFBSSxZQUFZLEdBQUcsS0FBSyxDQUFDO3dCQUN6QixhQUFhLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLOzRCQUM5QixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dDQUN4QixZQUFZLEdBQUcsSUFBSSxDQUFDO3dCQUN4QixDQUFDLENBQUMsQ0FBQzt3QkFDSCxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7NEJBQ2xCLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7d0JBQ3JELENBQUM7b0JBRUgsQ0FBQyxDQUFDLENBQUM7Z0JBQ0wsQ0FBQyxDQUFDLENBQUM7WUFDTCxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRXhCLEtBQUs7SUFFVCxDQUFDO0lBRUQ7O09BRUc7SUFDSSxXQUFXLENBQUMsR0FBWSxFQUFFLEdBQWEsRUFBRSxJQUFrQjtRQUNoRSxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLDBDQUFrQixDQUFDO2FBQzVDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsT0FBTztZQUM3QixFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUM7Z0JBQ04sTUFBTSxHQUFHLENBQUM7WUFDWixHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3BCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVEOztPQUVHO0lBQ0ksYUFBYSxDQUFDLEdBQVksRUFBRSxHQUFhLEVBQUUsSUFBa0I7UUFDbEUsT0FBTyxDQUFDLHFDQUFnQixHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLFVBQVUsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJO1lBQ3pFLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLFFBQVEsQ0FBQyxVQUFVLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDekMseUNBQXlDO2dCQUN6QyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQztxQkFDcEMsVUFBVSxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHO29CQUNuRCxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUM7d0JBQ04sTUFBTSxHQUFHLENBQUM7b0JBQ1oseURBQXlEO29CQUN6RCxJQUFJLFFBQVEsR0FBbUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLDZCQUE2QjtvQkFDOUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLFFBQVE7d0JBQzVDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsMkNBQW1CLENBQUM7NkJBQzdDLE1BQU0sQ0FBQzs0QkFDTixLQUFLLEVBQUUsTUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLEdBQUcsSUFBSSxPQUFPLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsVUFBVSxDQUFDLENBQUMsTUFBTSxFQUFFOzRCQUNwRixJQUFJLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO3lCQUNoQyxFQUFFLENBQUMsR0FBRyxFQUFFLE9BQU87NEJBQ2QsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDO2dDQUNOLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7NEJBQ3ZCLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQzt3QkFDcEIsQ0FBQyxDQUFDLENBQUM7b0JBQ1AsQ0FBQyxFQUFFLENBQUMsR0FBRzt3QkFDTCxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUM7NEJBQ04sTUFBTSxHQUFHLENBQUM7d0JBQ1osTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQzVCLENBQUMsQ0FBQyxDQUFDO2dCQUNMLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVEOzs7T0FHRztJQUNILElBQUk7UUFDRixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsc0JBQXNCLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQzdELDZDQUE2QztJQUMvQyxDQUFDO0NBQ0Y7QUE3S0Qsc0NBNktDO0FBRUQsa0VBQWtFO0FBQ2xFLE1BQU0sYUFBYSxHQUFHLElBQUksYUFBYSxFQUFFLENBQUM7QUFDMUMsYUFBYSxDQUFDLElBQUksRUFBRSxDQUFDO0FBRXJCLGtCQUFlLGFBQWEsQ0FBQyxNQUFNLENBQUMiLCJmaWxlIjoicm91dGVzL2FnZW5kYS5yb3V0ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5PX0xBQk9SQUJMRVNfV1MgfSBmcm9tICcuLy4uL2NvbnN0YW50cy9leHQtdXJscy5jb25zdGFudHMnO1xyXG5pbXBvcnQgeyBBR0VOREFTX0NPTExFQ1RJT04sIEZFUklBRE9TX0NPTExFQ1RJT04gfSBmcm9tICcuLy4uL2NvbnN0YW50cy9jb2xsZWN0aW9ucy5jb25zdGFudHMnO1xyXG5pbXBvcnQgeyBGZXJpYWRvIH0gZnJvbSAnLi8uLi9pbnRlcmZhY2VzL2ZlcmlhZG8uaW50ZXJmYWNlcyc7XHJcbmltcG9ydCB7IElBZ2VuZGEsIElSYW5nb3NFeGNsdWlyIH0gZnJvbSAnLi8uLi9pbnRlcmZhY2VzL2FnZW5kYS5pbnRlcmZhY2VzJztcclxuaW1wb3J0IHsgUm91dGVyLCBSZXF1ZXN0LCBSZXNwb25zZSwgTmV4dEZ1bmN0aW9uIH0gZnJvbSAnZXhwcmVzcyc7XHJcbmltcG9ydCAqIGFzIGRhdGFiYXNlIGZyb20gJy4uL2RhdGFiYXNlL2RhdGFiYXNlJztcclxuaW1wb3J0IHsgT2JqZWN0SUQgfSBmcm9tICdtb25nb2RiJztcclxuaW1wb3J0ICogYXMgXyBmcm9tICd1bmRlcnNjb3JlJztcclxuaW1wb3J0ICogYXMgcmVxdWVzdCBmcm9tICdyZXF1ZXN0JztcclxuaW1wb3J0ICogYXMgbW9tZW50IGZyb20gJ21vbWVudCc7XHJcbmltcG9ydCB7IERhdGVSYW5nZSB9IGZyb20gJ21vbWVudC1yYW5nZSc7XHJcbmltcG9ydCAqIGFzIGFzeW5jIGZyb20gJ2FzeW5jJztcclxuaW1wb3J0IHsgTGFib3JhYmxlIH0gZnJvbSAnLi8uLi91dGlscy9sYWJvcmFibGVzLnV0aWwnO1xyXG5cclxuY29uc3QgbGFib3JhYmxlVXRpbCA9IG5ldyBMYWJvcmFibGUoKTtcclxuZXhwb3J0IGNsYXNzIEFnZW5kYXNSb3V0ZXIge1xyXG4gIHJvdXRlcjogUm91dGVyXHJcblxyXG4gIC8qKlxyXG4gICAqIEluaXRpYWxpemUgdGhlIEFnZW5kYXNSb3V0ZXJcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHRoaXMucm91dGVyID0gUm91dGVyKCk7XHJcbiAgICB0aGlzLmluaXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNFVCBuZXcgQWdlbmRhIGZvciBNRC5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0TmV3KHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSwgbmV4dDogTmV4dEZ1bmN0aW9uKSB7XHJcbiAgICBsZXQgYXVkaXRvcmlhSW5mbyA9IHsgZmVjaGFBbHRhOiBuZXcgRGF0ZSgpLCBmZWNoYU1vZGlmaWNhY2lvbjogbnVsbCB9O1xyXG4gICAgbGV0IGVudGl0eSA9IE9iamVjdC5hc3NpZ24oe30sIF8ub21pdChyZXEuYm9keSwgJ19pZCcpLCBhdWRpdG9yaWFJbmZvLFxyXG4gICAgICAvL0kgaGF2ZSB0byBvdmVyd3JpdGUgbWVkaWNvSWQgYmVjYXVzZSBpdCBjb21lcyBhcyBhIHN0cmluZyBhbmQgaSBuZWVkIGl0IGFzIE9iamVjdElEXHJcbiAgICAgIHsgbWVkaWNvSWQ6IE9iamVjdElELmNyZWF0ZUZyb21IZXhTdHJpbmcocmVxLmJvZHkubWVkaWNvSWQpIH0pO1xyXG4gICAgLypkYXRhYmFzZS5nZXREQigpLmNvbGxlY3Rpb24oJ2FnZW5kYXMnKVxyXG4gICAgICAuaW5zZXJ0KGVudGl0eSwgKGVyciwgcmVzdWx0KSA9PiB7XHJcbiAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgdGhyb3cgZXJyO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXMuc2VuZChyZXN1bHQub3BzWzBdKTsqL1xyXG4gICAgICAgIC8vbGV0IGFnZW5kYTogQWdlbmRhID0gcmVzdWx0Lm9wc1swXTtcclxuICAgICAgICBsZXQgYWdlbmRhOiBJQWdlbmRhID0gZW50aXR5O1xyXG4gICAgICAgIGxldCB0dXJub3NBcnJheTpBcnJheTxzdHJpbmc+ID0gW107XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogR2VuZXJhIGxvcyB0dXJub3MgYmFzYWRvcyBlbiBsbyBxdWUgZWwgdXN1YXJpbyBjYXJnbyBlbiBsYSBhZ2VuZGFcclxuICAgICAgICAgKi9cclxuICAgICAgICBsZXQgYWhvcmEgPSBtb21lbnQoKTtcclxuICAgICAgICAvL2xldCBhbGd1blRpZW1wb0Rlc2RlQWhvcmEgPSBtb21lbnQoKS5hZGQoMywgJ3cnKTtcclxuICAgICAgICBsZXQgYWxndW5UaWVtcG9EZXNkZUFob3JhID0gbW9tZW50KCkuYWRkKDIsICd5Jyk7XHJcbiAgICAgICAgbGV0IHJhbmdvQ2FsZW5kYXJpbyA9IG5ldyBEYXRlUmFuZ2UoYWhvcmEsIGFsZ3VuVGllbXBvRGVzZGVBaG9yYSk7XHJcbiAgICAgICAgbGV0IHJhbmdvc0V4Y2x1aXI6IElSYW5nb3NFeGNsdWlyID0ge1xyXG4gICAgICAgICAgZGlhczogW10sXHJcbiAgICAgICAgICBob3JhcmlvczogW11cclxuICAgICAgICB9O1xyXG4gICAgICAgIC8vZGVibyBleGNsdWlyIGxvcyByYW5nb3MgZGUgZGlhcyBhIGV4Y2x1aXIgcXVlIGVzcGVjaWZpY28gZWwgbWVkaWNvXHJcbiAgICAgICAgYWdlbmRhLmV4Y2x1aXIucmFuZ28ubWFwKHBlcmlvZG8gPT4ge1xyXG4gICAgICAgICAgbGV0IGRlc2RlOiBtb21lbnQuTW9tZW50ID0gbW9tZW50KHBlcmlvZG8uZGVzZGUsIFwiWVlZWS1NTS1ERFwiKS5ob3VycygwKS5taW51dGVzKDApLnNlY29uZHMoMCk7XHJcbiAgICAgICAgICBsZXQgaGFzdGE6IG1vbWVudC5Nb21lbnQgPSBtb21lbnQocGVyaW9kby5oYXN0YSwgXCJZWVlZLU1NLUREXCIpLmhvdXJzKDIzKS5taW51dGVzKDU5KS5zZWNvbmRzKDU5KTtcclxuICAgICAgICAgIC8vZ2VuZXJvIGVsIHJhbmdvIGJhc2FkbyBlbiBkaWEgZGVzZGUgeSBoYXN0YSB5IGxvIHN1YnN0cmFpZ28gZGVsIHJhbmdvIGNhbGVuZGFyaW9cclxuICAgICAgICAgIHJhbmdvc0V4Y2x1aXIuZGlhcy5wdXNoKG5ldyBEYXRlUmFuZ2UoZGVzZGUsIGhhc3RhKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy9haG9yYSBkZWJvIGV4Y2x1aXIgbGFzIGhvcmFzIHBhcnRpY3VsYXJlcyBkZSBsb3MgZGlhcyBlc3BlY2lmaWNvcyBxdWUgZWwgbWVkaWNvIGRlc2VhIGV4Y2x1aXJcclxuICAgICAgICBhZ2VuZGEuZXhjbHVpci5kaWFzLm1hcChkaWEgPT4ge1xyXG4gICAgICAgICAgLy9lbCBtZWRpY28gcHVlZGUgZXNwZWNpZmljYXIgdW4gYXJyYXkgZGUgaG9yYXJpb3MgYXNpIHF1ZSBkZWJvIGl0ZXJhciBwb3IgY2FkYSB1bm9cclxuICAgICAgICAgIGRpYS5ob3Jhcmlvcy5tYXAoaG9yYXJpbyA9PiB7XHJcbiAgICAgICAgICAgIC8vZGVzZGUgZXMgZWwgZGlhXHJcbiAgICAgICAgICAgIGxldCBkZXNkZTogbW9tZW50Lk1vbWVudCA9IG1vbWVudChkaWEuZmVjaGEsIFwiWVlZWS1NTS1ERFwiKTtcclxuICAgICAgICAgICAgLy95IGhhc3RhIHRhbWJpZW4gcG9yIGVzbyBsbyBjbG9ub1xyXG4gICAgICAgICAgICBsZXQgaGFzdGE6IG1vbWVudC5Nb21lbnQgPSBkZXNkZS5jbG9uZSgpO1xyXG4gICAgICAgICAgICBkZXNkZS5ob3VycyhwYXJzZUludChob3JhcmlvLmRlc2RlLnNwbGl0KFwiOlwiKVswXSkpLm1pbnV0ZXMocGFyc2VJbnQoaG9yYXJpby5kZXNkZS5zcGxpdChcIjpcIilbMV0pKTtcclxuICAgICAgICAgICAgaGFzdGEuaG91cnMocGFyc2VJbnQoaG9yYXJpby5oYXN0YS5zcGxpdChcIjpcIilbMF0pKS5taW51dGVzKHBhcnNlSW50KGhvcmFyaW8uaGFzdGEuc3BsaXQoXCI6XCIpWzFdKSk7XHJcbiAgICAgICAgICAgIHJhbmdvc0V4Y2x1aXIuaG9yYXJpb3MucHVzaChuZXcgRGF0ZVJhbmdlKGRlc2RlLCBoYXN0YSkpO1xyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vZHVyYWNpb24gZGVsIHR1cm5vIGVuIG1pbnV0b3NcclxuICAgICAgICBjb25zdCBkdXJhY2lvblR1cm5vID0gYWdlbmRhLmR1cmFjaW9uVHVybm87XHJcbiAgICAgICAgLy9sZXQgdHdvWWVhcnNGcm9tTm93ID0gbW9tZW50KCkuYWRkKDIsICd5Jyk7XHJcbiAgICAgICAgLy9sZXQgY2FsZW5kYXJSYW5nZSA9IG5ldyBEYXRlUmFuZ2Uobm93LCB0d29ZZWFyc0Zyb21Ob3cpO1xyXG5cclxuICAgICAgICBjb25zdCBkaWFzID0gQXJyYXkuZnJvbShyYW5nb0NhbGVuZGFyaW8uYnkoJ2RheXMnKSk7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICAgKiBQb3IgY2FkYSBkaWEgZGVibyB2ZXJpZmljYXIgcXVlXHJcbiAgICAgICAgICAgKiAxKSBFbCBudW1lcm8gZGUgZGlhIGRlIGxhIHNlbWFuYVxyXG4gICAgICAgICAgICogICAgc2VhIGlndWFsIGEgYWxndW5vIGRlIGxvcyBudW1lcm9zIHF1ZSBlc3RhbiBlbiBsYSBhZ2VuZGFcclxuICAgICAgICAgICAqICAgIGEpIFNpIGVzIGlndWFsIGVudG9uY2VzIHBvciBjYWRhIHJhbmdvIGhvcmFyaW8gZ2VuZXJvIGVsIHR1cm5vXHJcbiAgICAgICAgICAgKiAgICBiKSBTaSBubyBlcyBpZ3VhbCB0ZW5nbyBxdWUgdmVyaWZpY2FyIHF1ZSBubyBzZWEgdW4gZGlhIGV4dHJhb3JkaW5hcmlvXHJcbiAgICAgICAgICAgKi9cclxuICAgICAgICBkaWFzLm1hcChkaWFBY3R1YWwgPT4ge1xyXG4gICAgICAgICAgbGV0IGVzdGFFeGNsdWlkbyA9IGZhbHNlO1xyXG4gICAgICAgICAgcmFuZ29zRXhjbHVpci5kaWFzLm1hcChyYW5nbyA9PiB7XHJcbiAgICAgICAgICAgIGlmIChyYW5nby5jb250YWlucyhkaWFBY3R1YWwpKVxyXG4gICAgICAgICAgICAgIGVzdGFFeGNsdWlkbyA9IHRydWU7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgLy9yZXByZXNlbnRhIGVsIG51bWVybyBkZSBkaWEgZGUgbGEgc2VtYW5hXHJcbiAgICAgICAgICBsZXQgbnVtZXJvRGVEaWEgPSBwYXJzZUludChkaWFBY3R1YWwuZm9ybWF0KCdkJykpO1xyXG4gICAgICAgICAgbGV0IGVzZURpYVRyYWJhamEgPSBhZ2VuZGEuZGlhcy5maWx0ZXIoZGlhID0+IGRpYS5udW1lcm8gPT09IG51bWVyb0RlRGlhKS5sZW5ndGggPiAwO1xyXG4gICAgICAgICAgbGV0IGVzRmVyaWFkbyA9IGxhYm9yYWJsZVV0aWwuZXNOb0xhYm9yYWJsZShkaWFBY3R1YWwpO1xyXG4gICAgICAgICAgaWYgKGVzZURpYVRyYWJhamEgJiYgIWVzdGFFeGNsdWlkbyAmJiAhZXNGZXJpYWRvKSB7XHJcbiAgICAgICAgICAgIGxldCBob3JhcmlvcyA9IGFnZW5kYS5kaWFzLmZpbmQoZGlhID0+IGRpYS5udW1lcm8gPT09IG51bWVyb0RlRGlhKS5ob3JhcmlvcztcclxuICAgICAgICAgICAgaG9yYXJpb3MubWFwKGhvcmFyaW8gPT4ge1xyXG4gICAgICAgICAgICAgIGxldCBkZXNkZSA9IG1vbWVudChkaWFBY3R1YWwpXHJcbiAgICAgICAgICAgICAgICAvL2hvcmFyaW8uZGVzZGUgPSBcIjIwOjUwXCIsIHVzYW5kbyBzcGxpdCBvYnRlbmdvIHVuIGFycmF5IGNvbiBbXCIyMFwiLFwiNTBcIl1cclxuICAgICAgICAgICAgICAgIC5ob3VycyhwYXJzZUludChob3JhcmlvLmRlc2RlLnNwbGl0KFwiOlwiKVswXSkpXHJcbiAgICAgICAgICAgICAgICAubWludXRlcyhwYXJzZUludChob3JhcmlvLmRlc2RlLnNwbGl0KFwiOlwiKVsxXSkpO1xyXG4gICAgICAgICAgICAgIGxldCBoYXN0YSA9IG1vbWVudChkaWFBY3R1YWwpXHJcbiAgICAgICAgICAgICAgICAuaG91cnMocGFyc2VJbnQoaG9yYXJpby5oYXN0YS5zcGxpdChcIjpcIilbMF0pKVxyXG4gICAgICAgICAgICAgICAgLm1pbnV0ZXMocGFyc2VJbnQoaG9yYXJpby5oYXN0YS5zcGxpdChcIjpcIilbMV0pKTtcclxuICAgICAgICAgICAgICBsZXQgcmFuZ29Ib3JhcmlvID0gbmV3IERhdGVSYW5nZShkZXNkZSwgaGFzdGEpO1xyXG4gICAgICAgICAgICAgIC8vQ3JlbyBsb3MgbW9tZW50b3MgYmFzYWRvcyBlbiBlbCByYW5nbyBob3JhcmlvLCBjYWRhIDE1IG1pbnV0b3MgZXhjbHV5ZW5kbyBlbCBsaW1pdGVcclxuICAgICAgICAgICAgICBjb25zdCB0dXJub3MgPSBBcnJheS5mcm9tKHJhbmdvSG9yYXJpby5ieSgnbWludXRlcycsXHJcbiAgICAgICAgICAgICAgICB7IGV4Y2x1c2l2ZTogdHJ1ZSwgc3RlcDogZHVyYWNpb25UdXJubyB9XHJcbiAgICAgICAgICAgICAgKSk7XHJcbiAgICAgICAgICAgICAgdHVybm9zLm1hcCgodHVybm8sIGluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZXN0YUV4Y2x1aWRvID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICByYW5nb3NFeGNsdWlyLmhvcmFyaW9zLm1hcChyYW5nbyA9PiB7XHJcbiAgICAgICAgICAgICAgICAgIGlmIChyYW5nby5jb250YWlucyh0dXJubykpXHJcbiAgICAgICAgICAgICAgICAgICAgZXN0YUV4Y2x1aWRvID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFlc3RhRXhjbHVpZG8pIHtcclxuICAgICAgICAgICAgICAgICAgdHVybm9zQXJyYXkucHVzaCh0dXJuby5mb3JtYXQoXCJERC1NTS1ZWVlZIEhIOm1tXCIpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJlcy5qc29uKHR1cm5vc0FycmF5KTtcclxuXHJcbiAgICAgIC8vfSk7XHJcblxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR0VUIGFsbCBBZ2VuZGFzIG9mIGNlcnRhaW4gTUQuXHJcbiAgICovXHJcbiAgcHVibGljIGdldEJ5TWVkaWNvKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSwgbmV4dDogTmV4dEZ1bmN0aW9uKSB7XHJcbiAgICBkYXRhYmFzZS5nZXREQigpLmNvbGxlY3Rpb24oQUdFTkRBU19DT0xMRUNUSU9OKVxyXG4gICAgICAuZmluZCh7fSkudG9BcnJheSgoZXJyLCBhZ2VuZGFzKSA9PiB7XHJcbiAgICAgICAgaWYgKGVycilcclxuICAgICAgICAgIHRocm93IGVycjtcclxuICAgICAgICByZXMuanNvbihhZ2VuZGFzKTtcclxuICAgICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTRVRVUCBkZSBmZXJpYWRvc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRVcEZlcmlhZG9zKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSwgbmV4dDogTmV4dEZ1bmN0aW9uKSB7XHJcbiAgICByZXF1ZXN0KE5PX0xBQk9SQUJMRVNfV1MgKyByZXEucGFyYW1zLmFuaW8sIGZ1bmN0aW9uIChlcnJvciwgcmVzcG9uc2UsIGJvZHkpIHtcclxuICAgICAgaWYgKCFlcnJvciAmJiByZXNwb25zZS5zdGF0dXNDb2RlID09IDIwMCkge1xyXG4gICAgICAgIC8vQm9ycmFyIGZlcmlhZG9zIHBhcmEgZXNlIGHDsW8gc2kgZXhpc3RlblxyXG4gICAgICAgIGRhdGFiYXNlLmdldERCKCkuY29sbGVjdGlvbignZmVyaWFkb3MnKVxyXG4gICAgICAgICAgLmRlbGV0ZU1hbnkoeyBhbmlvOiBwYXJzZUludChyZXEucGFyYW1zLmFuaW8pIH0sIChlcnIpID0+IHtcclxuICAgICAgICAgICAgaWYgKGVycilcclxuICAgICAgICAgICAgICB0aHJvdyBlcnI7XHJcbiAgICAgICAgICAgIC8vVW5hIHZleiBib3JyYWRvcyBsb3MgYW50ZXJpb3JlcyBkZWJvIGd1YXJkYXIgbG9zIG51ZXZvc1xyXG4gICAgICAgICAgICBsZXQgZmVyaWFkb3M6IEFycmF5PEZlcmlhZG8+ID0gSlNPTi5wYXJzZShib2R5KTsgLy8gUHJpbnQgdGhlIGdvb2dsZSB3ZWIgcGFnZS5cclxuICAgICAgICAgICAgYXN5bmMuZWFjaE9mKGZlcmlhZG9zLCAoZmVyaWFkbywga2V5LCBjYWxsYmFjaykgPT4ge1xyXG4gICAgICAgICAgICAgIGRhdGFiYXNlLmdldERCKCkuY29sbGVjdGlvbihGRVJJQURPU19DT0xMRUNUSU9OKVxyXG4gICAgICAgICAgICAgICAgLmluc2VydCh7XHJcbiAgICAgICAgICAgICAgICAgIGZlY2hhOiBtb21lbnQoYCR7ZmVyaWFkby5kaWF9LSR7ZmVyaWFkby5tZXN9LSR7cmVxLmJvZHkuYW5pb31gLCAnRC1NLVlZWVknKS50b0RhdGUoKSxcclxuICAgICAgICAgICAgICAgICAgYW5pbzogcGFyc2VJbnQocmVxLnBhcmFtcy5hbmlvKVxyXG4gICAgICAgICAgICAgICAgfSwgKGVyciwgYWdlbmRhcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICBpZiAoZXJyKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIpO1xyXG4gICAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9LCAoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgICAgaWYgKGVycilcclxuICAgICAgICAgICAgICAgIHRocm93IGVycjtcclxuICAgICAgICAgICAgICByZXR1cm4gcmVzLmpzb24oZmVyaWFkb3MpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRha2UgZWFjaCBoYW5kbGVyLCBhbmQgYXR0YWNoIHRvIG9uZSBvZiB0aGUgRXhwcmVzcy5Sb3V0ZXInc1xyXG4gICAqIGVuZHBvaW50cy5cclxuICAgKi9cclxuICBpbml0KCkge1xyXG4gICAgdGhpcy5yb3V0ZXIuZ2V0KCcvJywgdGhpcy5nZXRCeU1lZGljbyk7XHJcbiAgICB0aGlzLnJvdXRlci5wb3N0KCcvJywgdGhpcy5zZXROZXcpO1xyXG4gICAgdGhpcy5yb3V0ZXIucG9zdCgnL3NldHVwZmVyaWFkb3MvOmFuaW8nLCB0aGlzLnNldFVwRmVyaWFkb3MpO1xyXG4gICAgLy9UT0RPIHRoaXMucm91dGVyLnBvc3QoJy86aWQnLCB0aGlzLmdldE9uZSk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBDcmVhdGUgdGhlIEhlcm9Sb3V0ZXIsIGFuZCBleHBvcnQgaXRzIGNvbmZpZ3VyZWQgRXhwcmVzcy5Sb3V0ZXJcclxuY29uc3QgYWdlbmRhc1JvdXRlciA9IG5ldyBBZ2VuZGFzUm91dGVyKCk7XHJcbmFnZW5kYXNSb3V0ZXIuaW5pdCgpO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgYWdlbmRhc1JvdXRlci5yb3V0ZXI7XHJcblxyXG5cclxuIl0sInNvdXJjZVJvb3QiOiIuLiJ9
