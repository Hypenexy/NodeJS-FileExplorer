const fs = require('fs');

// Server
var http, server;

http = require('http');
server = http.createServer(function (req, res) {
    // console.log('An http user connected');
    if(req.url=="/assets/styles/style.css"){
        res.writeHead(200, {
            'Content-Type': 'text/css'
        });
        fs.readFile("assets/styles/style.css", (error, content) => {
            res.write(content);
            res.end();
        });
        return;
    }
    if(req.socket.remoteAddress != "::1" && req.socket.remoteAddress != "::ffff:127.0.0.1"){
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        fs.readFile("assets/pages/500.html", (error, content) => {
            res.write(content);
            res.end();
        });
        return;
    }
    if(req.url=="/assets/images/folder.svg"){
        res.writeHead(200, {
            'Content-Type': 'image/svg+xml'
        });
        fs.readFile("assets/images/folder.svg", (error, content) => {
            res.write(content);
            res.end();
        });
        return;
    }
    if(req.url=="/assets/fonts/Material-Icons-Outlined.woff2"){
        res.writeHead(200, {
            'Content-Type': 'font/woff2'
        });
        fs.readFile("assets/fonts/Material-Icons-Outlined.woff2", (error, content) => {
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
    req.url = req.url.replaceAll("%20", " ");
    const files = iterateFolder(req.url);
    var navbarHTML = "<a href='/'>Drive</a>";
    const directories = req.url.split('/');
    for (let i = 1; i < directories.length; i++) {
        const element = directories[i];
        var pathUntilFolder = '';
        for (let m = 1; m < i; m++) {
            if(directories[m]){
                pathUntilFolder += directories[m] + "/";
            }
        }
        navbarHTML += `<i>chevron_right</i> <a href="/${pathUntilFolder}${element}">${element}</a>`;
    }
    // res.write(files);
    fs.readFile("assets/pages/client.html", (error, content) => {
        content = content.toString();
        content = content.replaceAll("{$files}", files);
        content = content.replaceAll("{$navbar}", navbarHTML);
        res.write(content);
        res.end();
    });
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

        var fileStats 
        try {
            fileStats = fs.lstatSync(path);
        } catch (error) {}

        var isDir, size
        if(fileStats){
            isDir = fileStats.isDirectory();
            size = fileStats.size;
        }
        // if(!isDir)

        return {
            name: file,
            path: path,
            webPath: webPath,
            isDir: isDir,
            size: size
        };
    })
    .sort((a, b) => b.isDir - a.isDir || a.name - b.name);

    directoryInfo.forEach(file => {
        if(file.isDir){
            html += `<a href='${file.webPath}'><i>folder</i>${file.name}</a>`;
        }
        else{
            html += `<a><p>${file.name}</p><p>${humanFileSize(file.size)}</p></a>`;
        }
    });
    return html;
}


// From MDUtils.js
function humanFileSize(bytes, si=true, dp=1) {
    const thresh = si ? 1000 : 1024;

    if (Math.abs(bytes) < thresh) {
      return bytes + ' B';
    }

    const units = si 
      ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] 
      : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    const r = 10**dp;

    do {
      bytes /= thresh;
      ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


    return bytes.toFixed(dp) + ' ' + units[u];
}