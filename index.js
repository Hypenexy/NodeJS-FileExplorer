const fs = require('fs');

// Server
var http, server;

http = require('http');
server = http.createServer(function (req, res) {
    console.log('An http user connected');
    res.writeHead(200, {'Content-Type': 'text/html'});
    if(req.url=="/favicon.ico"){
        res.end();
        return;
    }
    res.write(`<style>
        a{display:block;}
    </style>`);
    req.url = req.url.replaceAll("%20", " ");
    res.write(iterateFolder(req.url));
    res.end();
});


server.listen(3000, () => {
    console.log('Server listening on *:3000');
});

function iterateFolder(folder){
    var html = "";
    if(!fs.existsSync(folder)){
        html = "Path is not a folder or a file";
        return html;
    }
    if(folder!="/"){
        var parentFolder = folder.split('/');
        parentFolder.pop();
        parentFolder = parentFolder.join('/');
        if(parentFolder==""){
            parentFolder = "/";
        }
        html += `<a href="${parentFolder}">..</a>`;
    }
    fs.readdirSync(folder).forEach(file => {
        const path = `${folder}/${file}`;
        var webPath = path;
        if(path.startsWith("//")){
            webPath = path.slice(1, path.length);
        }

        var isDir;
        try {
            isDir = fs.lstatSync(path).isDirectory();
        } catch (error) {}

        if(isDir){
            html += `<a href='${webPath}'>${file}</a>`;
        }
        else{
            html += `<a>${file}</a>`;
        }
    });
    return html;
}

// Am I supposed to run "npm i"?