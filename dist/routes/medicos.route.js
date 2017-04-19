"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const collections_constants_1 = require("./../constants/collections.constants");
const express_1 = require("express");
const database = require("../database/database");
const mongodb_1 = require("mongodb");
const _ = require("underscore");
class MedicosRouter {
    /**
     * Initialize the MedicosRouter
     */
    constructor() {
        this.router = express_1.Router();
        this.init();
    }
    /**
     * GET all Medicos.
     */
    getAll(req, res, next) {
        database.getDB().collection(collections_constants_1.MEDICOS_COLLECTION).find({}).toArray((err, medicos) => {
            if (err)
                throw err;
            res.json(medicos);
        });
    }
    /**
     * GET all Medicos.
     */
    createOne(req, res, next) {
        let auditoriaInfo = { fechaAlta: new Date(), fechaModificacion: null };
        let entity = Object.assign({}, _.omit(req.body, '_id'), auditoriaInfo);
        database.getDB().collection(collections_constants_1.MEDICOS_COLLECTION).insert(entity, (err, result) => {
            if (err) {
                throw err;
            }
            res.send(result.ops[0]);
        });
    }
    /**
    * GET all Medicos.
    */
    getOne(req, res, next) {
        console.log(req.params.id);
        database.getDB().collection(collections_constants_1.MEDICOS_COLLECTION).findOne({ _id: mongodb_1.ObjectID.createFromHexString(req.params.id) }, (err, medico) => {
            if (err)
                throw err;
            res.json(medico);
        });
    }
    /**
     * UPDATE single Medico.
     */
    updateOne(req, res, next) {
        //when updating we need to remove the id property of the object in order to make it inmutable
        let auditoriaInfo = { fechaModificacion: new Date() };
        let entity = Object.assign({}, _.omit(req.body, '_id'), auditoriaInfo);
        database.getDB().collection(collections_constants_1.MEDICOS_COLLECTION).findOneAndUpdate({ _id: mongodb_1.ObjectID.createFromHexString(req.params.id) }, { $set: entity }, (err, result) => {
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
exports.MedicosRouter = MedicosRouter;
// Create the HeroRouter, and export its configured Express.Router
const medicosRouter = new MedicosRouter();
medicosRouter.init();
exports.default = medicosRouter.router;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9yb3V0ZXMvbWVkaWNvcy5yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGdGQUEwRTtBQUUxRSxxQ0FBZ0U7QUFDaEUsaURBQWlEO0FBQ2pELHFDQUFpQztBQUNqQyxnQ0FBZ0M7QUFFaEM7SUFHRTs7T0FFRztJQUNIO1FBQ0UsSUFBSSxDQUFDLE1BQU0sR0FBRyxnQkFBTSxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2QsQ0FBQztJQUVEOztPQUVHO0lBQ0ksTUFBTSxDQUFDLEdBQVksRUFBRSxHQUFhLEVBQUUsSUFBa0I7UUFDM0QsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQywwQ0FBa0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUMsT0FBc0I7WUFDMUYsRUFBRSxDQUFBLENBQUMsR0FBRyxDQUFDO2dCQUNMLE1BQU0sR0FBRyxDQUFDO1lBQ1osR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNwQixDQUFDLENBQUMsQ0FBQztJQUVMLENBQUM7SUFFRDs7T0FFRztJQUNJLFNBQVMsQ0FBQyxHQUFZLEVBQUUsR0FBYSxFQUFFLElBQWtCO1FBQ2hFLElBQUksYUFBYSxHQUFHLEVBQUMsU0FBUyxFQUFDLElBQUksSUFBSSxFQUFFLEVBQUMsaUJBQWlCLEVBQUMsSUFBSSxFQUFDLENBQUM7UUFDbEUsSUFBSSxNQUFNLEdBQVcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFDLEtBQUssQ0FBQyxFQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQzFFLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsMENBQWtCLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFDLENBQUMsR0FBRyxFQUFDLE1BQU07WUFDckUsRUFBRSxDQUFBLENBQUMsR0FBRyxDQUFDLENBQUEsQ0FBQztnQkFDSixNQUFNLEdBQUcsQ0FBQztZQUNkLENBQUM7WUFDRCxHQUFHLENBQUMsSUFBSSxDQUFVLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQyxDQUFDLENBQUMsQ0FBQztJQUVMLENBQUM7SUFFQTs7TUFFRTtJQUNJLE1BQU0sQ0FBQyxHQUFZLEVBQUUsR0FBYSxFQUFFLElBQWtCO1FBQzNELE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMzQixRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLDBDQUFrQixDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUMsR0FBRyxFQUFDLGtCQUFRLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBQyxFQUFDLENBQUMsR0FBRyxFQUFDLE1BQWM7WUFDM0gsRUFBRSxDQUFBLENBQUMsR0FBRyxDQUFDO2dCQUNMLE1BQU0sR0FBRyxDQUFDO1lBQ1osR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNuQixDQUFDLENBQUMsQ0FBQztJQUVMLENBQUM7SUFJRDs7T0FFRztJQUNJLFNBQVMsQ0FBQyxHQUFZLEVBQUUsR0FBYSxFQUFFLElBQWtCO1FBQzlELDZGQUE2RjtRQUM3RixJQUFJLGFBQWEsR0FBRyxFQUFDLGlCQUFpQixFQUFDLElBQUksSUFBSSxFQUFFLEVBQUMsQ0FBQztRQUNuRCxJQUFJLE1BQU0sR0FBVyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUMsS0FBSyxDQUFDLEVBQUMsYUFBYSxDQUFDLENBQUM7UUFDNUUsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQywwQ0FBa0IsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLEVBQUMsR0FBRyxFQUFDLGtCQUFRLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBQyxFQUFDLEVBQUMsSUFBSSxFQUFDLE1BQU0sRUFBQyxFQUFDLENBQUMsR0FBRyxFQUFDLE1BQU07WUFDeEksRUFBRSxDQUFBLENBQUMsR0FBRyxDQUFDLENBQUEsQ0FBQztnQkFDSixNQUFNLEdBQUcsQ0FBQztZQUNkLENBQUM7WUFDRCxHQUFHLENBQUMsSUFBSSxDQUFVLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNwQyxDQUFDLENBQUMsQ0FBQztJQUVMLENBQUM7SUFFRDs7O09BR0c7SUFDSCxJQUFJO1FBQ0YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNsQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDdEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN6Qyw2Q0FBNkM7SUFFL0MsQ0FBQztDQUVGO0FBbEZELHNDQWtGQztBQUVELGtFQUFrRTtBQUNsRSxNQUFNLGFBQWEsR0FBRyxJQUFJLGFBQWEsRUFBRSxDQUFDO0FBQzFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUVyQixrQkFBZSxhQUFhLENBQUMsTUFBTSxDQUFDIiwiZmlsZSI6InJvdXRlcy9tZWRpY29zLnJvdXRlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTUVESUNPU19DT0xMRUNUSU9OIH0gZnJvbSAnLi8uLi9jb25zdGFudHMvY29sbGVjdGlvbnMuY29uc3RhbnRzJztcclxuaW1wb3J0IHsgSU1lZGljbyB9IGZyb20gJy4vLi4vaW50ZXJmYWNlcy9tZWRpY28uaW50ZXJmYWNlcyc7XHJcbmltcG9ydCB7Um91dGVyLCBSZXF1ZXN0LCBSZXNwb25zZSwgTmV4dEZ1bmN0aW9ufSBmcm9tICdleHByZXNzJztcclxuaW1wb3J0ICogYXMgZGF0YWJhc2UgZnJvbSBcIi4uL2RhdGFiYXNlL2RhdGFiYXNlXCI7XHJcbmltcG9ydCB7T2JqZWN0SUR9IGZyb20gXCJtb25nb2RiXCI7XHJcbmltcG9ydCAqIGFzIF8gZnJvbSBcInVuZGVyc2NvcmVcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBNZWRpY29zUm91dGVyIHtcclxuICByb3V0ZXI6IFJvdXRlclxyXG5cclxuICAvKipcclxuICAgKiBJbml0aWFsaXplIHRoZSBNZWRpY29zUm91dGVyXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICB0aGlzLnJvdXRlciA9IFJvdXRlcigpO1xyXG4gICAgdGhpcy5pbml0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHRVQgYWxsIE1lZGljb3MuXHJcbiAgICovXHJcbiAgcHVibGljIGdldEFsbChyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UsIG5leHQ6IE5leHRGdW5jdGlvbikge1xyXG4gICAgZGF0YWJhc2UuZ2V0REIoKS5jb2xsZWN0aW9uKE1FRElDT1NfQ09MTEVDVElPTikuZmluZCh7fSkudG9BcnJheSgoZXJyLG1lZGljb3M6QXJyYXk8SU1lZGljbz4pPT57XHJcbiAgICAgIGlmKGVycilcclxuICAgICAgICB0aHJvdyBlcnI7XHJcbiAgICAgIHJlcy5qc29uKG1lZGljb3MpO1xyXG4gICAgfSk7ICBcclxuICAgIFxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR0VUIGFsbCBNZWRpY29zLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBjcmVhdGVPbmUocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlLCBuZXh0OiBOZXh0RnVuY3Rpb24pIHtcclxuICBsZXQgYXVkaXRvcmlhSW5mbyA9IHtmZWNoYUFsdGE6bmV3IERhdGUoKSxmZWNoYU1vZGlmaWNhY2lvbjpudWxsfTtcclxuICBsZXQgZW50aXR5OklNZWRpY28gPSBPYmplY3QuYXNzaWduKHt9LF8ub21pdChyZXEuYm9keSwnX2lkJyksYXVkaXRvcmlhSW5mbyk7XHJcbiAgICBkYXRhYmFzZS5nZXREQigpLmNvbGxlY3Rpb24oTUVESUNPU19DT0xMRUNUSU9OKS5pbnNlcnQoZW50aXR5LChlcnIscmVzdWx0KT0+e1xyXG4gICAgICAgIGlmKGVycil7XHJcbiAgICAgICAgICAgIHRocm93IGVycjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVzLnNlbmQoPElNZWRpY28+cmVzdWx0Lm9wc1swXSk7XHJcbiAgICB9KTsgIFxyXG4gICAgXHJcbiAgfVxyXG5cclxuICAgLyoqXHJcbiAgICogR0VUIGFsbCBNZWRpY29zLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRPbmUocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlLCBuZXh0OiBOZXh0RnVuY3Rpb24pIHtcclxuICAgIGNvbnNvbGUubG9nKHJlcS5wYXJhbXMuaWQpO1xyXG4gICAgZGF0YWJhc2UuZ2V0REIoKS5jb2xsZWN0aW9uKE1FRElDT1NfQ09MTEVDVElPTikuZmluZE9uZSh7X2lkOk9iamVjdElELmNyZWF0ZUZyb21IZXhTdHJpbmcocmVxLnBhcmFtcy5pZCl9LChlcnIsbWVkaWNvOklNZWRpY28pPT57XHJcbiAgICAgIGlmKGVycilcclxuICAgICAgICB0aHJvdyBlcnI7XHJcbiAgICAgIHJlcy5qc29uKG1lZGljbyk7XHJcbiAgICB9KTsgIFxyXG4gICAgXHJcbiAgfVxyXG5cclxuICBcclxuXHJcbiAgLyoqXHJcbiAgICogVVBEQVRFIHNpbmdsZSBNZWRpY28uXHJcbiAgICovXHJcbiAgcHVibGljIHVwZGF0ZU9uZShyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UsIG5leHQ6IE5leHRGdW5jdGlvbikge1xyXG4gICAgLy93aGVuIHVwZGF0aW5nIHdlIG5lZWQgdG8gcmVtb3ZlIHRoZSBpZCBwcm9wZXJ0eSBvZiB0aGUgb2JqZWN0IGluIG9yZGVyIHRvIG1ha2UgaXQgaW5tdXRhYmxlXHJcbiAgICBsZXQgYXVkaXRvcmlhSW5mbyA9IHtmZWNoYU1vZGlmaWNhY2lvbjpuZXcgRGF0ZSgpfTtcclxuICAgIGxldCBlbnRpdHk6SU1lZGljbyA9IE9iamVjdC5hc3NpZ24oe30sXy5vbWl0KHJlcS5ib2R5LCdfaWQnKSxhdWRpdG9yaWFJbmZvKTtcclxuICAgIGRhdGFiYXNlLmdldERCKCkuY29sbGVjdGlvbihNRURJQ09TX0NPTExFQ1RJT04pLmZpbmRPbmVBbmRVcGRhdGUoe19pZDpPYmplY3RJRC5jcmVhdGVGcm9tSGV4U3RyaW5nKHJlcS5wYXJhbXMuaWQpfSx7JHNldDplbnRpdHl9LChlcnIscmVzdWx0KT0+e1xyXG4gICAgICAgIGlmKGVycil7XHJcbiAgICAgICAgICAgIHRocm93IGVycjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVzLnNlbmQoPElNZWRpY28+cmVzdWx0LnZhbHVlKTtcclxuICAgIH0pOyAgXHJcbiAgICBcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRha2UgZWFjaCBoYW5kbGVyLCBhbmQgYXR0YWNoIHRvIG9uZSBvZiB0aGUgRXhwcmVzcy5Sb3V0ZXInc1xyXG4gICAqIGVuZHBvaW50cy5cclxuICAgKi9cclxuICBpbml0KCkge1xyXG4gICAgdGhpcy5yb3V0ZXIuZ2V0KCcvJywgdGhpcy5nZXRBbGwpO1xyXG4gICAgdGhpcy5yb3V0ZXIuZ2V0KCcvOmlkJywgdGhpcy5nZXRPbmUpO1xyXG4gICAgdGhpcy5yb3V0ZXIucG9zdCgnLycsIHRoaXMuY3JlYXRlT25lKTtcclxuICAgIHRoaXMucm91dGVyLnBvc3QoJy86aWQnLCB0aGlzLnVwZGF0ZU9uZSk7XHJcbiAgICAvL1RPRE8gdGhpcy5yb3V0ZXIucG9zdCgnLzppZCcsIHRoaXMuZ2V0T25lKTtcclxuICAgIFxyXG4gIH1cclxuXHJcbn1cclxuXHJcbi8vIENyZWF0ZSB0aGUgSGVyb1JvdXRlciwgYW5kIGV4cG9ydCBpdHMgY29uZmlndXJlZCBFeHByZXNzLlJvdXRlclxyXG5jb25zdCBtZWRpY29zUm91dGVyID0gbmV3IE1lZGljb3NSb3V0ZXIoKTtcclxubWVkaWNvc1JvdXRlci5pbml0KCk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBtZWRpY29zUm91dGVyLnJvdXRlcjsiXSwic291cmNlUm9vdCI6Ii4uIn0=
