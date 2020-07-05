// Add requirements
const express = require("express");
const multer = require('multer');
const mysql = require('mysql')
const hbs = require('hbs');
const fs = require('fs')

const app = express();
// Set server's listening port to 8080
const port = 8080;
// Define mysql connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'filebin'
})

app.use(express.static(__dirname + '/public'))
app.set('view engine', 'hbs');
app.set('views', __dirname + '/html');

// Create multer storage object
const storage = multer.diskStorage(
                  {
                    destination: (req, file, callback) => {
                      callback(null, __dirname + '/../uploads');
                    }
                    // Do not define file name, so that multer can set it
                  }
                );

const upload = multer(
                {
                  storage: storage,
                  limits : {
                    fileSize: 20 * 1024 * 1024 // 20 MB
                  }
                }
              ).single('uploadedFile');

app.get('/', (req,res) => {
  res.render('index.hbs');
});

app.get('/download/:id', (req,res) => {
  let savedName = req.params.id;
  // TODO: Validate id
  let currDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
  connection.query(
    `UPDATE uploads
    SET download_date = "${currDateTime}" \
    WHERE saved_name = '${savedName}' \
    AND download_date IS NULL LIMIT 1;`,
    (err, rows, fields) => {
      console.log(rows);
      if (err) {
        console.log(err);
        res.render('error.hbs', { error: "Oops! Something went wrong"});
      } else if (rows.affectedRows == 1) {
        console.log("File not downloaded yet");
        connection.query(
          `SELECT original_name \
          FROM uploads \
          WHERE saved_name = '${savedName}';`,
          (err, rows, fields) => {
            if (err) {
              console.log(err);
              res.render('error.hbs', { error: "Oops! Something went wrong"});
            } else if (rows.length == 1) {
              console.log("Sending file");
              let originalName = rows[0].original_name;
              console.log(rows);
              console.log(originalName);
              const file = `${__dirname}/../uploads/${savedName}`;
              res.download(file, originalName, (err) => {
                if (err) {
                  console.log("Couldn't send file");
                  res.render('error.hbs', { error: "Oops! Something went wrong"});
                } else {
                  fs.unlink(file, (err) => {
                    if (err) {
                      console.log(err);
                    }
                  });
                }
              });
            } else {
              console.log("Couldn't send file");
              res.render('error.hbs', { error: "Oops! Something went wrong"});
            }
          }
        );
      } else {
        console.log("File already downloaded");
        res.render('error.hbs', { error: "File not present or already downloaded"});
      }
    }
  );
});

app.post('/upload', (req,res) => {
  upload(req,res, (err) => {
      if (err) {
          console.log(err);
          res.render('error.hbs', { error: "Oops! Something went wrong"});
      } else {
        console.log(req.file.originalname);
        console.log(req.file.filename);
        
        let currDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
        connection.query(
          `INSERT INTO uploads \
          (original_name, saved_name, upload_date) \
          VALUES \
          ("${req.file.originalname}", "${req.file.filename}", "${currDateTime}");`,
          function (err, rows, fields) {
            if (err) {
              console.log(err);
              res.render('error.hbs', { error: "Oops! Something went wrong"});
            }
        });
        res.render('index.hbs', { status: "Upload successful", filename: `Share this URL: http://localhost:8080/download/${req.file.filename}` });
      }
  });
});

app.use((req, res,next) => {
  res.render('error.hbs', { error: "Oops! Something went wrong"});
});

connection.connect();
app.listen(port, () => {
  console.log(`Started server on port ${port}`);
});
