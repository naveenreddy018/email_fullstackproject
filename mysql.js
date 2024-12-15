var mysql = require("mysql");
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'naveen',
  password : '123',
  database : 'test'
});
 


connection.connect((err)=>{
    if(err){
        console.log(err.message)
    }else{
        console.log("data base connected")
    }

});

module.exports = connection;

