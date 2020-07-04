const express = require("express");
const multer = require('multer');
var mysql = require('mysql')

const app =  express();
const port = 8080;
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'filebin'
})

const storage = multer.diskStorage(
                  {
                    destination: (req, file, callback) => {
                      callback(null, __dirname + '/../uploads');
                    }
                  }
                );

const upload = multer(
                {
                  storage: storage,
                  limits : {
                    fileSize: 20480
                  }
                }
              ).single('uploadedFile');

app.get('/', (req,res) => {
  res.sendFile(__dirname + "/html/index.html");
});

app.post('/upload', (req,res) => {
  upload(req,res, (err) => {
      if (err) {
          console.log(err);
          return res.end("Error uploading file.");
      }
      console.log(req.file.originalname);
      console.log(req.file.filename);
      
      let currDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
      connection.connect()
      connection.query(
        `INSERT INTO uploads \
        (original_name, saved_name, upload_date) \
        VALUES \
        ("${req.file.originalname}", "${req.file.filename}", "${currDateTime}");`,
        function (err, rows, fields) {
          if (err) {
            console.log(err);
            return res.end("Error uploading file.");
          }
      });
      connection.end()
      res.end("File is uploaded");
  });
});

app.listen(port, () => {
  console.log(`Started server on port ${port}`);
});
