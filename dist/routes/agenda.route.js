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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9yb3V0ZXMvYWdlbmRhLnJvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMEVBQXFFO0FBQ3JFLGdGQUErRjtBQUcvRixxQ0FBa0U7QUFDbEUsaURBQWlEO0FBQ2pELHFDQUFtQztBQUNuQyxnQ0FBZ0M7QUFDaEMsbUNBQW1DO0FBQ25DLGlDQUFpQztBQUNqQywrQ0FBeUM7QUFDekMsK0JBQStCO0FBQy9CLGdFQUF1RDtBQUV2RCxNQUFNLGFBQWEsR0FBRyxJQUFJLDJCQUFTLEVBQUUsQ0FBQztBQUN0QztJQUdFOztPQUVHO0lBQ0g7UUFDRSxJQUFJLENBQUMsTUFBTSxHQUFHLGdCQUFNLEVBQUUsQ0FBQztRQUN2QixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDZCxDQUFDO0lBRUQ7O09BRUc7SUFDSSxNQUFNLENBQUMsR0FBWSxFQUFFLEdBQWEsRUFBRSxJQUFrQjtRQUMzRCxJQUFJLGFBQWEsR0FBRyxFQUFFLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRSxFQUFFLGlCQUFpQixFQUFFLElBQUksRUFBRSxDQUFDO1FBQ3ZFLElBQUksTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxhQUFhO1FBQ25FLHFGQUFxRjtRQUNyRixFQUFFLFFBQVEsRUFBRSxrQkFBUSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2pFOzs7OztzQ0FLOEI7UUFDMUIscUNBQXFDO1FBQ3JDLElBQUksTUFBTSxHQUFZLE1BQU0sQ0FBQztRQUM3QixJQUFJLFdBQVcsR0FBaUIsRUFBRSxDQUFDO1FBQ25DOztXQUVHO1FBQ0gsSUFBSSxLQUFLLEdBQUcsTUFBTSxFQUFFLENBQUM7UUFDckIsbURBQW1EO1FBQ25ELElBQUkscUJBQXFCLEdBQUcsTUFBTSxF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QUNwRixJQUFJLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO3lCQUNoQyxFQUFFLENBQUMsR0FBRyxFQUFFLE9BQU87NEJBQ2QsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDO2dDQUNOLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7NEJBQ3ZCLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQzt3QkFDcEIsQ0FBQyxDQUFDLENBQUM7b0JBQ1AsQ0FBQyxFQUFFLENBQUMsR0FBRzt3QkFDTCxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUM7NEJBQ04sTUFBTSxHQUFHLENBQUM7d0JBQ1osTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQzVCLENBQUMsQ0FBQyxDQUFDO2dCQUNMLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVEOzs7T0FHRztJQUNILElBQUk7UUFDRixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsc0JBQXNCLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQzdELDZDQUE2QztJQUMvQyxDQUFDO0NBQ0Y7QUE3S0Qsc0NBNktDO0FBRUQsa0VBQWtFO0FBQ2xFLE1BQU0sYUFBYSxHQUFHLElBQUksYUFBYSxFQUFFLENBQUM7QUFDMUMsYUFBYSxDQUFDLElBQUksRUFBRSxDQUFDO0FBRXJCLGtCQUFlLGFBQWEsQ0FBQyxNQUFNLENBQUMiLCJmaWxlIjoicm91dGVzL2FnZW5kYS5yb3V0ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5PX0xBQk9SQUJMRVNfV1MgfSBmcm9tICcuLy4uL2NvbnN0YW50cy9leHQtdXJscy5jb25zdGFudHMnO1xyXG5pbXBvcnQgeyBBR0VOREFTX0NPTExFQ1RJT04sIEZFUklBRE9TX0NPTExFQ1RJT04gfSBmcm9tICcuLy4uL2NvbnN0YW50cy9jb2xsZWN0aW9ucy5jb25zdGFudHMnO1xyXG5pbXBvcnQgeyBGZXJpYWRvIH0gZnJvbSAnLi8uLi9pbnRlcmZhY2VzL2ZlcmlhZG8uaW50ZXJmYWNlcyc7XHJcbmltcG9ydCB7IElBZ2VuZGEsIElSYW5nb3NFeGNsdWlyIH0gZnJvbSAnLi8uLi9pbnRlcmZhY2VzL2FnZW5kYS5pbnRlcmZhY2VzJztcclxuaW1wb3J0IHsgUm91dGVyLCBSZXF1ZXN0LCBSZXNwb25zZSwgTmV4dEZ1bmN0aW9uIH0gZnJvbSAnZXhwcmVzcyc7XHJcbmltcG9ydCAqIGFzIGRhdGFiYXNlIGZyb20gJy4uL2RhdGFiYXNlL2RhdGFiYXNlJztcclxuaW1wb3J0IHsgT2JqZWN0SUQgfSBmcm9tICdtb25nb2RiJztcclxuaW1wb3J0ICogYXMgXyBmcm9tICd1bmRlcnNjb3JlJztcclxuaW1wb3J0ICogYXMgcmVxdWVzdCBmcm9tICdyZXF1ZXN0JztcclxuaW1wb3J0ICogYXMgbW9tZW50IGZyb20gJ21vbWVudCc7XHJcbmltcG9ydCB7IERhdGVSYW5nZSB9IGZyb20gJ21vbWVudC1yYW5nZSc7XHJcbmltcG9ydCAqIGFzIGFzeW5jIGZyb20gJ2FzeW5jJztcclxuaW1wb3J0IHsgTGFib3JhYmxlIH0gZnJvbSAnLi8uLi91dGlscy9sYWJvcmFibGVzLnV0aWwnO1xyXG5cclxuY29uc3QgbGFib3JhYmxlVXRpbCA9IG5ldyBMYWJvcmFibGUoKTtcclxuZXhwb3J0IGNsYXNzIEFnZW5kYXNSb3V0ZXIge1xyXG4gIHB1YmxpYyByb3V0ZXI6IFJvdXRlclxyXG5cclxuICAvKipcclxuICAgKiBJbml0aWFsaXplIHRoZSBBZ2VuZGFzUm91dGVyXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICB0aGlzLnJvdXRlciA9IFJvdXRlcigpO1xyXG4gICAgdGhpcy5pbml0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTRVQgbmV3IEFnZW5kYSBmb3IgTUQuXHJcbiAgICovXHJcbiAgcHVibGljIHNldE5ldyhyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UsIG5leHQ6IE5leHRGdW5jdGlvbikge1xyXG4gICAgbGV0IGF1ZGl0b3JpYUluZm8gPSB7IGZlY2hhQWx0YTogbmV3IERhdGUoKSwgZmVjaGFNb2RpZmljYWNpb246IG51bGwgfTtcclxuICAgIGxldCBlbnRpdHkgPSBPYmplY3QuYXNzaWduKHt9LCBfLm9taXQocmVxLmJvZHksICdfaWQnKSwgYXVkaXRvcmlhSW5mbyxcclxuICAgICAgLy9JIGhhdmUgdG8gb3ZlcndyaXRlIG1lZGljb0lkIGJlY2F1c2UgaXQgY29tZXMgYXMgYSBzdHJpbmcgYW5kIGkgbmVlZCBpdCBhcyBPYmplY3RJRFxyXG4gICAgICB7IG1lZGljb0lkOiBPYmplY3RJRC5jcmVhdGVGcm9tSGV4U3RyaW5nKHJlcS5ib2R5Lm1lZGljb0lkKSB9KTtcclxuICAgIC8qZGF0YWJhc2UuZ2V0REIoKS5jb2xsZWN0aW9uKCdhZ2VuZGFzJylcclxuICAgICAgLmluc2VydChlbnRpdHksIChlcnIsIHJlc3VsdCkgPT4ge1xyXG4gICAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICAgIHRocm93IGVycjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVzLnNlbmQocmVzdWx0Lm9wc1swXSk7Ki9cclxuICAgICAgICAvL2xldCBhZ2VuZGE6IEFnZW5kYSA9IHJlc3VsdC5vcHNbMF07XHJcbiAgICAgICAgbGV0IGFnZW5kYTogSUFnZW5kYSA9IGVudGl0eTtcclxuICAgICAgICBsZXQgdHVybm9zQXJyYXk6QXJyYXk8c3RyaW5nPiA9IFtdO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEdlbmVyYSBsb3MgdHVybm9zIGJhc2Fkb3MgZW4gbG8gcXVlIGVsIHVzdWFyaW8gY2FyZ28gZW4gbGEgYWdlbmRhXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgbGV0IGFob3JhID0gbW9tZW50KCk7XHJcbiAgICAgICAgLy9sZXQgYWxndW5UaWVtcG9EZXNkZUFob3JhID0gbW9tZW50KCkuYWRkKDMsICd3Jyk7XHJcbiAgICAgICAgbGV0IGFsZ3VuVGllbXBvRGVzZGVBaG9yYSA9IG1vbWVudCgpLmFkZCgyLCAneScpO1xyXG4gICAgICAgIGxldCByYW5nb0NhbGVuZGFyaW8gPSBuZXcgRGF0ZVJhbmdlKGFob3JhLCBhbGd1blRpZW1wb0Rlc2RlQWhvcmEpO1xyXG4gICAgICAgIGxldCByYW5nb3NFeGNsdWlyOiBJUmFuZ29zRXhjbHVpciA9IHtcclxuICAgICAgICAgIGRpYXM6IFtdLFxyXG4gICAgICAgICAgaG9yYXJpb3M6IFtdXHJcbiAgICAgICAgfTtcclxuICAgICAgICAvL2RlYm8gZXhjbHVpciBsb3MgcmFuZ29zIGRlIGRpYXMgYSBleGNsdWlyIHF1ZSBlc3BlY2lmaWNvIGVsIG1lZGljb1xyXG4gICAgICAgIGFnZW5kYS5leGNsdWlyLnJhbmdvLm1hcChwZXJpb2RvID0+IHtcclxuICAgICAgICAgIGxldCBkZXNkZTogbW9tZW50Lk1vbWVudCA9IG1vbWVudChwZXJpb2RvLmRlc2RlLCBcIllZWVktTU0tRERcIikuaG91cnMoMCkubWludXRlcygwKS5zZWNvbmRzKDApO1xyXG4gICAgICAgICAgbGV0IGhhc3RhOiBtb21lbnQuTW9tZW50ID0gbW9tZW50KHBlcmlvZG8uaGFzdGEsIFwiWVlZWS1NTS1ERFwiKS5ob3VycygyMykubWludXRlcyg1OSkuc2Vjb25kcyg1OSk7XHJcbiAgICAgICAgICAvL2dlbmVybyBlbCByYW5nbyBiYXNhZG8gZW4gZGlhIGRlc2RlIHkgaGFzdGEgeSBsbyBzdWJzdHJhaWdvIGRlbCByYW5nbyBjYWxlbmRhcmlvXHJcbiAgICAgICAgICByYW5nb3NFeGNsdWlyLmRpYXMucHVzaChuZXcgRGF0ZVJhbmdlKGRlc2RlLCBoYXN0YSkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vYWhvcmEgZGVibyBleGNsdWlyIGxhcyBob3JhcyBwYXJ0aWN1bGFyZXMgZGUgbG9zIGRpYXMgZXNwZWNpZmljb3MgcXVlIGVsIG1lZGljbyBkZXNlYSBleGNsdWlyXHJcbiAgICAgICAgYWdlbmRhLmV4Y2x1aXIuZGlhcy5tYXAoZGlhID0+IHtcclxuICAgICAgICAgIC8vZWwgbWVkaWNvIHB1ZWRlIGVzcGVjaWZpY2FyIHVuIGFycmF5IGRlIGhvcmFyaW9zIGFzaSBxdWUgZGVibyBpdGVyYXIgcG9yIGNhZGEgdW5vXHJcbiAgICAgICAgICBkaWEuaG9yYXJpb3MubWFwKGhvcmFyaW8gPT4ge1xyXG4gICAgICAgICAgICAvL2Rlc2RlIGVzIGVsIGRpYVxyXG4gICAgICAgICAgICBsZXQgZGVzZGU6IG1vbWVudC5Nb21lbnQgPSBtb21lbnQoZGlhLmZlY2hhLCBcIllZWVktTU0tRERcIik7XHJcbiAgICAgICAgICAgIC8veSBoYXN0YSB0YW1iaWVuIHBvciBlc28gbG8gY2xvbm9cclxuICAgICAgICAgICAgbGV0IGhhc3RhOiBtb21lbnQuTW9tZW50ID0gZGVzZGUuY2xvbmUoKTtcclxuICAgICAgICAgICAgZGVzZGUuaG91cnMocGFyc2VJbnQoaG9yYXJpby5kZXNkZS5zcGxpdChcIjpcIilbMF0pKS5taW51dGVzKHBhcnNlSW50KGhvcmFyaW8uZGVzZGUuc3BsaXQoXCI6XCIpWzFdKSk7XHJcbiAgICAgICAgICAgIGhhc3RhLmhvdXJzKHBhcnNlSW50KGhvcmFyaW8uaGFzdGEuc3BsaXQoXCI6XCIpWzBdKSkubWludXRlcyhwYXJzZUludChob3JhcmlvLmhhc3RhLnNwbGl0KFwiOlwiKVsxXSkpO1xyXG4gICAgICAgICAgICByYW5nb3NFeGNsdWlyLmhvcmFyaW9zLnB1c2gobmV3IERhdGVSYW5nZShkZXNkZSwgaGFzdGEpKTtcclxuICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICB9KTtcclxuICAgICAgICAvL2R1cmFjaW9uIGRlbCB0dXJubyBlbiBtaW51dG9zXHJcbiAgICAgICAgY29uc3QgZHVyYWNpb25UdXJubyA9IGFnZW5kYS5kdXJhY2lvblR1cm5vO1xyXG4gICAgICAgIC8vbGV0IHR3b1llYXJzRnJvbU5vdyA9IG1vbWVudCgpLmFkZCgyLCAneScpO1xyXG4gICAgICAgIC8vbGV0IGNhbGVuZGFyUmFuZ2UgPSBuZXcgRGF0ZVJhbmdlKG5vdywgdHdvWWVhcnNGcm9tTm93KTtcclxuXHJcbiAgICAgICAgY29uc3QgZGlhcyA9IEFycmF5LmZyb20ocmFuZ29DYWxlbmRhcmlvLmJ5KCdkYXlzJykpO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAgICogUG9yIGNhZGEgZGlhIGRlYm8gdmVyaWZpY2FyIHF1ZVxyXG4gICAgICAgICAgICogMSkgRWwgbnVtZXJvIGRlIGRpYSBkZSBsYSBzZW1hbmFcclxuICAgICAgICAgICAqICAgIHNlYSBpZ3VhbCBhIGFsZ3VubyBkZSBsb3MgbnVtZXJvcyBxdWUgZXN0YW4gZW4gbGEgYWdlbmRhXHJcbiAgICAgICAgICAgKiAgICBhKSBTaSBlcyBpZ3VhbCBlbnRvbmNlcyBwb3IgY2FkYSByYW5nbyBob3JhcmlvIGdlbmVybyBlbCB0dXJub1xyXG4gICAgICAgICAgICogICAgYikgU2kgbm8gZXMgaWd1YWwgdGVuZ28gcXVlIHZlcmlmaWNhciBxdWUgbm8gc2VhIHVuIGRpYSBleHRyYW9yZGluYXJpb1xyXG4gICAgICAgICAgICovXHJcbiAgICAgICAgZGlhcy5tYXAoZGlhQWN0dWFsID0+IHtcclxuICAgICAgICAgIGxldCBlc3RhRXhjbHVpZG8gPSBmYWxzZTtcclxuICAgICAgICAgIHJhbmdvc0V4Y2x1aXIuZGlhcy5tYXAocmFuZ28gPT4ge1xyXG4gICAgICAgICAgICBpZiAocmFuZ28uY29udGFpbnMoZGlhQWN0dWFsKSlcclxuICAgICAgICAgICAgICBlc3RhRXhjbHVpZG8gPSB0cnVlO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC8vcmVwcmVzZW50YSBlbCBudW1lcm8gZGUgZGlhIGRlIGxhIHNlbWFuYVxyXG4gICAgICAgICAgbGV0IG51bWVyb0RlRGlhID0gcGFyc2VJbnQoZGlhQWN0dWFsLmZvcm1hdCgnZCcpKTtcclxuICAgICAgICAgIGxldCBlc2VEaWFUcmFiYWphID0gYWdlbmRhLmRpYXMuZmlsdGVyKGRpYSA9PiBkaWEubnVtZXJvID09PSBudW1lcm9EZURpYSkubGVuZ3RoID4gMDtcclxuICAgICAgICAgIGxldCBlc0ZlcmlhZG8gPSBsYWJvcmFibGVVdGlsLmVzTm9MYWJvcmFibGUoZGlhQWN0dWFsKTtcclxuICAgICAgICAgIGlmIChlc2VEaWFUcmFiYWphICYmICFlc3RhRXhjbHVpZG8gJiYgIWVzRmVyaWFkbykge1xyXG4gICAgICAgICAgICBsZXQgaG9yYXJpb3MgPSBhZ2VuZGEuZGlhcy5maW5kKGRpYSA9PiBkaWEubnVtZXJvID09PSBudW1lcm9EZURpYSkuaG9yYXJpb3M7XHJcbiAgICAgICAgICAgIGhvcmFyaW9zLm1hcChob3JhcmlvID0+IHtcclxuICAgICAgICAgICAgICBsZXQgZGVzZGUgPSBtb21lbnQoZGlhQWN0dWFsKVxyXG4gICAgICAgICAgICAgICAgLy9ob3JhcmlvLmRlc2RlID0gXCIyMDo1MFwiLCB1c2FuZG8gc3BsaXQgb2J0ZW5nbyB1biBhcnJheSBjb24gW1wiMjBcIixcIjUwXCJdXHJcbiAgICAgICAgICAgICAgICAuaG91cnMocGFyc2VJbnQoaG9yYXJpby5kZXNkZS5zcGxpdChcIjpcIilbMF0pKVxyXG4gICAgICAgICAgICAgICAgLm1pbnV0ZXMocGFyc2VJbnQoaG9yYXJpby5kZXNkZS5zcGxpdChcIjpcIilbMV0pKTtcclxuICAgICAgICAgICAgICBsZXQgaGFzdGEgPSBtb21lbnQoZGlhQWN0dWFsKVxyXG4gICAgICAgICAgICAgICAgLmhvdXJzKHBhcnNlSW50KGhvcmFyaW8uaGFzdGEuc3BsaXQoXCI6XCIpWzBdKSlcclxuICAgICAgICAgICAgICAgIC5taW51dGVzKHBhcnNlSW50KGhvcmFyaW8uaGFzdGEuc3BsaXQoXCI6XCIpWzFdKSk7XHJcbiAgICAgICAgICAgICAgbGV0IHJhbmdvSG9yYXJpbyA9IG5ldyBEYXRlUmFuZ2UoZGVzZGUsIGhhc3RhKTtcclxuICAgICAgICAgICAgICAvL0NyZW8gbG9zIG1vbWVudG9zIGJhc2Fkb3MgZW4gZWwgcmFuZ28gaG9yYXJpbywgY2FkYSAxNSBtaW51dG9zIGV4Y2x1eWVuZG8gZWwgbGltaXRlXHJcbiAgICAgICAgICAgICAgY29uc3QgdHVybm9zID0gQXJyYXkuZnJvbShyYW5nb0hvcmFyaW8uYnkoJ21pbnV0ZXMnLFxyXG4gICAgICAgICAgICAgICAgeyBleGNsdXNpdmU6IHRydWUsIHN0ZXA6IGR1cmFjaW9uVHVybm8gfVxyXG4gICAgICAgICAgICAgICkpO1xyXG4gICAgICAgICAgICAgIHR1cm5vcy5tYXAoKHR1cm5vLCBpbmRleCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IGVzdGFFeGNsdWlkbyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgcmFuZ29zRXhjbHVpci5ob3Jhcmlvcy5tYXAocmFuZ28gPT4ge1xyXG4gICAgICAgICAgICAgICAgICBpZiAocmFuZ28uY29udGFpbnModHVybm8pKVxyXG4gICAgICAgICAgICAgICAgICAgIGVzdGFFeGNsdWlkbyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGlmICghZXN0YUV4Y2x1aWRvKSB7XHJcbiAgICAgICAgICAgICAgICAgIHR1cm5vc0FycmF5LnB1c2godHVybm8uZm9ybWF0KFwiREQtTU0tWVlZWSBISDptbVwiKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXMuanNvbih0dXJub3NBcnJheSk7XHJcblxyXG4gICAgICAvL30pO1xyXG5cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdFVCBhbGwgQWdlbmRhcyBvZiBjZXJ0YWluIE1ELlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRCeU1lZGljbyhyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UsIG5leHQ6IE5leHRGdW5jdGlvbikge1xyXG4gICAgZGF0YWJhc2UuZ2V0REIoKS5jb2xsZWN0aW9uKEFHRU5EQVNfQ09MTEVDVElPTilcclxuICAgICAgLmZpbmQoe30pLnRvQXJyYXkoKGVyciwgYWdlbmRhcykgPT4ge1xyXG4gICAgICAgIGlmIChlcnIpXHJcbiAgICAgICAgICB0aHJvdyBlcnI7XHJcbiAgICAgICAgcmVzLmpzb24oYWdlbmRhcyk7XHJcbiAgICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU0VUVVAgZGUgZmVyaWFkb3NcclxuICAgKi9cclxuICBwdWJsaWMgc2V0VXBGZXJpYWRvcyhyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UsIG5leHQ6IE5leHRGdW5jdGlvbikge1xyXG4gICAgcmVxdWVzdChOT19MQUJPUkFCTEVTX1dTICsgcmVxLnBhcmFtcy5hbmlvLCBmdW5jdGlvbiAoZXJyb3IsIHJlc3BvbnNlLCBib2R5KSB7XHJcbiAgICAgIGlmICghZXJyb3IgJiYgcmVzcG9uc2Uuc3RhdHVzQ29kZSA9PSAyMDApIHtcclxuICAgICAgICAvL0JvcnJhciBmZXJpYWRvcyBwYXJhIGVzZSBhw7FvIHNpIGV4aXN0ZW5cclxuICAgICAgICBkYXRhYmFzZS5nZXREQigpLmNvbGxlY3Rpb24oJ2ZlcmlhZG9zJylcclxuICAgICAgICAgIC5kZWxldGVNYW55KHsgYW5pbzogcGFyc2VJbnQocmVxLnBhcmFtcy5hbmlvKSB9LCAoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChlcnIpXHJcbiAgICAgICAgICAgICAgdGhyb3cgZXJyO1xyXG4gICAgICAgICAgICAvL1VuYSB2ZXogYm9ycmFkb3MgbG9zIGFudGVyaW9yZXMgZGVibyBndWFyZGFyIGxvcyBudWV2b3NcclxuICAgICAgICAgICAgbGV0IGZlcmlhZG9zOiBBcnJheTxGZXJpYWRvPiA9IEpTT04ucGFyc2UoYm9keSk7IC8vIFByaW50IHRoZSBnb29nbGUgd2ViIHBhZ2UuXHJcbiAgICAgICAgICAgIGFzeW5jLmVhY2hPZihmZXJpYWRvcywgKGZlcmlhZG8sIGtleSwgY2FsbGJhY2spID0+IHtcclxuICAgICAgICAgICAgICBkYXRhYmFzZS5nZXREQigpLmNvbGxlY3Rpb24oRkVSSUFET1NfQ09MTEVDVElPTilcclxuICAgICAgICAgICAgICAgIC5pbnNlcnQoe1xyXG4gICAgICAgICAgICAgICAgICBmZWNoYTogbW9tZW50KGAke2ZlcmlhZG8uZGlhfS0ke2ZlcmlhZG8ubWVzfS0ke3JlcS5ib2R5LmFuaW99YCwgJ0QtTS1ZWVlZJykudG9EYXRlKCksXHJcbiAgICAgICAgICAgICAgICAgIGFuaW86IHBhcnNlSW50KHJlcS5wYXJhbXMuYW5pbylcclxuICAgICAgICAgICAgICAgIH0sIChlcnIsIGFnZW5kYXMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgaWYgKGVycilcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcclxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSwgKGVycikgPT4ge1xyXG4gICAgICAgICAgICAgIGlmIChlcnIpXHJcbiAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIHJlcy5qc29uKGZlcmlhZG9zKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUYWtlIGVhY2ggaGFuZGxlciwgYW5kIGF0dGFjaCB0byBvbmUgb2YgdGhlIEV4cHJlc3MuUm91dGVyJ3NcclxuICAgKiBlbmRwb2ludHMuXHJcbiAgICovXHJcbiAgaW5pdCgpIHtcclxuICAgIHRoaXMucm91dGVyLmdldCgnLycsIHRoaXMuZ2V0QnlNZWRpY28pO1xyXG4gICAgdGhpcy5yb3V0ZXIucG9zdCgnLycsIHRoaXMuc2V0TmV3KTtcclxuICAgIHRoaXMucm91dGVyLnBvc3QoJy9zZXR1cGZlcmlhZG9zLzphbmlvJywgdGhpcy5zZXRVcEZlcmlhZG9zKTtcclxuICAgIC8vVE9ETyB0aGlzLnJvdXRlci5wb3N0KCcvOmlkJywgdGhpcy5nZXRPbmUpO1xyXG4gIH1cclxufVxyXG5cclxuLy8gQ3JlYXRlIHRoZSBIZXJvUm91dGVyLCBhbmQgZXhwb3J0IGl0cyBjb25maWd1cmVkIEV4cHJlc3MuUm91dGVyXHJcbmNvbnN0IGFnZW5kYXNSb3V0ZXIgPSBuZXcgQWdlbmRhc1JvdXRlcigpO1xyXG5hZ2VuZGFzUm91dGVyLmluaXQoKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGFnZW5kYXNSb3V0ZXIucm91dGVyO1xyXG5cclxuXHJcbiJdLCJzb3VyY2VSb290IjoiLi4ifQ==
