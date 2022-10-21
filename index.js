const venom = require('venom-bot');

const { google } = require('googleapis');
const keys = require("C:/Users/Zenda Oka B/bot-regsosek/regsosekbali-21e7a475c092.json");

const state = {}
const data = {}

var kec = [];
var des = [];
var sls = [];
var idslss = [];



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
      console.log('Connected1!');
      gsrun(client1);
  }
});

venom
  .create({
    session: 'session-name', //name of session
    multidevice: true // for version not multidevice use false.(default: true)
  })
  .then(async(client) => {
    await gsrun(client1);
    start(client)
  })
  .catch((erro) => {
    console.log(erro);
  });

async function gsrun(cl){

  const gsapi = google.sheets({version:'v4', auth: cl });

  const opt = {
      spreadsheetId : "1SWx4BhfDhg8804Fd3J1TaAzKQA-EaYfWNbphux4rEGQ",
      range: 'db'
  }
  

  let data = await gsapi.spreadsheets.values.get(opt);
  
  for (var i = 1; i < data.data.values.length; i++) {
      kec.push(data.data.values[i][7]);
      des.push(data.data.values[i][9]);
      idslss.push(data.data.values[i][12]);
      sls.push(data.data.values[i][13]);
  }

  console.log("kec, des, idsls terbaca");
}

function start(client) {
  client.onMessage((msg) => {
    if (msg.body === 'Hi' && msg.isGroupMsg === false) {
      client
        .sendText(msg.from, 'Welcome Venom 🕷')
        .then((result) => {
          console.log('Result: ', result); //return object success
        })
        .catch((erro) => {
          console.error('Error when sending: ', erro); //return object error
        });
    }

    if (state[msg.from] == "konfirmasi") {
      if (msg.body.toLowerCase().includes("ya")) {
          client.sendText(msg.from, 'Terima kasih atas laporannya');
          
          let ts = Math.floor(Date.now()/1000);

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
                  console.log('Connected!2');
                  gsrun(client1);
              }
          });

          async function gsrun(cl){

              const gsapi = google.sheets({version:'v4', auth: cl});

              var updateOptions = {
                  spreadsheetId : "1SWx4BhfDhg8804Fd3J1TaAzKQA-EaYfWNbphux4rEGQ",
                  range: 'cth_bot',
                  valueInputOption: 'USER_ENTERED',
                  insertDataOption: 'INSERT_ROWS',
                  resource: {
                      majorDimension: "ROWS",
                      values: [[data[msg.from].id_sls, ts, data[msg.from].jumlah_kk_verif, data[msg.from].jumlah_kk_cacah, data[msg.from].jumlah_ART, data[msg.from].jumlah_ASN]]
                  },                  
              }
          
              try {
                  const response = (await gsapi.spreadsheets.values.append(updateOptions)).data;
                  //console.log(JSON.stringify(response, null, 2));
              } catch (err) {
                  console.error(err);
              }    
          
          };
      } else if (msg.body.toLowerCase().includes("tidak")) {
          client.sendText(msg.from, 'Silahkan laporkan lagi sesuai data');
      } else {
          client.sendText(msg.from, 'Format laporan salah, silahkan ulangi pelaporan dari awal');
      }
      state[msg.from] = null;
    } else {
      if (msg.body.includes("-")) {

        var idsls = msg.body.split("-")[0].replaceAll(' ','');
        var laporan = msg.body.split("-")[1].replaceAll(' ','').toLowerCase();

        var jumlahRuta = laporan.split(",").length;
        var arr = laporan.split(",");  

        // jika ada di database
        if (idslss.includes(idsls)){

            let index = idslss.indexOf(idsls);

            text = "Apakah informasi yang anda masukkan berikut sudah benar? (Ya/Tidak)\n \nKecamatan: *" + kec[index] + "*\nDesa           : *" + des[index] + "*\nSLS             : *" + sls[index]
            + "*\nID SLS         : *" + idsls + "*\n \nJumlah KK hasil verifikasi : *" + arr[0] + "*\nJumlah KK tercacah           : *" + arr[1] + "*\nJumlah Anggota Keluarga          : *"
            + arr[2] + "*\nJumlah Keluarga ASN        : *" + arr[3] + "*";
            client.sendText(msg.from, text);

            state[msg.from] = "konfirmasi";
            data[msg.from] = {id_sls: idsls, jumlah_kk_verif: arr[0], jumlah_kk_cacah: arr[1], jumlah_ART: arr[2], jumlah_ASN: arr[3]};

        } else {
            // tidak ada di database
            client.sendText(msg.from, 'id sls tidak ada di database. Mohon untuk cek kembali id sls');
        }    
        console.log(idsls);
      } else {
        client.sendText(msg.from, 'Laporan salah, mohon untuk disesuaikan dengan format laporan');
      }
    } 
  }); 
}
