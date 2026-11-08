process.on("SIGINT",() => {
    console.log("SIGINT received... exiting process");
	process.exit();
});

process.on("SIGTERM",() => {
    console.log("SIGTERM received... exiting process");
	process.exit();
});


const express = require('express');

const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.raw({ type: "*/*",limit:512000000 }))

app.use(morgan('dev'));

app.get("/download/:filename", (req,res) => {
    res.sendFile(process.env.DUMMY_FILES_DIR+path.sep+req.params.filename);
});

app.get("/ping", (req,res) => {
    
    res.sendStatus(200);
});

app.post("/upload", (req,res) => {
    req.on("end",() => {
       res.sendStatus(200);
    });
});

//start app 
const port = process.env.PORT || 5100;

app.listen(port, () => 
  console.log(`App is listening on port ${port}.`)
);