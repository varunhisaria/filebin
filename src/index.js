const express = require("express");
const multer = require('multer');

const app =  express();
const port = 8080;

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
      console.log(req.file.filename);
      res.end("File is uploaded");
  });
});

app.listen(port, () => {
  console.log(`Started server on port ${port}`);
});
