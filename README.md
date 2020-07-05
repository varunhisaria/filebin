# Filebin
Filebin is an anonymous file sharing web app where users can upload files upto 20 mb. A unique link is generated for each uploaded file, which can be shared with the intended receiver of the file. Each file can be downloaded only once, and any user trying to download a file after it has already been downloaded should get an error.

# Steps to run
- Install mysql v8.0.19
- Start mysql server
- Create databse using script present at `src/datatabase/setupScript.txt`
- Set parameters to connect to mysql server in config.js
- Install node v10.9.0
- Set server's listening port and base URL in config.js
- Install dependencies using `npm i`
- Start node server by executing `node src/index.js` from the root directory's location
