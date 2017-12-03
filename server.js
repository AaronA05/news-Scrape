// MONGO URI - mongodb://heroku_6h7nd3j1:hrofqv1ui46a68cqcoa2i1r89h@ds125556.mlab.com:25556/heroku_6h7nd3j1

// ## Instructions

// * Create an app that accomplishes the following:
//   1. Whenever a user visits your site, the app should scrape stories from a news outlet of your choice and display them for the user. 
//		Each scraped article should be saved to your application database. At a minimum, the app should scrape and display the following information for each article:
//      * Headline - the title of the article
//      * Summary - a short summary of the article
//      * URL - the url to the original article
//      * Feel free to add more content to your database (photos, bylines, and so on).
//   2. Users should also be able to leave comments on the articles displayed and revisit them later. 
// 		The comments should be saved to the database as well and associated with their articles. Users should also be able to delete comments left on articles. 
// 		All stored comments should be visible to every user.
// * Beyond these requirements, be creative and have fun with this!
// ### Tips
// * Go back to Saturday's activities if you need a refresher on how to partner one model with another.
// * Whenever you scrape a site for stories, make sure an article isn't already represented in your database before saving it; we don't want duplicates. 
// * Don't just clear out your database and populate it with scraped articles whenever a user accesses your site. 
//   * If your app deletes stories every time someone visits, your users won't be able to see any comments except the ones that they post.

var express = require("express");
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");
var path = require("path");
var logger = require("morgan");
var mongoose = require("mongoose");
var request = require("request");
var cheerio = require("cheerio");

var db = require("./models");

var app = express();
var port = process.env.PORT || 3500;

app.use(logger("dev"));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.engine("handlebars", exphbs({defaultLayout: 'main'}));
app.set("view engine", "handlebars");

app.use(express.static("public"));

mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/newsScrape", {
	useMongoClient: true
});

app.post("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  request("http://www.npr.org/", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);

      // Save an empty result object
    var result = {};

    // Now, we grab every h2 within an article tag, and do the following:
    $(".story-text").each(function(i, element) {


      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("a")
        .first()
        .text();

      result.link = $(this)
      	.children("a")
      	.first()
      	.attr("href");

      result.tease = $(this)
      	.children()
      	.last()
      	.text();

      // Create a new Article using the `result` object built from scraping
      db.Article
        .create(result)
        .then(function(dbArticle) {
          // If we were able to successfully scrape and save an Article, send a message to the client
          res.send("Scrape Complete");
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          res.json(err);
        });
      // console.log(result);
    });
    
  });
});

app.get("/article/:id", function(req, res){
	db.Article.findOneAndUpdate({"_id": req.params.id}, { $set: {saved: true}}, function(err, data){
		console.log(data);
	});
});

app.get('/saved', function(req, res){
  db.Article.find({saved: true})
            .then(function(data){
              res.render('saved', {data})
            })
            .catch(function(err){
              res.json(err);
            });
});

//WORKING HERE PICK UP HERE===============================
app.get('/remove/:id', function(req,res){
    db.Article.findOneAndUpdate({"_id": req.params.id}, {$set: {saved: false}}, function(err, data){
      res.render('saved', {data});
    });
});

app.post('/notes/:id', function(req, res){
  db.Note
    .create(req.body)
    .then(function(dbNote){
      return db.Article.findOneAndUpdate({ _id: req.params.id }, {note: dbNote._id}, {new:true});
    })
    .catch(function(err){
      res.json(err);
    })
});

app.get('/allNotes/:id', function(req, res){
  db.Article.findOne({'_id': req.params.id}, function(err, data){
    res.json(data);
  });
});

app.get('/viewNotes/:id', function(req,res){
  db.Note.findOne({'_id': req.params.id}, function(err, data){
    res.json(data);
  })
})

app.get('/', function (req, res) {
    
    db.Article.find({})
    	.then(function(data){
    		res.render('index', {data});
    	})
    	.catch(function(err){
    		res.json(err);
    	});
});

app.listen(port);

























