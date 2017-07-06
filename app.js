const got = require('got');
const nodemailer = require('nodemailer');
const moment = require('moment');
const gmail = require("./credenciales/gmail.js");

// Lista de sitios web objetivo para realizar peticiones
let targetSites = ['http://www.geoprocess.com.co/', 'http://www.gis-data.co/'];

// Funcion que consulta el estado de una peticion a un sitio web
function checkState(site) {
    got(site).then(response => {
        // El codigo de respuesta es 200, la peticion se procesa correctamente.
        //console.log('response: ' + Object.keys(response));
        console.log('----------------------------------------------------');
        console.log('Hora Local: ' + moment().format('MMMM Do YYYY, h:mm:ss a'));
        console.log('response.url: ' + response.url);
        console.log('response.statusCode: ' + response.statusCode);
        console.log('response.statusMessage: ' + response.statusMessage);
        console.log('----------------------------------------------------');
    }).catch(error => {
        // El codigo de respuesta es diferente a 200, la peticion no se procesa correctamente.
        //console.log('error: ' + Object.keys(error));
        console.log('----------------------------------------------------');
        console.log('Hora Local: ' + moment().format('MMMM Do YYYY, h:mm:ss a'));
        console.log('error.url: ' + error.url);
        console.log('error.code: ' + error.code);
        console.log('error.name: ' + error.name);
        console.log('error.statusCode: ' + error.statusCode);
        console.log('error.statusMessage: ' + error.statusMessage);
        console.log('----------------------------------------------------');
        // Configurar mensaje para notificar mediante un Email
        let para = 'sebaxtianrioss@gmail.com';
        let asunto = 'Check HTTP State';
        let mensaje = 'La peticion al sitio web no se procesa correctamente:\n\n';
        mensaje += 'Hora Local: ' + moment().format('MMMM Do YYYY, h:mm:ss a') + '\n\n';
        mensaje += 'error.url: ' + error.url + '\n';
        mensaje += 'error.code: ' + error.code + '\n';
        mensaje += 'error.name: ' + error.name + '\n';
        mensaje += 'error.statusCode: ' + error.statusCode + '\n';
        mensaje += 'error.statusMessage: ' + error.statusMessage + '\n';
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
*/
