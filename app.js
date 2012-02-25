var express = require('express');
var fs = require('fs');

var app = express.createServer();

app.configure(function() {
  app.use(express.logger());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/static'));
});

app.configure('development', function () {
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
});

app.configure('production', function () {
  app.use(express.errorHandler());
});

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.get('/', function(req, res) {
  res.render('root');
});

var products = require('./products');
var files   = require('./files');

app.get('/products', function(req, res) {
  res.render('products/index', {locals: {
    products: products.all
  }});
});

app.get('/products/new', function(req, res) {
  var product = req.body && req.body.product || products.new();
  files.list(function(err, file_list) {
    if (err) {
      throw err;
    }
    res.render('products/new', {locals: {
      product: product,
      files: file_list
    }});

  });
});

app.post('/products', function(req, res) {
  var id = products.insert(req.body.product);
  res.redirect('/products/' + id);
});

app.get('/products/:id', function(req, res) {
  var product = products.find(req.params.id);
  res.render('products/show', {locals: {
    product: product
  }});
});

app.get('/products/:id/edit', function(req, res) {
  var product = products.find(req.params.id);
  files.list(function(err, file_list) {
    if (err) {
      throw err;
    }
    res.render('products/edit', {locals: {
      product: product,
      files: file_list
    }});
    
  });
});

app.put('/products/:id', function(req, res) {
  var id = req.params.id;
  products.set(id, req.body.product);
  res.redirect('/products/'+id);
});

/* files */

app.get('/files', function(req, res) {
  files.list(function(err, file_list) {
    res.render('files/index', {locals: {
      files: file_list
    }})
  });
});

app.get('/files/new', function(req, res) {
  res.render('files/new');
});

app.post('/files', function(req, res) {
	console.log(req.files.file);
	var newFile =__dirname+'/static/uploads/files/'+ req.files.file.name;
  	fs.rename(req.files.file.path , newFile, function (data,error) {
		console.log(data); 
		if(error) {
			throw error;
		}
	});
    res.redirect('/files');
  
});

app.listen(4000);