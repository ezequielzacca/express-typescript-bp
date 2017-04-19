"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const logger = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const moment = require("moment");
moment.locale('es');
//Database related stuff
const database = require("./database/database");
//Routers
const medicos_route_1 = require("./routes/medicos.route");
const especialidad_route_1 = require("./routes/especialidad.route");
const obrasocial_route_1 = require("./routes/obrasocial.route");
const paciente_route_1 = require("./routes/paciente.route");
const agenda_route_1 = require("./routes/agenda.route");
// Creates and configures an ExpressJS web server.
class App {
    //Run configuration methods on the Express instance.
    constructor() {
        this.express = express();
        this.middleware();
        this.setupDatabase();
        this.routes();
    }
    // Configure Express middleware.
    middleware() {
        this.express.use(logger('dev'));
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));
        this.express.use(cors());
    }
    // Configure Express middleware.
    setupDatabase() {
        database.connectToServer();
    }
    // Configure API endpoints.
    routes() {
        /* This is just to get up and running, and to make sure what we've got is
         * working so far. This function will change when we start to add more
         * API endpoints */
        let router = express.Router();
        // placeholder route handler
        //this.express.use('/', router);
        this.express.use('/api/v1/medicos', medicos_route_1.default);
        this.express.use('/api/v1/especialidades', especialidad_route_1.default);
        this.express.use('/api/v1/obras/sociales', obrasocial_route_1.default);
        this.express.use('/api/v1/pacientes', paciente_route_1.default);
        this.express.use('/api/v1/agendas', agenda_route_1.default);
        /*router.get('/', (req, res, next) => {
            
            res.json({
                message: 'Hello World!',
                array:[12,13,{hola:"mundo v3"}]
            });
        });*/
        //Aca yo pondria todas las rutas de mi app
    }
}
exports.default = new App().express;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9hcHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFHQSxtQ0FBbUM7QUFDbkMsaUNBQWlDO0FBQ2pDLDBDQUEwQztBQUMxQyw2QkFBNkI7QUFDN0IsaUNBQWlDO0FBQ2pDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDcEIsd0JBQXdCO0FBQ3hCLGdEQUFpRDtBQUlqRCxTQUFTO0FBQ1QsMERBQW1EO0FBQ25ELG9FQUE2RDtBQUM3RCxnRUFBeUQ7QUFDekQsNERBQXFEO0FBQ3JELHdEQUFrRDtBQUlsRCxrREFBa0Q7QUFDbEQ7SUFLSSxvREFBb0Q7SUFDcEQ7UUFDSSxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sRUFBRSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNsQixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDckIsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ2xCLENBQUM7SUFFRCxnQ0FBZ0M7SUFDeEIsVUFBVTtRQUNkLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzdELElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7SUFFN0IsQ0FBQztJQUVELGdDQUFnQztJQUN4QixhQUFhO1FBQ2pCLFFBQVEsQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUUvQixDQUFDO0lBRUQsMkJBQTJCO0lBQ25CLE1BQU07UUFDVjs7MkJBRW1CO1FBQ25CLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUM5Qiw0QkFBNEI7UUFFNUIsZ0NBQWdDO1FBQ2hDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFLHVCQUFhLENBQUMsQ0FBQztRQUNuRCxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsRUFBRSw0QkFBa0IsQ0FBQyxDQUFDO1FBQy9ELElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLHdCQUF3QixFQUFFLDBCQUFnQixDQUFDLENBQUM7UUFDN0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsd0JBQWMsQ0FBQyxDQUFDO1FBQ3RELElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFLHNCQUFhLENBQUMsQ0FBQztRQUNuRDs7Ozs7O2FBTUs7UUFDTCwwQ0FBMEM7SUFDOUMsQ0FBQztDQUVKO0FBRUQsa0JBQWUsSUFBSSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXHJcblxyXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgKiBhcyBleHByZXNzIGZyb20gJ2V4cHJlc3MnO1xyXG5pbXBvcnQgKiBhcyBsb2dnZXIgZnJvbSAnbW9yZ2FuJztcclxuaW1wb3J0ICogYXMgYm9keVBhcnNlciBmcm9tICdib2R5LXBhcnNlcic7XHJcbmltcG9ydCAqIGFzIGNvcnMgZnJvbSAnY29ycyc7XHJcbmltcG9ydCAqIGFzIG1vbWVudCBmcm9tICdtb21lbnQnO1xyXG5tb21lbnQubG9jYWxlKCdlcycpO1xyXG4vL0RhdGFiYXNlIHJlbGF0ZWQgc3R1ZmZcclxuaW1wb3J0ICogYXMgZGF0YWJhc2UgZnJvbSAgXCIuL2RhdGFiYXNlL2RhdGFiYXNlXCI7XHJcblxyXG5cclxuXHJcbi8vUm91dGVyc1xyXG5pbXBvcnQgTWVkaWNvc1JvdXRlciBmcm9tIFwiLi9yb3V0ZXMvbWVkaWNvcy5yb3V0ZVwiO1xyXG5pbXBvcnQgRXNwZWNpYWxpZGFkUm91dGVyIGZyb20gXCIuL3JvdXRlcy9lc3BlY2lhbGlkYWQucm91dGVcIjtcclxuaW1wb3J0IE9icmFTb2NpYWxSb3V0ZXIgZnJvbSAnLi9yb3V0ZXMvb2JyYXNvY2lhbC5yb3V0ZSc7XHJcbmltcG9ydCBQYWNpZW50ZVJvdXRlciBmcm9tICcuL3JvdXRlcy9wYWNpZW50ZS5yb3V0ZSc7XHJcbmltcG9ydCBBZ2VuZGFzUm91dGVyIGZyb20gJy4vcm91dGVzL2FnZW5kYS5yb3V0ZSc7XHJcblxyXG5cclxuXHJcbi8vIENyZWF0ZXMgYW5kIGNvbmZpZ3VyZXMgYW4gRXhwcmVzc0pTIHdlYiBzZXJ2ZXIuXHJcbmNsYXNzIEFwcCB7XHJcblxyXG4gICAgLy8gcmVmIHRvIEV4cHJlc3MgaW5zdGFuY2VcclxuICAgIHB1YmxpYyBleHByZXNzOiBleHByZXNzLkFwcGxpY2F0aW9uO1xyXG5cclxuICAgIC8vUnVuIGNvbmZpZ3VyYXRpb24gbWV0aG9kcyBvbiB0aGUgRXhwcmVzcyBpbnN0YW5jZS5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZXhwcmVzcyA9IGV4cHJlc3MoKTtcclxuICAgICAgICB0aGlzLm1pZGRsZXdhcmUoKTtcclxuICAgICAgICB0aGlzLnNldHVwRGF0YWJhc2UoKTtcclxuICAgICAgICB0aGlzLnJvdXRlcygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENvbmZpZ3VyZSBFeHByZXNzIG1pZGRsZXdhcmUuXHJcbiAgICBwcml2YXRlIG1pZGRsZXdhcmUoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5leHByZXNzLnVzZShsb2dnZXIoJ2RldicpKTtcclxuICAgICAgICB0aGlzLmV4cHJlc3MudXNlKGJvZHlQYXJzZXIuanNvbigpKTtcclxuICAgICAgICB0aGlzLmV4cHJlc3MudXNlKGJvZHlQYXJzZXIudXJsZW5jb2RlZCh7IGV4dGVuZGVkOiBmYWxzZSB9KSk7XHJcbiAgICAgICAgdGhpcy5leHByZXNzLnVzZShjb3JzKCkpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyBDb25maWd1cmUgRXhwcmVzcyBtaWRkbGV3YXJlLlxyXG4gICAgcHJpdmF0ZSBzZXR1cERhdGFiYXNlKCk6IHZvaWQge1xyXG4gICAgICAgIGRhdGFiYXNlLmNvbm5lY3RUb1NlcnZlcigpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyBDb25maWd1cmUgQVBJIGVuZHBvaW50cy5cclxuICAgIHByaXZhdGUgcm91dGVzKCk6IHZvaWQge1xyXG4gICAgICAgIC8qIFRoaXMgaXMganVzdCB0byBnZXQgdXAgYW5kIHJ1bm5pbmcsIGFuZCB0byBtYWtlIHN1cmUgd2hhdCB3ZSd2ZSBnb3QgaXNcclxuICAgICAgICAgKiB3b3JraW5nIHNvIGZhci4gVGhpcyBmdW5jdGlvbiB3aWxsIGNoYW5nZSB3aGVuIHdlIHN0YXJ0IHRvIGFkZCBtb3JlXHJcbiAgICAgICAgICogQVBJIGVuZHBvaW50cyAqL1xyXG4gICAgICAgIGxldCByb3V0ZXIgPSBleHByZXNzLlJvdXRlcigpO1xyXG4gICAgICAgIC8vIHBsYWNlaG9sZGVyIHJvdXRlIGhhbmRsZXJcclxuICAgICAgICBcclxuICAgICAgICAvL3RoaXMuZXhwcmVzcy51c2UoJy8nLCByb3V0ZXIpO1xyXG4gICAgICAgIHRoaXMuZXhwcmVzcy51c2UoJy9hcGkvdjEvbWVkaWNvcycsIE1lZGljb3NSb3V0ZXIpO1xyXG4gICAgICAgIHRoaXMuZXhwcmVzcy51c2UoJy9hcGkvdjEvZXNwZWNpYWxpZGFkZXMnLCBFc3BlY2lhbGlkYWRSb3V0ZXIpO1xyXG4gICAgICAgIHRoaXMuZXhwcmVzcy51c2UoJy9hcGkvdjEvb2JyYXMvc29jaWFsZXMnLCBPYnJhU29jaWFsUm91dGVyKTtcclxuICAgICAgICB0aGlzLmV4cHJlc3MudXNlKCcvYXBpL3YxL3BhY2llbnRlcycsIFBhY2llbnRlUm91dGVyKTtcclxuICAgICAgICB0aGlzLmV4cHJlc3MudXNlKCcvYXBpL3YxL2FnZW5kYXMnLCBBZ2VuZGFzUm91dGVyKTtcclxuICAgICAgICAvKnJvdXRlci5nZXQoJy8nLCAocmVxLCByZXMsIG5leHQpID0+IHtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHJlcy5qc29uKHtcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdIZWxsbyBXb3JsZCEnLFxyXG4gICAgICAgICAgICAgICAgYXJyYXk6WzEyLDEzLHtob2xhOlwibXVuZG8gdjNcIn1dXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pOyovXHJcbiAgICAgICAgLy9BY2EgeW8gcG9uZHJpYSB0b2RhcyBsYXMgcnV0YXMgZGUgbWkgYXBwXHJcbiAgICB9XHJcblxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBuZXcgQXBwKCkuZXhwcmVzczsiXSwic291cmNlUm9vdCI6IiJ9
