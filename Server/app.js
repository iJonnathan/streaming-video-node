const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors')
const Mongo = require('./Mongo');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());


const MONGO_DB_NAME = "reporteriafit";
const mongodb = require('mongodb');
var client = null;
app.get('/video', async(req, res) =>{

    // Check for range headers to find our start time
    const range = req.headers.range;
    if (!range) {
        console.log("err range")
      res.status(400).send("Requires Range header");
    }

    const db = client.db(MONGO_DB_NAME);
    // GridFS Collection
    db.collection('fs.files').findOne({}, (err, video) => {
      if (!video) {
        console.log("err")
        res.status(404).send("No video uploaded!");
        return;
      }

      // Create response headers
      const videoSize = video.length;
      const chunkSize = 1 * 1e+6;
      const start = Number(range.replace(/\D/g, ''));
      const end = Math.min(start + chunkSize, videoSize - 1);

      const contentLength = end - start + 1;

      const headers = {
        "Content-Range" : `bytes ${start} - ${end}/${videoSize}`,
        "Accept-Ranges" : "bytes",
        "Content-Length": contentLength,
        "Content-Type"  : "video/mp4"
      }

      // HTTP Status 206 for Partial Content
      res.writeHead(206, headers);

      // Get the bucket and download stream from GridFS
      const bucket = new mongodb.GridFSBucket(db);
      const downloadStream = bucket.openDownloadStreamByName('video', {
        start,end
      });
      // Finally pipe video to response
      downloadStream.pipe(res);
    });
});



app.listen('3000', async ()=>{
    client = await Mongo.getConnection();
    // migrarVideoAMongo();
})

async function migrarVideoAMongo(){
    var client = await Mongo.getConnection();
    // connect to the videos database
    const db = client.db(MONGO_DB_NAME);
    // Create GridFS bucket to upload a large file
    const bucket = new mongodb.GridFSBucket(db);
    // create upload stream using GridFS bucket
    const videoUploadStream = bucket.openUploadStream('video');
    // You can put your file instead of bigbuck.mp4
    const videoReadStream = fs.createReadStream('./video.mp4');
    // Finally Upload!
    videoReadStream.pipe(videoUploadStream);
    // All done!
    console.log("video importado...");
}