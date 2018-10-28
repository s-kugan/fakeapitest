/**
 * Created by ssiva on 2018-10-17.
 */

/** Load the necessary modules*/
const request = require("supertest");
const expect = require("chai").expect;
const flush = require('flush-cache');

/** Set up the environment variable to pass the variable in command line */
process.env.ALLOW_CONFIG_MUTATIONS = "true";

/**Change the input data dynamically from json if needed*/
const importFresh = require('import-fresh');
var config  = importFresh('config');

describe('Test Fake API', function() {

    /** Set up Input Data*/
    var url = config.get("env.host");
    var postdata = config.get("env.post.FirstPost");
    var putdata = config.get("env.post.PutPost");
    var patchdata = config.get("env.post.PatchPost");
    var post1data = config.get("env.post.TestPost1");


     /** To Run the command In Windows : set NODE_ENV=typicode&&npm test
     * To Run the command In Linux or Mac : $ NODE_ENV=typicode mocha test/**\/*test.js
     * npm run env NODE_ENV=production
     ***/

    /** Store method names in a common place. so that its easy to change if its get changed in future */
    /** I have repeated the same url with appropriate method types for readability*/
    var methods = {
        "Getposts":"/posts",
        "Getcomments":"/posts/1/comments",
        "PostPost":"/posts",
        "PutPost":"/posts/1",
        "PatchPost":"/posts/1",
        "DeletePost":"/posts/1",
        "GetPost":"/posts/1",

    };

    before(function () {
        /** flush the cache to run the test repeately*/
        flush();

    });

    it('1-Get all the posts', function(done) {
        request(url).get(methods.Getposts)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err,res) {
                if (err) return done(err);
                let body = res.body;
                /** validate that api returns the status code 200 and body returns an array*/
                expect(res).to.have.property('status').equals(200);
                expect(body).to.be.an('array').that.is.not.empty;
                done();
            });
    });

    it('2-Get the comments for post 1', function(done) {
        request(url).get(methods.Getcomments)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err,res) {
                if (err) return done(err);
                let body = res.body;
                expect(res).to.have.property('status').equals(200);
                expect(body).to.be.an('array').that.is.not.empty;
                /** validate that comments are less than 10000 records*/
                expect(body).to.have.lengthOf.below(10000);
                done();
            });
    });

    it('3-Post with Post method', function(done) {
        request(url).post(methods.PostPost)
            .set('Content-Type','application/json')
            .send(postdata)
            .expect('Content-Type',/json/)
            .expect(201)
            .end(function(err,res) {
                if (err) return done(err);
                let body = res.body;
                /** validate that it created data by returning the status code 201*/
                expect(res).to.have.property('status').equals(201);
                expect(body).to.deep.include(postdata);
                done();
            });
    });

    it('4-Update the post with Put Method', function(done) {
        request(url).put(methods.PutPost)
            .set('Content-Type','application/json')
            .send(putdata)
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res) {
                let body = res.body;
                if (err) return done(err);
                /** validate that it updated data by returning the status code 200*/
                expect(res).to.have.property('status').equals(200);
                expect(body).to.deep.include(putdata);
                done();
            })
    });

    it('5-Partially update the post with PATCH Method', function(done) {
        request(url).patch(methods.PatchPost)
            .set('Content-Type','application/json')
            .send(patchdata)
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res) {
               let body = res.body;
                if (err) return done(err);
                /** validate that it updated data by returning the status code 200*/
                expect(res).to.have.property('status').equals(200);
                expect(body).to.deep.include(patchdata);
                done();
            })
    });

    it('6-Delete the post with Delete Method', function(done) {
        request(url).delete(methods.DeletePost)
            .set('Content-Type','application/json')
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res) {
                console.log(res.body);
                if (err) return done(err);
                /** validate that it successfully deleted the data by returning the status code 200*/
                expect(res).to.have.property('status').equals(200);
                done();
            })
    });

    it('7-confirm the deleted posts1 does not exist with the same data', function(done) {
        request(url).get(methods.GetPost)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err,res) {
                if (err) return done(err);
                let body = res.body;
                console.log("*****");
                console.log(body);
                /** validate that api returns the status code 200 and objects are not same*/
                expect(res).to.have.property('status').equals(200);
                expect(body).to.not.include(post1data);
                done();
            });
    });

});