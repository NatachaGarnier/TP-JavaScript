'use strict';

/**
 * Web Scraper
 * Author: Natacha Garnier
 */
 
 /**
 *
 * Pour executer ce programme et voir les différents résultat il faut tout d'aborde le lancer dans node,
 * puis ensuite les resultays s'afficherons dans  le terminal, mais aussi dans un ficher "fichier.txt",
 * et enfin, pour voir le dernier resultat, ouvrez votre navigateur et allez a "localhost:8080" 
 *
 */
 
 
var lesite		= 'http://expressjs.com/';
var express		= require('express');
var app 		= express();
var EXTRACT_URL_REG = /\b((?:https?:\/\/|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/gi;
var PORT            = 3000;
var request         = require('request');
var express         = require('express');
var app             = express();
var EventEmitter    = require('events').EventEmitter;
var em              = new EventEmitter();
var fs        		= new require('fs');

app.get('/home', function(req, res){
  res.send(require('fs').readFileSync('scraper.html').toString());
});

 var queue        = [];
 var fichier      = [];
 

 function get_page(page_url){
  em.emit('page:scraping', page_url);


  request({
    url:page_url,
  }, function(error, http_client_response, html_str){
 
   // console.log("Taille de la page:"+ html_str.height());
	function getDocHeight() {
    var D = html_str;
    return Math.max(
        D.body.scrollHeight, D.documentElement.scrollHeight,
        D.body.clientHeight, D.documentElement.clientHeight
    );
	 console.log("Taille de la page:"+ getDocHeight());
	
}
	
    // console.log("Language/serveur derrière la page web:");
     
     
     if(html_str.indexOf("Content-Encoding: gzip")==-1){
         console.log("La compression n'est pas active");
     }
     else{
         console.log("La compression est active");
     }
   
     
     
     
     if(error){
      em.emit('page:error', page_url, error);
      return;
    }

    em.emit('page', page_url, html_str);

    queue.forEach(function(val) {
      request(val, function (error, response, body) {
        extract_links(val, body); 
        queue.shift();
      });
    });
    em.emit('Liens');
  });
}

   function extract_links(page_url, html_str){

  if (html_str != undefined && html_str != null) {
    (html_str.match(EXTRACT_URL_REG) || []).forEach(function(url){

    if (fichier.indexOf(url) == -1) {        
      em.emit('url', page_url, html_str, url);
      fichier.push(url);
    }
  });
  }

}

function putLinksInFile() {
  fichier.forEach(function(val) {
    fs.appendFile('fichier.txt', fichier.join("\r\n"));
  });  

}



function handle_new_url(from_page_url, from_page_str, url){
  queue.push(url);
}


em.on('page:scraping', function(page_url){
  console.log('Loading... ', page_url);
});

em.on('page', function(page_url, html_str){
  console.log('We got a new page!', page_url);
});

em.on('page', extract_links);

em.on('page:error', function(page_url, error){
  console.error('Oops an error occured on', page_url, ' : ', error);
});
var tmp ="";
em.on('url', function(page_url, html_str, url){
  console.log('We got a link! ', url);
	tmp += url+"<br />";
});
var http = require('http');
var server = http.createServer(function(req, res) {
    var pagehtml='<head><title>Le Panda chercheur</title><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head>';
	pagehtml+='<body ><h1>Scrappers</h1>';
	pagehtml+='<table BORDER="1"><b>Les liens du site web \"'+lesite+'\"sont:</b> <br /><br /><th>'+tmp+'</th></table><br /><footer>Natacha Garnier- Licence Pro SIL Alternance</footer></body>';
	pagehtml+='<style type="text/css">html {width: 100%; text-align:center; font-family: "calibri";background: #272822;color: #FFFFFF; background-image: url(panda.jpg);} table{margin-left: 380px;}</style> ';
	res.end(pagehtml);
});
server.listen(8080);




em.on('url', handle_new_url);
em.on('Liens', putLinksInFile);

app.get('/', function(req, res){

  res.json(200, {
    title:'YOHMC - Your Own Home Made Crawler',
    endpoints:[{
      url:'http://127.0.0.1:'+PORT+'/queue/size',
      details:'the current crawler queue size'
    }, {
      url:'http://127.0.0.1:'+PORT+'/queue/add?url=http%3A//voila.fr',
      details:'immediately start a `get_page` on voila.fr.'
    }, {
      url:'http://127.0.0.1:'+PORT+'/queue/list',
      details:'the current crawler queue list.'
    }]
  });
});

app.get('/queue/size', function(req, res){
  res.setHeader('Content-Type', 'text/plain');
  res.json(200, {queue:{length:queue.length}});
});

app.get('/queue/add', function(req, res){
  var url = req.param('url');
  get_page(url);
  res.json(200, {
    queue:{
      added:url,
      length:queue.length,
    }
  });
});

app.get('/queue/list', function(req, res){
  res.json(200, {
    queue:{
      length:queue.length,
      urls:queue
    }
  });
});

app.listen(PORT);
console.log('Web UI Listening on port '+PORT);

get_page(lesite);



