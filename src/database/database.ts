
import * as mongodb from "mongodb";
let MongoClient = mongodb.MongoClient;

let _db;



  export function connectToServer(){
    console.log("Connect to server called")
    MongoClient.connect( "mongodb://localhost/saludya", function( err, db ) {
        if(err){
            console.log(err);
        }
      _db = db;
      console.log("Database started");
      
    } );
  };

  export function getDB():mongodb.Db {
    return _db;
  }
