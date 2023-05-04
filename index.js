const fs = require('fs');

// Server
var http, server;

http = require('http');
server = http.createServer(function (req, res) {
    // console.log('An http user connected');
    if(req.url=="/style.css"){
        res.writeHead(200, {
            'Content-Type': 'text/css'
        });
        fs.readFile("style.css", (error, content) => {
            res.write(content);
            res.end();
        });
        return;
    }
    if(req.url=="/folder.svg"){
        res.writeHead(200, {
            'Content-Type': 'image/svg+xml'
        });
        fs.readFile("folder.svg", (error, content) => {
            res.write(content);
            res.end();
        });
        return;
    }
    res.writeHead(200, {'Content-Type': 'text/html'});
    if(req.url=="/favicon.ico"){
        res.end();
        return;
    }
    res.write("<link rel='stylesheet' href='/style.css'>")
    req.url = req.url.replaceAll("%20", " ");
    res.write(iterateFolder(req.url));
    res.end();
});


server.listen(3000, () => {
    console.log('Server listening on *:3000');
});

// Functionality

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
    const directoryInfo = fs
    .readdirSync(folder)
    .map(file => {
        const path = `${folder}/${file}`;
        var webPath = path;
        if(path.startsWith("//")){
            webPath = path.slice(1, path.length);
        }

        var isDir;
        try {
            isDir = fs.lstatSync(path).isDirectory();
        } catch (error) {}

        return {
            name: file,
            path: path,
            webPath: webPath,
            isDir: isDir
        };
    })
    .sort((a, b) => b.isDir - a.isDir || a.name - b.name);

    directoryInfo.forEach(file => {
        if(file.isDir){
            html += `<a href='${file.webPath}'><img src='/folder.svg'>${file.name}</a>`;
        }
        else{
            html += `<a>${file.name}</a>`;
        }
    });
    return html;
}