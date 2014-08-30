var BaseController = require("./Base"),
	View = require("../views/Base"),
	model = new (require("../models/ContentModel")),
	config = require("../config/config.js")(),
	sha1 = require("sha1"),
	fs = require("fs");

module.exports = BaseController.extend({ 
	name: "Admin",
	username: config.admin.username,
	password: config.admin.password,

	run: function(req, res, next) {	
		var self = this;
		if(this.authorize(req)) {
			model.setDB(req.db);
			req.session.blog = true;
			req.session.save();
			var v = new View(res, 'admin');
			self.del(req, res, function() {
				self.form(req, res, function(formMarkup) {
					self.list(function(listMarkup) {
						v.render({
							title: 'Administration',
							content: 'Welcome to the control panel',
							list: listMarkup,
							form: formMarkup
						});
					});
				});
			});
		} else {
			var v = new View(res, 'admin-login');
			v.render({
				title: 'Please login'
			});
		}		
	},
	authorize: function(req) {
		return (
			req.session && 
			req.session.blog && 
			req.session.blog === true
		) || (
			req.body && 
			req.body.username === this.username && 
			sha1(req.body.password) === this.password
		);
	},
	list: function(callback) {	

		model.getlist(function(err, records) {
			var datestr = '';
			

			var markup = '<table id="list-posts">';
			markup += '\
				<tr>\
					<td><strong>type</strong></td>\
					<td><strong>title</strong></td>\
					<td><strong>tags</strong></td>\
					<td><strong>date</strong></td>\
				</tr>\
			';
			for(var i=0; record = records[i]; i++) {
				console.log(records[i].date);

				records[i].date = new Date( parseInt(records[i].date) );
				
				record.date ? datestr = ''+ record.date.getDate() + "." + (record.date.getMonth() +1) + "." + record.date.getFullYear() : datestr = '';


				markup += '\
				<tr>\
					<td>' + record.type + '</td>\
					<td>' + record.title + '</td>\
					<td>' + record.tags + '</td>\
					<td>' + datestr + '</td>\
					<td>\
						<a class="delete" href="#" data-id="' + record.ID + '">delete</a>&nbsp;&nbsp;\
						<a href="/admin?action=edit&id=' + record.ID + '">edit</a>\
					</td>\
				</tr>\
			';


			}
			markup += '</table>';
			callback(markup);
		})
	},
	form: function(req, res, callback) {
		var returnTheForm = function() {
			if(req.query && req.query.action === "edit" && req.query.id) {
				model.getlist(function(err, records) {
					if(records.length > 0) {
						var record = records[0];
						console.log("rec.date"+record.date);
						res.render('admin-record', {
							ID: record.ID,
							text: record.text,
							title: record.title,
							tags: record.tags,
							type: record.type,
							date: record.date
						}, function(err, html) {
							callback(html);
						});
					} else {
						res.render('admin-record', {}, function(err, html) {
							callback(html);
						});
					}
				}, {ID: req.query.id});
			} else {
				res.render('admin-record', {}, function(err, html) {
					callback(html);
				});
			}
		}
		if (req.body && req.body.formsubmitted && req.body.formsubmitted === 'yes') {			
			var arrTags = req.body.tags.split(",");
			for (var i=0; i<arrTags.length; i++) {
				arrTags[i] = arrTags[i].replace(/^\s+|\s+$/g, "");
			}
			console.log( "date " + req.body.date );			

			var data = {
				title: req.body.title,
				tags: arrTags,
				text: req.body.text,
				type: req.body.type,
				ID: req.body.ID,
				date: req.body.date === '' ? Date.now() : req.body.date
 			}
			model[req.body.ID !== '' ? 'update' : 'insert'](data, function(err, objects) {
				returnTheForm();
			});
		} else {
			returnTheForm();
		}
	},
	del: function(req, res, callback) {

		if (req.body.id) {
			model.remove(req.body.id, function(error, doc){
				var result = {};
				if (error !== null || doc === null ) result.error = error;
				res.json(result);
			});
		} else {			
			callback();
		}
	}
});