const got = require('got');
const nodemailer = require('nodemailer');
const moment = require('moment');
const gmail = require("./credenciales/gmail.js");
const fs = require('fs');

// Lista de sitios web objetivo para realizar peticiones
let targetSites = ['http://www.geoprocess.com.co/', 'http://www.gis-data.co/'];

// Funcion que consulta el estado de una peticion a un sitio web
function checkState(site) {
    got(site).then(response => {
        // El codigo de respuesta es 200, la peticion se procesa correctamente.
        //console.log('response: ' + Object.keys(response));
        // Configura mensaje para Log
        let mensaje = '----------------------------------------------------\n';
        mensaje += 'Hora Local: ' + moment().format('MMMM Do YYYY, h:mm:ss a') + '\n';
        mensaje += 'response.url: ' + response.url + '\n';
        mensaje += 'response.statusCode: ' + response.statusCode + '\n';
        mensaje += 'response.statusMessage: ' + response.statusMessage + '\n';
        mensaje += '----------------------------------------------------\n\n';
        console.log(mensaje);
        // Escribe sobre archivo de Log
        saveLog(mensaje);
    }).catch(error => {
        // El codigo de respuesta es diferente a 200, la peticion no se procesa correctamente.
        //console.log('error: ' + Object.keys(error));
        // Configurar mensaje para notificar mediante un Email
        let para = 'sebaxtianrioss@gmail.com';
        let asunto = 'Check HTTP State';
        // Configura mensaje para Log
        let mensaje = '----------------------------------------------------\n';
        mensaje += 'Hora Local: ' + moment().format('MMMM Do YYYY, h:mm:ss a') + '\n';
        mensaje += 'error.url: ' + error.url + '\n';
        mensaje += 'error.code: ' + error.code + '\n';
        mensaje += 'error.name: ' + error.name + '\n';
        mensaje += 'error.statusCode: ' + error.statusCode + '\n';
        mensaje += 'error.statusMessage: ' + error.statusMessage + '\n';
        mensaje += '----------------------------------------------------\n\n';
        console.log(mensaje);
        // Escribe sobre archivo de Log
        saveLog(mensaje);
        mensaje += '\n\nPor favor valide si el sitio web esta activo.\n\n';
        // Envia el mensaje
        sendEmail(para, asunto, mensaje);
    });
}

// Funcion que envia un email usando el API de Gmail
function sendEmail(para, asunto, mensaje) {
    // Nodemailer
    let transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            type: 'OAuth2',
            user: gmail.auth.user,
            clientId: gmail.auth.clientId,
            clientSecret: gmail.auth.clientSecret,
            refreshToken: gmail.auth.refreshToken
        }
    });
    let mailsolicitante = {
        from: gmail.auth.name + ' <' + gmail.auth.user + '>',
        bcc: para,
        subject: asunto,
        text: mensaje
    };
    transporter.sendMail(mailsolicitante, function (error, success) {
        if(error) {
            console.log("Error al enviar Email [ERROR::Nodemailer]");
        } else {
            console.log("Exito al enviar Email");
        }
    });
}

// Funcion que escribe un mensaje sobre un archivo de Log
function saveLog(mensaje) {
    // Path del directorios de archivos Log
    let pathDirLogs = './logs/';
    // Archivos del directorio de Logs ordenados por fecha de modificacion
    let logFiles = fs.readdirSync(pathDirLogs);
    logFiles.sort(function(a, b) {
        return fs.statSync(pathDirLogs + a).mtime.getTime() - fs.statSync(pathDirLogs + b).mtime.getTime();
    });
    // Obtiene el ultimo archivo modificado
    let logFile = logFiles[logFiles.length - 1]
    // Valida si existe el archivo
    if(logFile != null) {
        console.log('Ultimo archivo modificado: ' + logFile);
        // Validar el tamanio del archivo
        let stats = fs.statSync(pathDirLogs + logFile);
        let fileSizeInBytes = stats.size;
        console.log('File Size: ' + fileSizeInBytes + ' Bytes');
        // 524288 == 0.5 MB
        if(fileSizeInBytes > 524288) {
            // El archivo es demasiado grande, se crea un nuevo archivo de log
            var res = logFile.split("-")[1].split(".")[0];
            res++;
            logFile = 'check-' + res + '.log';
        }
    } else {
        logFile = 'check-0.log';
    }
    // Escribe el mensaje sobre el archivo de Log
    fs.appendFile(pathDirLogs + logFile, mensaje, function (err) {
        if (err) console.log('Error al escribir mensaje sobre archivo de Log ' + logFile);
        console.log('Exito al escribir mensaje sobre archivo de Log ' + logFile);
    });
}

// Funcion que ejecuta el programa
function init() {
    console.log('');
    console.log('check-http-state');
    console.log(moment().format('MMMM Do YYYY, h:mm:ss a'));
    console.log('Inicia la consulta de todos los sitios web:');
    console.log('');
    // Consulta el estado de todos los sitios web
    for(let i = 0; i < targetSites.length; i++) {
        // Procesos asincronos
        checkState(targetSites[i]);
    }
}

// Inicia la ejecucion del programa
init();


// Pruebas
/*
checkState(targetSites[0]);
checkState(targetSites[1]);
checkState('www.google.com.co');
saveLog('Mensaje');
*/
