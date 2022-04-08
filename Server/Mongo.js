const {MongoClient} = require('mongodb');

async function getConnection(){
	const url = "mongodb://usrRegistraInfoFit:PnjyBop.3@10.1.99.25:27017";
    var client = new MongoClient(url);
 
    try {
 		var connection = await client.connect();
	  	//console.log("Conexión mongo realizada")
 		return connection;
    } catch (e) {
        console.log("Conexión mongo rechazada")
	  	return null;
    } 
}

async function closeConnection(connection){
	if(connection){
		await connection.close();
		//console.log("close connection")
	}
}

async function getCollectionsNames(){
	console.log("COLLECTIONS: ")
    collections.forEach(c =>{
    	console.log(c.s.namespace.collection)
	})
}

module.exports = { getConnection, closeConnection };


