/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;



module.exports = function (app) {

  const CONNECTION_STRING = process.env.DB;
  const client = new MongoClient(CONNECTION_STRING, {useNewUrlParser: true});
  const dbName = 'library'

  app.route('/api/books')
    .get(function (req, res){
      client.connect(function(err) {
        if (err) throw err;
        const db = client.db(dbName);
        const books = db.collection('books');
        books.find({}).toArray(function(err, docs) {
          if (err) throw err;
          res.json(docs);
        })
      })


      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })
    
    .post(function (req, res){
      var title = req.body.title;
      if (!title) {
        res.send('no title given')
        return
      }

      client.connect(function(err) {
        if(err) {
          console.log('Database error: ' + err);
        } else {
          console.log('Successful database connection');
          const db = client.db(dbName);
          const books = db.collection('books')

          books.insertOne({title: title, commentcount: 0, comments: []}, function(err, result) {
            if (err) throw err;
            res.json({title: title, _id: result.insertedId.valueOf()})
          })

        }

        
      })
      //response will contain new book object including atleast _id and title
    })
    
    .delete(function(req, res){

      client.connect(function(err) {
        if(err) {
          console.log('Database error: ' + err);
        } else {
          console.log('Successful database connection');
          const db = client.db(dbName);
          const books = db.collection('books')
          books.deleteMany({}, function(err) {
            if (err) throw err;
            res.send('complete delete successful')
          })
        }
      })

      //if successful response will be 'complete delete successful'
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;

      client.connect(function(err) {
        if (err) throw err;
        const db = client.db(dbName);
        const books = db.collection('books');
        books.findOne({_id: ObjectId(bookid)}, function(err, book) {

          if (err) throw err;
          if (book === null) {
            res.send('no book found with that id')
            return
          }
          res.json(book);
        })
      })
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;

      client.connect(function(err) {
        if (err) throw err;
        const db = client.db(dbName);
        const books = db.collection('books');
        books.findOneAndUpdate({_id: ObjectId(bookid)}, {$push: {comments: comment}, $inc: {commentcount: 1}}, function(err, book) {
          if (err) throw err;
          book.value.comments.push(comment);
          book.value.commentcount++;
          res.json(book.value);
        })
      })
      //json res format same as .get
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;

      client.connect(function(err) {
        if(err) {
          console.log('Database error: ' + err);
        } else {
          console.log('Successful database connection');
          const db = client.db(dbName);
          const books = db.collection('books')

          if (bookid.length !== 24) {
            res.send('no book exists')
            return
          }
          books.deleteOne({_id: ObjectId(bookid)}, function(err, result) {
            if (err) throw err;
            
            if (result.deletedCount === 1) {
              res.send('delete successful')
            } else {
              res.send('no book exists')
            }
            
          })
        }
      })
      //if successful response will be 'delete successful'
    });
  
};
