var express = require('express')
var bodyParser = require('body-parser')
var fs = require('fs')
var busboy = require('connect-busboy')
var spawn = require('child_process').spawn
var exec = require('child_process').exec
var port = 4869

var server = express()

server.listen(port)
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: true }))
server.use(busboy())

server.get('/', function(req, res) {
    res.send('welcome')
})

server.post('/upload', function(req, res) {
    var fstream
    req.pipe(req.busboy)
    req.busboy.on('file', function(fieldname, file, filename) {
	console.log("uploading: " + filename)
	fstream = fs.createWriteStream('files/' + filename)
	file.pipe(fstream)
	fstream.on('close', function() {
	    // compile stuff here
	    console.log("upload complete")
	    console.log("begin compiling...")
	    var cmd = "pdflatex -halt-on-error -output-directory output files/" + filename
	    console.log("running command: " + cmd)
	    exec(cmd, function(error, stdout, stderr) {
		if (error.length != 0 || stderr.length != 0) {
		    console.log("you messed up")
		    res.setHeader('Content-Type', 'application/json')
		    res.send(JSON.stringify({ success : false }))
		    return
		}
		console.log("compilation done with:\n\t error: " + error + "\n\t stdout: " + stdout + "\n\t stderr: " + stderr)
		nameWithPDF = (filename.substr(0, filename.lastIndexOf('.')) || x) + ".pdf"
		res.sendFile(nameWithPDF, { root : __dirname })
	    })
	    // var child = spawn('pdflatex', ['files/' + filename])
	})
    })
})
