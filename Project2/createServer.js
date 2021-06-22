
const http = require('http');
const url = require('url');
const fs = require('fs');
const qs = require('querystring');

const port = 9021;
http.createServer(function (req, res) {
  var q = url.parse(req.url, true);
  var filename = "." + q.pathname;
  if(req.url === '/'){
    indexPage(req,res);
  }
  else if(req.url === '/index.html'){
    indexPage(req,res);
  }
  else if(req.url === '/contacts.html'){
    contactPage(req,res);
  }
  else if(req.url === '/addContact.html'){
    addContactPage(req,res);
  }
  else if(req.url === '/stock.html'){
    stockPage(req,res);
  }
  else if(req.url == '/getContact'){
    getContact(req,res);	
  }
  else if(req.url == '/postContactEntry'){
    var temp = '';
    
    req.on('data', function(data) {
    	temp += data;
    });
    
    req.on('end', function(){
    	addContactEntry(req, res, temp);
    });
  }
  else{
    res.writeHead(404, {'Content-Type': 'text/html'});
    return res.end("404 Not Found");
  }
}).listen(port);


function indexPage(req, res) {
  fs.readFile('client/index.html', function(err, html) {
    if(err) {
      throw err;
    }
    res.statusCode = 200;
    res.setHeader('Content-type', 'text/html');
    res.write(html);
    res.end();
  });
}

function contactPage(req, res) {
  fs.readFile('client/contacts.html', function(err, html) {
    if(err) {
      throw err;
    }
    res.statusCode = 200;
    res.setHeader('Content-type', 'text/html');
    res.write(html);
    res.end();
  });
}

function stockPage(req, res) {
  fs.readFile('client/stock.html', function(err, html) {
    if(err) {
      throw err;
    }
    res.statusCode = 200;
    res.setHeader('Content-type', 'text/html');
    res.write(html);
    res.end();
  });
}

function addContactPage(req, res) {
  fs.readFile('client/addContact.html', function(err, html) {
    if(err) {
      throw err;
    }
    res.statusCode = 200;
    res.setHeader('Content-type', 'text/html');
    res.write(html);
    res.end();
  });
}

function getContact(req, res) {
  fs.readFile('contacts.json', function(err, content) {
    if(err) {
      throw err;
    }
    res.statusCode = 200;
    res.setHeader('Content-type', 'application/json')
    res.write(content);
    res.end();
    });
}

function addContactEntry(req, res, temp) { 
    var postData = qs.parse(temp); 
    var jObj = {};
    jObj['name'] = postData.name;
    jObj['category'] = postData.category;
    jObj['location'] = postData.location;
    jObj['contact'] = postData.contact;
    jObj['email'] = postData.email;
    jObj['website_name'] = postData.website_name;
    jObj['website_url'] = postData.website_url;
    
    fs.readFile('contacts.json', function(err, content) {
    	if(err) {
      	   throw err;
    	}
    	var contactObj = JSON.parse(content);
    	contactObj['contacts'].push(jObj);
    	result = JSON.stringify(contactObj);
    	
    	fs.writeFile('contacts.json', result, function(err, result){
    	   if(err) {
      	      throw err;
    	   }

    	});
    	res.writeHead(302, {'Location': 'contacts.html'});
    	res.end();
    });
}

