"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database = require("../database/database");
const mongodb_1 = require("mongodb");
const _ = require("underscore");
class PacientesRouter {
    /**
     * Initialize the PacientesRouter
     */
    constructor() {
        this.router = express_1.Router();
        this.init();
    }
    /**
     * GET all Pacientes.
     */
    getAll(req, res, next) {
        database.getDB().collection('pacientes').find({}).toArray((err, pacientes) => {
            if (err)
                throw err;
            res.json(pacientes);
        });
    }
    /**
     * GET all Pacientes.
     */
    createOne(req, res, next) {
        let auditoriaInfo = { fechaAlta: new Date(), fechaModificacion: null };
        let entity = Object.assign({}, _.omit(req.body, '_id'), auditoriaInfo);
        database.getDB().collection('pacientes').insert(entity, (err, result) => {
            if (err) {
                throw err;
            }
            res.send(result.ops[0]);
        });
    }
    /**
    * GET single Paciente.
    */
    getOne(req, res, next) {
        console.log(req.params.id);
        database.getDB().collection('pacientes').findOne({ _id: mongodb_1.ObjectID.createFromHexString(req.params.id) }, (err, especialidad) => {
            if (err)
                throw err;
            res.json(especialidad);
        });
    }
    /**
     * UPDATE single Paciente.
     */
    updateOne(req, res, next) {
        //when updating we need to remove the id property of the object in order to make it inmutable
        let auditoriaInfo = { fechaModificacion: new Date() };
        let entity = Object.assign({}, _.omit(req.body, '_id'), auditoriaInfo);
        database.getDB().collection('pacientes').findOneAndUpdate({ _id: mongodb_1.ObjectID.createFromHexString(req.params.id) }, { $set: entity }, (err, result) => {
            if (err) {
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
exports.PacientesRouter = PacientesRouter;
// Create the HeroRouter, and export its configured Express.Router
const pacientesRouter = new PacientesRouter();
pacientesRouter.init();
exports.default = pacientesRouter.router;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9yb3V0ZXMvcGFjaWVudGUucm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxQ0FBZ0U7QUFDaEUsaURBQWlEO0FBQ2pELHFDQUFpQztBQUNqQyxnQ0FBZ0M7QUFFaEM7SUFHRTs7T0FFRztJQUNIO1FBQ0UsSUFBSSxDQUFDLE1BQU0sR0FBRyxnQkFBTSxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2QsQ0FBQztJQUVEOztPQUVHO0lBQ0ksTUFBTSxDQUFDLEdBQVksRUFBRSxHQUFhLEVBQUUsSUFBa0I7UUFDM0QsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFDLFNBQVM7WUFDdEUsRUFBRSxDQUFBLENBQUMsR0FBRyxDQUFDO2dCQUNMLE1BQU0sR0FBRyxDQUFDO1lBQ1osR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN0QixDQUFDLENBQUMsQ0FBQztJQUVMLENBQUM7SUFFRDs7T0FFRztJQUNJLFNBQVMsQ0FBQyxHQUFZLEVBQUUsR0FBYSxFQUFFLElBQWtCO1FBQ2hFLElBQUksYUFBYSxHQUFHLEVBQUMsU0FBUyxFQUFDLElBQUksSUFBSSxFQUFFLEVBQUMsaUJBQWlCLEVBQUMsSUFBSSxFQUFDLENBQUM7UUFDbEUsSUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFDLEtBQUssQ0FBQyxFQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ2xFLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBQyxDQUFDLEdBQUcsRUFBQyxNQUFNO1lBQzlELEVBQUUsQ0FBQSxDQUFDLEdBQUcsQ0FBQyxDQUFBLENBQUM7Z0JBQ0osTUFBTSxHQUFHLENBQUM7WUFDZCxDQUFDO1lBQ0QsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUIsQ0FBQyxDQUFDLENBQUM7SUFFTCxDQUFDO0lBRUE7O01BRUU7SUFDSSxNQUFNLENBQUMsR0FBWSxFQUFFLEdBQWEsRUFBRSxJQUFrQjtRQUMzRCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDM0IsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBQyxHQUFHLEVBQUMsa0JBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUMsQ0FBQyxHQUFHLEVBQUMsWUFBWTtZQUNsSCxFQUFFLENBQUEsQ0FBQyxHQUFHLENBQUM7Z0JBQ0wsTUFBTSxHQUFHLENBQUM7WUFDWixHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3pCLENBQUMsQ0FBQyxDQUFDO0lBRUwsQ0FBQztJQUlEOztPQUVHO0lBQ0ksU0FBUyxDQUFDLEdBQVksRUFBRSxHQUFhLEVBQUUsSUFBa0I7UUFDOUQsNkZBQTZGO1FBQzdGLElBQUksYUFBYSxHQUFHLEVBQUMsaUJBQWlCLEVBQUMsSUFBSSxJQUFJLEVBQUUsRUFBQyxDQUFDO1FBQ25ELElBQUksTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBQyxLQUFLLENBQUMsRUFBQyxhQUFhLENBQUMsQ0FBQztRQUNwRSxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLEVBQUMsR0FBRyxFQUFDLGtCQUFRLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBQyxFQUFDLEVBQUMsSUFBSSxFQUFDLE1BQU0sRUFBQyxFQUFDLENBQUMsR0FBRyxFQUFDLE1BQU07WUFDakksRUFBRSxDQUFBLENBQUMsR0FBRyxDQUFDLENBQUEsQ0FBQztnQkFDSixNQUFNLEdBQUcsQ0FBQztZQUNkLENBQUM7WUFDRCxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMzQixDQUFDLENBQUMsQ0FBQztJQUVMLENBQUM7SUFFRDs7O09BR0c7SUFDSCxJQUFJO1FBQ0YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNsQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDdEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN6Qyw2Q0FBNkM7SUFFL0MsQ0FBQztDQUVGO0FBbEZELDBDQWtGQztBQUVELGtFQUFrRTtBQUNsRSxNQUFNLGVBQWUsR0FBRyxJQUFJLGVBQWUsRUFBRSxDQUFDO0FBQzlDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUV2QixrQkFBZSxlQUFlLENBQUMsTUFBTSxDQUFDIiwiZmlsZSI6InJvdXRlcy9wYWNpZW50ZS5yb3V0ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Um91dGVyLCBSZXF1ZXN0LCBSZXNwb25zZSwgTmV4dEZ1bmN0aW9ufSBmcm9tICdleHByZXNzJztcclxuaW1wb3J0ICogYXMgZGF0YWJhc2UgZnJvbSBcIi4uL2RhdGFiYXNlL2RhdGFiYXNlXCI7XHJcbmltcG9ydCB7T2JqZWN0SUR9IGZyb20gXCJtb25nb2RiXCI7XHJcbmltcG9ydCAqIGFzIF8gZnJvbSBcInVuZGVyc2NvcmVcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBQYWNpZW50ZXNSb3V0ZXIge1xyXG4gIHB1YmxpYyByb3V0ZXI6IFJvdXRlclxyXG5cclxuICAvKipcclxuICAgKiBJbml0aWFsaXplIHRoZSBQYWNpZW50ZXNSb3V0ZXJcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHRoaXMucm91dGVyID0gUm91dGVyKCk7XHJcbiAgICB0aGlzLmluaXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdFVCBhbGwgUGFjaWVudGVzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRBbGwocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlLCBuZXh0OiBOZXh0RnVuY3Rpb24pIHtcclxuICAgIGRhdGFiYXNlLmdldERCKCkuY29sbGVjdGlvbigncGFjaWVudGVzJykuZmluZCh7fSkudG9BcnJheSgoZXJyLHBhY2llbnRlcyk9PntcclxuICAgICAgaWYoZXJyKVxyXG4gICAgICAgIHRocm93IGVycjtcclxuICAgICAgcmVzLmpzb24ocGFjaWVudGVzKTtcclxuICAgIH0pOyAgXHJcbiAgICBcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdFVCBhbGwgUGFjaWVudGVzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBjcmVhdGVPbmUocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlLCBuZXh0OiBOZXh0RnVuY3Rpb24pIHtcclxuICBsZXQgYXVkaXRvcmlhSW5mbyA9IHtmZWNoYUFsdGE6bmV3IERhdGUoKSxmZWNoYU1vZGlmaWNhY2lvbjpudWxsfTtcclxuICBsZXQgZW50aXR5ID0gT2JqZWN0LmFzc2lnbih7fSxfLm9taXQocmVxLmJvZHksJ19pZCcpLGF1ZGl0b3JpYUluZm8pO1xyXG4gICAgZGF0YWJhc2UuZ2V0REIoKS5jb2xsZWN0aW9uKCdwYWNpZW50ZXMnKS5pbnNlcnQoZW50aXR5LChlcnIscmVzdWx0KT0+e1xyXG4gICAgICAgIGlmKGVycil7XHJcbiAgICAgICAgICAgIHRocm93IGVycjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVzLnNlbmQocmVzdWx0Lm9wc1swXSk7XHJcbiAgICB9KTsgIFxyXG4gICAgXHJcbiAgfVxyXG5cclxuICAgLyoqXHJcbiAgICogR0VUIHNpbmdsZSBQYWNpZW50ZS5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0T25lKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSwgbmV4dDogTmV4dEZ1bmN0aW9uKSB7XHJcbiAgICBjb25zb2xlLmxvZyhyZXEucGFyYW1zLmlkKTtcclxuICAgIGRhdGFiYXNlLmdldERCKCkuY29sbGVjdGlvbigncGFjaWVudGVzJykuZmluZE9uZSh7X2lkOk9iamVjdElELmNyZWF0ZUZyb21IZXhTdHJpbmcocmVxLnBhcmFtcy5pZCl9LChlcnIsZXNwZWNpYWxpZGFkKT0+e1xyXG4gICAgICBpZihlcnIpXHJcbiAgICAgICAgdGhyb3cgZXJyO1xyXG4gICAgICByZXMuanNvbihlc3BlY2lhbGlkYWQpO1xyXG4gICAgfSk7ICBcclxuICAgIFxyXG4gIH1cclxuXHJcbiAgXHJcblxyXG4gIC8qKlxyXG4gICAqIFVQREFURSBzaW5nbGUgUGFjaWVudGUuXHJcbiAgICovXHJcbiAgcHVibGljIHVwZGF0ZU9uZShyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UsIG5leHQ6IE5leHRGdW5jdGlvbikge1xyXG4gICAgLy93aGVuIHVwZGF0aW5nIHdlIG5lZWQgdG8gcmVtb3ZlIHRoZSBpZCBwcm9wZXJ0eSBvZiB0aGUgb2JqZWN0IGluIG9yZGVyIHRvIG1ha2UgaXQgaW5tdXRhYmxlXHJcbiAgICBsZXQgYXVkaXRvcmlhSW5mbyA9IHtmZWNoYU1vZGlmaWNhY2lvbjpuZXcgRGF0ZSgpfTtcclxuICAgIGxldCBlbnRpdHkgPSBPYmplY3QuYXNzaWduKHt9LF8ub21pdChyZXEuYm9keSwnX2lkJyksYXVkaXRvcmlhSW5mbyk7XHJcbiAgICBkYXRhYmFzZS5nZXREQigpLmNvbGxlY3Rpb24oJ3BhY2llbnRlcycpLmZpbmRPbmVBbmRVcGRhdGUoe19pZDpPYmplY3RJRC5jcmVhdGVGcm9tSGV4U3RyaW5nKHJlcS5wYXJhbXMuaWQpfSx7JHNldDplbnRpdHl9LChlcnIscmVzdWx0KT0+e1xyXG4gICAgICAgIGlmKGVycil7XHJcbiAgICAgICAgICAgIHRocm93IGVycjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVzLnNlbmQocmVzdWx0LnZhbHVlKTtcclxuICAgIH0pOyAgXHJcbiAgICBcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRha2UgZWFjaCBoYW5kbGVyLCBhbmQgYXR0YWNoIHRvIG9uZSBvZiB0aGUgRXhwcmVzcy5Sb3V0ZXInc1xyXG4gICAqIGVuZHBvaW50cy5cclxuICAgKi9cclxuICBpbml0KCkge1xyXG4gICAgdGhpcy5yb3V0ZXIuZ2V0KCcvJywgdGhpcy5nZXRBbGwpO1xyXG4gICAgdGhpcy5yb3V0ZXIuZ2V0KCcvOmlkJywgdGhpcy5nZXRPbmUpO1xyXG4gICAgdGhpcy5yb3V0ZXIucG9zdCgnLycsIHRoaXMuY3JlYXRlT25lKTtcclxuICAgIHRoaXMucm91dGVyLnBvc3QoJy86aWQnLCB0aGlzLnVwZGF0ZU9uZSk7XHJcbiAgICAvL1RPRE8gdGhpcy5yb3V0ZXIucG9zdCgnLzppZCcsIHRoaXMuZ2V0T25lKTtcclxuICAgIFxyXG4gIH1cclxuXHJcbn1cclxuXHJcbi8vIENyZWF0ZSB0aGUgSGVyb1JvdXRlciwgYW5kIGV4cG9ydCBpdHMgY29uZmlndXJlZCBFeHByZXNzLlJvdXRlclxyXG5jb25zdCBwYWNpZW50ZXNSb3V0ZXIgPSBuZXcgUGFjaWVudGVzUm91dGVyKCk7XHJcbnBhY2llbnRlc1JvdXRlci5pbml0KCk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBwYWNpZW50ZXNSb3V0ZXIucm91dGVyOyJdLCJzb3VyY2VSb290IjoiLi4ifQ==
