var express = require('express');
var router = express.Router();
var ObjectId = require('mongodb').ObjectID;

var mc = require('mongodb').MongoClient;
var fs = require('fs');

var multer = require('multer');
var storage = multer.memoryStorage();
var upload = multer({ storage: storage});

var db, filesCollection;

var entries = [];
var numEntries = 0;
var numFiles = 0;

router.get('/', function(req, res) {
    res.render('index', {title: 'COMP 2406 Log Analysis & Visualization',
			 numFiles: numFiles,
			 numEntries: numEntries});
});

function getLogs(query, returnQuery) {

    console.log("Processing query:");
    console.log(query);

    var logs = [];
    var file = new RegExp(query.file);
    var service = new RegExp(query.service);
    var message = new RegExp(query.message);

    var month = query.month;
    var day = query.day;
    var date = month + " " + day;
    date = new RegExp(date);

    db.collection('logs').find({file : file, service : service, message : message, date : date}).toArray(function(err,data)
    	{
    		for(var i=0; i<data.length;i++)
    			logs.push(data[i]);

    		returnQuery(logs);
    	});
}

function entriesToLines(theLogs) {
		var logArr = [];

		for(var i=0;i<theLogs.length;i++)
		{
			var str = theLogs[i].date + " " + theLogs[i].time + " " +
					  theLogs[i].host + " " + theLogs[i].service + " " +
					  theLogs[i].message;
			logArr.push(str);
		}
    return logArr.join('\n');
}

function doQuery(req, res) {

    var query = { message: req.body.message,
		  service: req.body.service,
		  file: req.body.file,
		  month: req.body.month,
		  day: req.body.day,
		  queryType: req.body.queryType};

    function returnQuery(theLogs) {
		res.json(theLogs);
    }
  
	getLogs(query, returnQuery);
}
router.post('/doQuery', doQuery);

router.post("/uploadLog", upload.single('theFile'), function uploadFile(req, res) {
	
	var theFile = req.file;
	var storedFile;

	function returnResult(err, result){ 
		if (err) {
			res.sendStatus(500);
		} else {
			res.send("Upload succeeded: " + storedFile.name + "\n");
		}
	}
		
	if(theFile) {
		storedFile = {
			name: theFile.originalname,
			size: theFile.size,
			content: theFile.buffer.toString('utf8')
		};
		filesCollection.update({name: theFile.originalname},
								storedFile,
								{upsert: true},
								returnResult);
	    var lines = [];
	   	var logs = {};

	   	lines = theFile.buffer.toString().split('\n');

	    for(var i=0; i<lines.length; i++)
    	{    		
    		if(lines[i] !== "")
    		{
    			var array = lines[i].split(/[ ,]+/);

	    		logs.date = array[0] + " " + array[1];
	   			logs.time = array[2];
	   			logs.host = array[3];
	   			logs.service = array[4].slice(0, -1);
	   			logs.message = array.slice(5).join(" ");
    			logs.file = theFile.originalname;

	    		numEntries++;
		    }

    		entries.push(logs);
    		logs = {};
   		 }
   		numFiles++;
   		db.collection('logs').insert(entries);
	} else
		res.sendStatus(403);
});

router.get('/getFileStats', function(req, res) {
    function returnStats(err, stats) {
        if (err) {
            sendStatus(500);
        } else {
            res.send(stats);
        }
    }
       filesCollection.find().toArray(returnStats);   
});


function getFile(filename, returnQuery) {
    var logs = []
    db.collection('logs').find({file : filename}).toArray(function(err,data)
    	{
    		for(var i=0; i<data.length;i++)
    			logs.push(data[i]);

    		returnQuery(logs);
    	});
}

router.post("/downloadFile", function (req, res) {

   getFile(req.body.downloadFile,function(returnedArray){
   	console.log(returnedArray)
   	res.send(entriesToLines(returnedArray));
   })
   	});

router.post("/")

var connectcallBack = function(err, returnedDB) {
	if (err)
		throw err;
	db = returnedDB;
	filesCollection = db.collection('files');
}

mc.connect('mongodb://localhost/log-demo', connectcallBack);
module.exports = router;
