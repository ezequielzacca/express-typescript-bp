

import * as path from 'path';
import * as express from 'express';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as moment from 'moment';
moment.locale('es');
//Database related stuff
import * as database from  "./database/database";



//Routers
import MedicosRouter from "./routes/medicos.route";
import EspecialidadRouter from "./routes/especialidad.route";
import ObraSocialRouter from './routes/obrasocial.route';
import PacienteRouter from './routes/paciente.route';
import AgendasRouter from './routes/agenda.route';



// Creates and configures an ExpressJS web server.
class App {

    // ref to Express instance
    public express: express.Application;

    //Run configuration methods on the Express instance.
    constructor() {
        this.express = express();
        this.middleware();
        this.setupDatabase();
        this.routes();
    }

    // Configure Express middleware.
    private middleware(): void {
        this.express.use(logger('dev'));
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));
        this.express.use(cors());

    }

    // Configure Express middleware.
    private setupDatabase(): void {
        database.connectToServer();

    }

    // Configure API endpoints.
    private routes(): void {
        /* This is just to get up and running, and to make sure what we've got is
         * working so far. This function will change when we start to add more
         * API endpoints */
        let router = express.Router();
        // placeholder route handler
        
        //this.express.use('/', router);
        this.express.use('/api/v1/medicos', MedicosRouter);
        this.express.use('/api/v1/especialidades', EspecialidadRouter);
        this.express.use('/api/v1/obras/sociales', ObraSocialRouter);
        this.express.use('/api/v1/pacientes', PacienteRouter);
        this.express.use('/api/v1/agendas', AgendasRouter);
        /*router.get('/', (req, res, next) => {
            
            res.json({
                message: 'Hello World!',
                array:[12,13,{hola:"mundo v3"}]
            });
        });*/
        //Aca yo pondria todas las rutas de mi app
    }

}

export default new App().express;