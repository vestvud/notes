var BaseController = require("./Base"),
	View = require("../views/Base"),
	model = new (require("../models/ContentModel")),
	truncate = require('../lib/truncate');

module.exports = BaseController.extend({ 
	name: "Blog",
	content: null,
	openedType: "task",
	run: function(req, res, next, helper) {
		model.setDB(req.db);
		var self = this;

		if ( helper === "type" && req.params.id !== this.openedType ) {
			this.openedType = req.params.id;
		}

		var obj = {};
		obj[""+helper+""] = req.params.id;

		this.getContent(function() {
			var v = new View(res, 'page');
			v.render(self.content);
		}, obj );
	},
	runArticle: function(req, res, next) {
		model.setDB(req.db);
		var self = this;

		this.content = {};
		this.getArticle(function() {
			var v = new View(res, 'page');
			v.render(self.content);
		}, req.params.id);
	},
	getMenu : function(err, records, callback, typeID) {
		var self = this;
		model.getlist(function(err, records) {
			records.sort(function(a,b){
				return b.date - a.date;
			});
			var MenuArticles = '';
			if(records.length > 0) {
				for(var i=0; record=records[i]; i++) {
					var record = records[i];
					MenuArticles += '\
						<li class="b-article-menu__item">\
                            <a class="j-article b-article-menu__item__link" data-article-id="'+record.ID+'" href="article-'+ record.ID +'"><i class="fa fa-angle-right mr-5"></i>' + record.title + '</a>\
					';
				}
			}
			self.content.MenuArticles = MenuArticles;
			if (self.openedType === "blog") {
				self.content.MenuTitle = "Заметки";
			} else {
				self.content.MenuTitle = "Задачки";
			}
			self.getTags(err, records, callback);			
		}, {type: self.openedType });
	},
	getTags : function(err, records, callback, typeID) {
		var self = this;
		model.getlist(function(err, records) {
			var arrTmp=[], tagsList = '';
			if (records.length > 0) {

				for (var k=0; k<records.length; k++){
					for (var j=0; j< records[k].tags.length; j++) {
						arrTmp.push(records[k].tags[j]);
					}
				}
			
				function unique(arr) {
					var obj = {};
					for(var i=0; i<arr.length; i++) {
						var str = arr[i];
						obj[str] = true; 
					}
					return Object.keys(obj); 
				}

				var resTags = unique(arrTmp);
				for (var j = 0; j < resTags.length; j++) {								
					tagsList += '\
					<li class="b-tags__item">\
                        <a class="b-tags__item__link" href="tag-'+ resTags[j] +'">' + resTags[j] + '</a>\
					';			
				}			
			}
			self.content.tagsList = tagsList;
			callback();
		}, {type:  self.openedType });
	},
	getContent: function(callback, sql) {

		var self = this, contTxt;
		this.content = {};
		model.getlist(function(err, records) {
			var cont = '';	
			records.sort(function(a,b){
				return b.date - a.date;
			});

			for (var i=0; i<records.length; i++) {
					(records[i].type === "task") ? contTxt = 'Посмотреть решение' : contTxt = 'Почитать';

					records[i].date = new Date( parseInt(records[i].date) );

					records[i].date ? datestr = ''+ records[i].date.getDate() + "." + (records[i].date.getMonth() +1) + "." + records[i].date.getFullYear() : datestr = ''  ;
					var record = records[i], 
						tags = '';
					for (var k=0; k<record.tags.length; k++) {
						tags += '<a class="tag" href="/tag-'+ record.tags[k] +'">' + record.tags[k] + '</a>';
					}				
					cont += '\
						<div class="item"">\
							<div class="date">'+ datestr +'</div><div class="tags m-nomarb">'+ tags +'</div>\
	                        <div class="zag mb">' + record.title + '</div><a class="j-toggle-task toggle-task" href="#"><span class="continue_wrap">'+  contTxt + '</span><i class="j-icon_toggle fa fa-angle-down"></i></a>\
	                        <div class="j-item-text item-text dNone">' + record.text + '</div><div class="b-continue"></div></p>\
						</div>\
					';				
			}
			self.content.cont = cont;
			self.getMenu(err, records, callback);
		}, sql);
	},
	getArticle: function(callback, ID) {
		var self = this;
		this.content = {}
		model.getlist(function(err, records) {
			var cont= '';
			if (records.length > 0) {
				var tags = '';	
				records[0].date = new Date( parseInt( records[0].date) );

				records[0].date ? datestr = ''+ records[0].date.getDate() + "." + (records[0].date.getMonth() +1) + "." + records[0].date.getFullYear() : datestr = '';
				for (var k=0; k<records[0].tags.length; k++) {
					tags += '<a class="tag" href="tag-'+ records[0].tags[k] +'">' + records[0].tags[k] + '</a>';
				}		

				cont += '\
						<div class="post">\
                            <div class="zag" href="">' + records[0].title + '</div>\
                            <div class="date">'+ datestr +'</div>\
                            <div class="tags">'+ tags +'</div>\
                            <p class="text">' + records[0].text + '</p>\
						</div>\
					';
			};
			self.content.cont = cont;
			self.getMenu(err, records, callback);
		}, { ID: ID });
	}
});