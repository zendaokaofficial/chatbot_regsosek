const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal'); 
const client = new Client();
const { google } = require('googleapis');
const keys = require("C:/Users/Zenda Oka B/bot-regsosek/regsosekbali-21e7a475c092.json");

const state = {}

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

// baca dari spreadsheet untuk database

const client1 = new google.auth.JWT(
    keys.client_email,
    null,
    keys.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
);

client1.authorize(function(err,tokens){

    if(err){
        console.log(err);
        return;
    } else {
        console.log('Connected!');
        gsrun(client1);
    }
});

async function gsrun(cl){

    const gsapi = google.sheets({version:'v4', auth: cl });

    const opt = {
        spreadsheetId : "1SWx4BhfDhg8804Fd3J1TaAzKQA-EaYfWNbphux4rEGQ",
        range: 'db'
    }

    let data = await gsapi.spreadsheets.values.get(opt);
    
    var kec = [];
    var des = [];
    var sls = [];
    var idslss = [];


    for (var i = 1; i < data.data.values.length; i++) {
        kec.push(data.data.values[i][7]);
        des.push(data.data.values[i][9]);
        idslss.push(data.data.values[i][12]);
        sls.push(data.data.values[i][13]);
    }

    client.on('message', msg => {
        if (msg.body == '!ping') {
            msg.reply('pong');
        }
    });
    
    // membaca dari pesan
    client.on('message', msg => {
        if (state[msg.from] === "konfirmasi") {
            if (msg1.body.includes("ya")) {
                        msg1.reply('Terima kasih atas laporannya');
                    } else if (msg1.body.includes("tidak")) {
                        msg1.reply('Silahkan laporkan lagi sesuai data');
                    } else {
                        msg1.reply('Format laporan salah, silahkan ulangi pelaporan dari awal');
                    }
        } else {
            if (msg.body.includes("-")) {

                var idsls = msg.body.split("-")[0].replaceAll(' ','');

                // jika ada di database
                if (idslss.includes(idsls)){

                    let index = idslss.indexOf(idsls);

                    text = "Apakah informasi yang anda masukkan berikut sudah benar? \n \nKecamatan: *" + kec[index] + "*\nDesa           : *" + des[index] + "*\nSLS             : *" + sls[index]
                    + "*\nID SLS         : *" + idsls + "*\n \n ";
                    msg.reply(text);

                    state[msg.from] = "konfirmasi"

                } else {
                    // tidak ada di database
                    msg.replay('id sls tidak ada di database. Mohon untuk cek kembali id sls');
                }    
                console.log(idsls);
            } else {
                msg.reply('Laporan salah, mohon untuk disesuaikan dengan format laporan');
            }
        }
        
        
    });
    //console.log(kec)
}

client.initialize();
