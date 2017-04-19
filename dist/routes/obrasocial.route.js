"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database = require("../database/database");
const mongodb_1 = require("mongodb");
const _ = require("underscore");
class ObraSocialRouter {
    /**
     * Initialize the ObrasSocialesRouter
     */
    constructor() {
        this.router = express_1.Router();
        this.init();
    }
    /**
     * GET all ObrasSociales.
     */
    getAll(req, res, next) {
        database.getDB().collection('obrassociales').find({}).toArray((err, obrasSociales) => {
            if (err)
                throw err;
            res.json(obrasSociales);
        });
    }
    /**
     * GET all ObrasSociales.
     */
    createOne(req, res, next) {
        let auditoriaInfo = { fechaAlta: new Date(), fechaModificacion: null };
        let entity = Object.assign({}, _.omit(req.body, '_id'), auditoriaInfo);
        database.getDB().collection('obrassociales').insert(entity, (err, result) => {
            if (err) {
                throw err;
            }
            res.send(result.ops[0]);
        });
    }
    /**
    * GET single ObraSocial.
    */
    getOne(req, res, next) {
        console.log(req.params.id);
        database.getDB().collection('obrassociales')
            .findOne({ _id: mongodb_1.ObjectID.createFromHexString(req.params.id) }, (err, obraSocial) => {
            if (err)
                throw err;
            //res.json(obraSocial);
        });
    }
    /**
     * UPDATE single ObrasSocial.
     */
    updateOne(req, res, next) {
        //when updating we need to remove the id property of the object in order to make it inmutable
        let auditoriaInfo = { fechaModificacion: new Date() };
        let entity = Object.assign({}, _.omit(req.body, '_id'), auditoriaInfo);
        database.getDB().collection('obrassociales')
            .findOneAndUpdate({ _id: mongodb_1.ObjectID.createFromHexString(req.params.id) }, { $set: entity }, (err, result) => {
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
exports.ObraSocialRouter = ObraSocialRouter;
// Create the HeroRouter, and export its configured Express.Router
const obraSocialRouter = new ObraSocialRouter();
obraSocialRouter.init();
exports.default = obraSocialRouter.router;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9yb3V0ZXMvb2JyYXNvY2lhbC5yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHFDQUFrRTtBQUNsRSxpREFBaUQ7QUFDakQscUNBQW1DO0FBQ25DLGdDQUFnQztBQUVoQztJQUdFOztPQUVHO0lBQ0g7UUFDRSxJQUFJLENBQUMsTUFBTSxHQUFHLGdCQUFNLEVBQUUsQ0FBQztRQUN2QixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDZCxDQUFDO0lBRUQ7O09BRUc7SUFDSSxNQUFNLENBQUMsR0FBWSxFQUFFLEdBQWEsRUFBRSxJQUFrQjtRQUMzRCxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsYUFBYTtZQUMvRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUM7Z0JBQ04sTUFBTSxHQUFHLENBQUM7WUFDWixHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQzFCLENBQUMsQ0FBQyxDQUFDO0lBRUwsQ0FBQztJQUVEOztPQUVHO0lBQ0ksU0FBUyxDQUFDLEdBQVksRUFBRSxHQUFhLEVBQUUsSUFBa0I7UUFDOUQsSUFBSSxhQUFhLEdBQUcsRUFBRSxTQUFTLEVBQUUsSUFBSSxJQUFJLEVBQUUsRUFBRSxpQkFBaUIsRUFBRSxJQUFJLEVBQUUsQ0FBQztRQUN2RSxJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDdkUsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxFQUFFLE1BQU07WUFDdEUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDUixNQUFNLEdBQUcsQ0FBQztZQUNaLENBQUM7WUFDRCxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxQixDQUFDLENBQUMsQ0FBQztJQUVMLENBQUM7SUFFRDs7TUFFRTtJQUNLLE1BQU0sQ0FBQyxHQUFZLEVBQUUsR0FBYSxFQUFFLElBQWtCO1FBQzNELE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMzQixRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQzthQUMzQyxPQUFPLENBQUMsRUFBRSxHQUFHLEVBQUUsa0JBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEVBQUUsVUFBVTtZQUM3RSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUM7Z0JBQ04sTUFBTSxHQUFHLENBQUM7WUFDWix1QkFBdUI7UUFFekIsQ0FBQyxDQUFDLENBQUM7SUFFTCxDQUFDO0lBSUQ7O09BRUc7SUFDSSxTQUFTLENBQUMsR0FBWSxFQUFFLEdBQWEsRUFBRSxJQUFrQjtRQUM5RCw2RkFBNkY7UUFDN0YsSUFBSSxhQUFhLEdBQUcsRUFBRSxpQkFBaUIsRUFBRSxJQUFJLElBQUksRUFBRSxFQUFFLENBQUM7UUFDdEQsSUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQ3ZFLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDO2FBQ3pDLGdCQUFnQixDQUNmLEVBQUUsR0FBRyxFQUFFLGtCQUFRLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUNwRCxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsRUFDaEIsQ0FBQyxHQUFHLEVBQUUsTUFBTTtZQUNWLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ1IsTUFBTSxHQUFHLENBQUM7WUFDWixDQUFDO1lBQ0QsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDM0IsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsSUFBSTtRQUNGLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDekMsNkNBQTZDO0lBRS9DLENBQUM7Q0FFRjtBQXZGRCw0Q0F1RkM7QUFFRCxrRUFBa0U7QUFDbEUsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLGdCQUFnQixFQUFFLENBQUM7QUFDaEQsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLENBQUM7QUFFeEIsa0JBQWUsZ0JBQWdCLENBQUMsTUFBTSxDQUFDIiwiZmlsZSI6InJvdXRlcy9vYnJhc29jaWFsLnJvdXRlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUm91dGVyLCBSZXF1ZXN0LCBSZXNwb25zZSwgTmV4dEZ1bmN0aW9uIH0gZnJvbSAnZXhwcmVzcyc7XHJcbmltcG9ydCAqIGFzIGRhdGFiYXNlIGZyb20gXCIuLi9kYXRhYmFzZS9kYXRhYmFzZVwiO1xyXG5pbXBvcnQgeyBPYmplY3RJRCB9IGZyb20gXCJtb25nb2RiXCI7XHJcbmltcG9ydCAqIGFzIF8gZnJvbSBcInVuZGVyc2NvcmVcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBPYnJhU29jaWFsUm91dGVyIHtcclxuICByb3V0ZXI6IFJvdXRlclxyXG5cclxuICAvKipcclxuICAgKiBJbml0aWFsaXplIHRoZSBPYnJhc1NvY2lhbGVzUm91dGVyXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICB0aGlzLnJvdXRlciA9IFJvdXRlcigpO1xyXG4gICAgdGhpcy5pbml0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHRVQgYWxsIE9icmFzU29jaWFsZXMuXHJcbiAgICovXHJcbiAgcHVibGljIGdldEFsbChyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UsIG5leHQ6IE5leHRGdW5jdGlvbikge1xyXG4gICAgZGF0YWJhc2UuZ2V0REIoKS5jb2xsZWN0aW9uKCdvYnJhc3NvY2lhbGVzJykuZmluZCh7fSkudG9BcnJheSgoZXJyLCBvYnJhc1NvY2lhbGVzKSA9PiB7XHJcbiAgICAgIGlmIChlcnIpXHJcbiAgICAgICAgdGhyb3cgZXJyO1xyXG4gICAgICByZXMuanNvbihvYnJhc1NvY2lhbGVzKTtcclxuICAgIH0pO1xyXG5cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdFVCBhbGwgT2JyYXNTb2NpYWxlcy5cclxuICAgKi9cclxuICBwdWJsaWMgY3JlYXRlT25lKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSwgbmV4dDogTmV4dEZ1bmN0aW9uKSB7XHJcbiAgICBsZXQgYXVkaXRvcmlhSW5mbyA9IHsgZmVjaGFBbHRhOiBuZXcgRGF0ZSgpLCBmZWNoYU1vZGlmaWNhY2lvbjogbnVsbCB9O1xyXG4gICAgbGV0IGVudGl0eSA9IE9iamVjdC5hc3NpZ24oe30sIF8ub21pdChyZXEuYm9keSwgJ19pZCcpLCBhdWRpdG9yaWFJbmZvKTtcclxuICAgIGRhdGFiYXNlLmdldERCKCkuY29sbGVjdGlvbignb2JyYXNzb2NpYWxlcycpLmluc2VydChlbnRpdHksIChlcnIsIHJlc3VsdCkgPT4ge1xyXG4gICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgdGhyb3cgZXJyO1xyXG4gICAgICB9XHJcbiAgICAgIHJlcy5zZW5kKHJlc3VsdC5vcHNbMF0pO1xyXG4gICAgfSk7XHJcblxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBHRVQgc2luZ2xlIE9icmFTb2NpYWwuXHJcbiAgKi9cclxuICBwdWJsaWMgZ2V0T25lKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSwgbmV4dDogTmV4dEZ1bmN0aW9uKSB7XHJcbiAgICBjb25zb2xlLmxvZyhyZXEucGFyYW1zLmlkKTtcclxuICAgIGRhdGFiYXNlLmdldERCKCkuY29sbGVjdGlvbignb2JyYXNzb2NpYWxlcycpXHJcbiAgICAuZmluZE9uZSh7IF9pZDogT2JqZWN0SUQuY3JlYXRlRnJvbUhleFN0cmluZyhyZXEucGFyYW1zLmlkKSB9LCAoZXJyLCBvYnJhU29jaWFsKSA9PiB7XHJcbiAgICAgIGlmIChlcnIpXHJcbiAgICAgICAgdGhyb3cgZXJyO1xyXG4gICAgICAvL3Jlcy5qc29uKG9icmFTb2NpYWwpO1xyXG5cclxuICAgIH0pO1xyXG5cclxuICB9XHJcblxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogVVBEQVRFIHNpbmdsZSBPYnJhc1NvY2lhbC5cclxuICAgKi9cclxuICBwdWJsaWMgdXBkYXRlT25lKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSwgbmV4dDogTmV4dEZ1bmN0aW9uKSB7XHJcbiAgICAvL3doZW4gdXBkYXRpbmcgd2UgbmVlZCB0byByZW1vdmUgdGhlIGlkIHByb3BlcnR5IG9mIHRoZSBvYmplY3QgaW4gb3JkZXIgdG8gbWFrZSBpdCBpbm11dGFibGVcclxuICAgIGxldCBhdWRpdG9yaWFJbmZvID0geyBmZWNoYU1vZGlmaWNhY2lvbjogbmV3IERhdGUoKSB9O1xyXG4gICAgbGV0IGVudGl0eSA9IE9iamVjdC5hc3NpZ24oe30sIF8ub21pdChyZXEuYm9keSwgJ19pZCcpLCBhdWRpdG9yaWFJbmZvKTtcclxuICAgIGRhdGFiYXNlLmdldERCKCkuY29sbGVjdGlvbignb2JyYXNzb2NpYWxlcycpXHJcbiAgICAgIC5maW5kT25lQW5kVXBkYXRlKFxyXG4gICAgICAgIHsgX2lkOiBPYmplY3RJRC5jcmVhdGVGcm9tSGV4U3RyaW5nKHJlcS5wYXJhbXMuaWQpIH0sXHJcbiAgICAgICAgeyAkc2V0OiBlbnRpdHkgfSxcclxuICAgICAgICAoZXJyLCByZXN1bHQpID0+IHtcclxuICAgICAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICAgICAgdGhyb3cgZXJyO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmVzLnNlbmQocmVzdWx0LnZhbHVlKTtcclxuICAgICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUYWtlIGVhY2ggaGFuZGxlciwgYW5kIGF0dGFjaCB0byBvbmUgb2YgdGhlIEV4cHJlc3MuUm91dGVyJ3NcclxuICAgKiBlbmRwb2ludHMuXHJcbiAgICovXHJcbiAgaW5pdCgpIHtcclxuICAgIHRoaXMucm91dGVyLmdldCgnLycsIHRoaXMuZ2V0QWxsKTtcclxuICAgIHRoaXMucm91dGVyLmdldCgnLzppZCcsIHRoaXMuZ2V0T25lKTtcclxuICAgIHRoaXMucm91dGVyLnBvc3QoJy8nLCB0aGlzLmNyZWF0ZU9uZSk7XHJcbiAgICB0aGlzLnJvdXRlci5wb3N0KCcvOmlkJywgdGhpcy51cGRhdGVPbmUpO1xyXG4gICAgLy9UT0RPIHRoaXMucm91dGVyLnBvc3QoJy86aWQnLCB0aGlzLmdldE9uZSk7XHJcblxyXG4gIH1cclxuXHJcbn1cclxuXHJcbi8vIENyZWF0ZSB0aGUgSGVyb1JvdXRlciwgYW5kIGV4cG9ydCBpdHMgY29uZmlndXJlZCBFeHByZXNzLlJvdXRlclxyXG5jb25zdCBvYnJhU29jaWFsUm91dGVyID0gbmV3IE9icmFTb2NpYWxSb3V0ZXIoKTtcclxub2JyYVNvY2lhbFJvdXRlci5pbml0KCk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBvYnJhU29jaWFsUm91dGVyLnJvdXRlcjsiXSwic291cmNlUm9vdCI6Ii4uIn0=
