// Add requirements
const express = require("express");
const multer = require('multer');
const mysql = require('mysql')

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
  res.sendFile(__dirname + "/html/index.html");
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
        return res.end("Error uploading file.");
      } else if (rows.affectedRows == 1) {
        console.log("File not downloaded yet");
        connection.query(
          `SELECT original_name \
          FROM uploads \
          WHERE saved_name = '${savedName}';`,
          (err, rows, fields) => {
            if (err) {
              console.log(err);
              return res.end("Error uploading file.");
            } else if (rows.length == 1) {
              console.log("Sending file");
              let originalName = rows[0].original_name;
              console.log(rows);
              console.log(originalName);
              const file = `${__dirname}/../uploads/${savedName}`;
              res.download(file, originalName);
            } else {
              console.log("Couldn't send file");
              return res.end("Error uploading file.");
            }
          }
        );
      } else {
        console.log("File already downloaded");
        return res.end("Error uploading file.");
      }
    }
  );
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
      res.end("File is uploaded");
  });
});

connection.connect();
app.listen(port, () => {
  console.log(`Started server on port ${port}`);
});
