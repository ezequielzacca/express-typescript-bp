"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const database = require("../database/database");
class Laborable {
    constructor() {
        this._diasNoLaborables = [];
        this.initialize();
    }
    initialize() {
        setTimeout(() => {
            database.getDB().collection('feriados').find({}).toArray((err, feriados) => {
                if (err)
                    throw err;
                feriados.map(feriado => {
                    this._diasNoLaborables.push(moment(feriado.fecha));
                });
            });
        }, 2000);
    }
    esNoLaborable(fecha) {
        let toReturn = false;
        //Por ahora no controlamos si es fin de semana
        /*if (isWeekendDay(fecha)) {
            console.log('Es fin de semana');
            toReturn = true;
            
        }*/
        this._diasNoLaborables.map(feriado => {
            if (feriado.isSame(fecha, 'day')) {
                console.log('Es feriado');
                toReturn = true;
            }
        });
        return toReturn;
    }
}
exports.Laborable = Laborable;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlscy9sYWJvcmFibGVzLnV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxpQ0FBaUM7QUFHakMsaURBQWlEO0FBRWpEO0lBR0k7UUFGUSxzQkFBaUIsR0FBeUIsRUFBRSxDQUFDO1FBR2pELElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUN0QixDQUFDO0lBRU8sVUFBVTtRQUNkLFVBQVUsQ0FBQztZQUNQLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxRQUFRO2dCQUNuRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUM7b0JBQ0osTUFBTSxHQUFHLENBQUM7Z0JBQ2QsUUFBUSxDQUFDLEdBQUcsQ0FBQyxPQUFPO29CQUNoQixJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDdkQsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQTtRQUNOLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUViLENBQUM7SUFFTSxhQUFhLENBQUMsS0FBb0I7UUFDckMsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDO1FBQ3JCLDhDQUE4QztRQUM5Qzs7OztXQUlHO1FBRUgsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxPQUFPO1lBQzlCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDL0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDMUIsUUFBUSxHQUFHLElBQUksQ0FBQztZQUNwQixDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLENBQUMsUUFBUSxDQUFDO0lBQ3BCLENBQUM7Q0FDSjtBQXJDRCw4QkFxQ0MiLCJmaWxlIjoidXRpbHMvbGFib3JhYmxlcy51dGlsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgbW9tZW50IGZyb20gJ21vbWVudCc7XHJcbmltcG9ydCB7IERhdGVSYW5nZSB9IGZyb20gJ21vbWVudC1yYW5nZSc7XHJcbmltcG9ydCB7IGlzV2Vla2VuZERheSB9IGZyb20gJ21vbWVudC1idXNpbmVzcyc7XHJcbmltcG9ydCAqIGFzIGRhdGFiYXNlIGZyb20gJy4uL2RhdGFiYXNlL2RhdGFiYXNlJztcclxuXHJcbmV4cG9ydCBjbGFzcyBMYWJvcmFibGUge1xyXG4gICAgcHJpdmF0ZSBfZGlhc05vTGFib3JhYmxlczogQXJyYXk8bW9tZW50Lk1vbWVudD4gPSBbXTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmluaXRpYWxpemUoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGluaXRpYWxpemUoKSB7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIGRhdGFiYXNlLmdldERCKCkuY29sbGVjdGlvbignZmVyaWFkb3MnKS5maW5kKHt9KS50b0FycmF5KChlcnIsIGZlcmlhZG9zKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXJyKVxyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcclxuICAgICAgICAgICAgICAgIGZlcmlhZG9zLm1hcChmZXJpYWRvID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9kaWFzTm9MYWJvcmFibGVzLnB1c2gobW9tZW50KGZlcmlhZG8uZmVjaGEpKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0sIDIwMDApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZXNOb0xhYm9yYWJsZShmZWNoYTogbW9tZW50Lk1vbWVudCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCB0b1JldHVybiA9IGZhbHNlO1xyXG4gICAgICAgIC8vUG9yIGFob3JhIG5vIGNvbnRyb2xhbW9zIHNpIGVzIGZpbiBkZSBzZW1hbmFcclxuICAgICAgICAvKmlmIChpc1dlZWtlbmREYXkoZmVjaGEpKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdFcyBmaW4gZGUgc2VtYW5hJyk7XHJcbiAgICAgICAgICAgIHRvUmV0dXJuID0gdHJ1ZTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgfSovXHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5fZGlhc05vTGFib3JhYmxlcy5tYXAoZmVyaWFkbyA9PiB7XHJcbiAgICAgICAgICAgIGlmIChmZXJpYWRvLmlzU2FtZShmZWNoYSwgJ2RheScpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnRXMgZmVyaWFkbycpO1xyXG4gICAgICAgICAgICAgICAgdG9SZXR1cm4gPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRvUmV0dXJuO1xyXG4gICAgfVxyXG59Il0sInNvdXJjZVJvb3QiOiIuLiJ9
