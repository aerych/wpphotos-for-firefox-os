/*

*/

"use strict";

if(typeof(wp) == "undefined") { var wp = {} };

wp.app = _.extend({
  version:"1.1",
	currentBlog:null, // model
	posts:null,
	blogs:null,
	
	init:function() {

    wp.nav.init();
		
		// Queue up some our async tasks and load blogs when they are done.
		var q = wp.promiseQueue();
		q.success(function() {
			wp.app.loadBlogs();	
		});

		// Load Templates
		var p = wp.views.loadTemplates();
		p.success(function(){
      // noop
		});
		p.fail(function() {
			// couldn't load templates
			alert("Failed to load view templates.");
		});
		q.add(p);
		
		
		// Open database 
		p = wp.db.open();
		p.success(function() {
			// noop
		});
		p.fail(function() {
			alert("Failed to open database.");
		});
		q.add(p);
	},
	
	
	loadBlogs:function() {
		// load blogs & current blog
		if(!this.blogs) {
			this.blogs = new wp.models.Blogs(); // collection
			this.posts = new wp.models.Posts();
			this.listenTo(this.blogs, "remove", this.findCurrentBlog);
		};
		
		var self = this;
		var p = this.blogs.fetch();
		p.always(function() {
			// loaded blogs
			self.blogsLoaded();
		});
	},
	
	blogsLoaded:function() {
		console.log("blogs loaded");

		if (this.blogs.length == 0) {
			// no blogs, show start/signup
			wp.nav.setPage("start", "none");
			return;
		};

		this.findCurrentBlog();

    wp.nav.setPage("posts", "none");
	},
	
	findCurrentBlog:function() {
		// check local storage for the key of the current blog. 	
		var blogKey = localStorage.blogKey;
		var blog;
		if (blogKey) {
			// if it exists find the current blog in the list of blogs	
			blog = this.blogs.get(blogKey);
		};
		
		// if it doesn't exist, or the blog can't be found show the first blog in the blogs list and make it current		
		if (!blog && this.blogs.length > 0) {
			blog = this.blogs.at(0);
		};
		
		if (blog) {
			this.setCurrentBlog(blog);
		} else {
			try {
				// No blogs found. Perform a clean up.
				wp.app.posts.set([]); // Clear the posts list.
				localStorage.blogKey = null; // paranoia
				delete localStorage.blogKey;
			} catch(e){ console.log(e);};
		};
	},
	
	setCurrentBlog:function(blog) {
		if(this.currentBlog && (this.currentBlog.id == blog.id)){
			// same blog.  nothing to see here. move along.
			return;
		};

		wp.api.setCurrentBlog(blog.attributes);
		localStorage.blogKey = blog.id;
		this.currentBlog = blog;
		// Clear the posts list since we changed blogs. Suppress change events since we're dispatching our own. 
		this.posts.set([], {silent:true});
		
		this.trigger("currentBlogChanged");
	},
	
	isNetworkAvailable:function(){
		try {
			return (window.navigator.mozConnection.bandwidth > 0);
		} catch(ignore) {};
		return false;
	},
	
	showLoadingIndicator:function(msg) {
		msg = msg || _s('control-loading');
	
		// There can be only one! 
		var loadingAlert = document.getElementById('loading-modal');
		if(loadingAlert){
			if(msg){
				loadingAlert.querySelector("#loading-text").innerHTML = msg;
			}
			return;
		};
		loadingAlert = document.createElement('x-modal'); 
		loadingAlert.setAttribute("id", 'loading-modal');
		loadingAlert.setAttribute('overlay', '');
		loadingAlert.innerHTML = '<div class="modal-background"></div>';
		loadingAlert.innerHTML += '<div class="modal-content spinner-modal"><span id="loading-text">' + msg + '</span><div class="loading-spinner"></div></div>';
		document.body.appendChild(loadingAlert);
	},
	
	hideLoadingIndicator:function() {
		var loadingAlert = document.getElementById('loading-modal');
		if (loadingAlert != undefined)
			document.body.removeChild(loadingAlert);
	}

}, Backbone.Events);


window.addEventListener("load", function() {
	// Add a bit of a delay to avoid a race condition loading localizations
	setTimeout(function(){
		wp.app.init();	
	}, 1);
} , false);
