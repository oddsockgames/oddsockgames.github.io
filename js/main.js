var Main = {};

(function () {
    'strict mode';

    Main = {
        //menuopened : false
		currentpage : 0,
		currentheight : 0, 
		currentcontent : 0,
		currentnews : 0,
		maxpages : 10, 
		totalpages : 7, //max 10
		totalcontents : [2,3,4,1,1,1,1],
		busy : false,

		news : [
			'Our brand new website is finally live!',
			'Gary and Jonny have known each other for over twenty years - that\'s too long.',
			'Jonny currently has a clothes moth infestation at his flat. Two T-shirts have fallen so far.',
			'Gary recently took part in a cycle race, RideLondon-Surrey, and didn\'t die.',
			'Jonny came dangerously close to reaching his five-a-day fruit and veg target this Tuesday.',
			'Gary once punched his brother over a game of Worms on the Amiga 500.',
			'Did you know that you can navigate the site by clicking on the arrow keys?'],

		pagenames : ["home", "leaves", "spark", "networks", "jonny", "gary", "contact"],
    };

	Main.init = function () {
		View.init(function(){
			Main.onViewReady();
		});
	};

	Main.onViewReady = function()
	{
		trackevent('site', 'site', 'javascript ready', 'init', 0, true);

		Main.addListeners();
		Main.keySupport();
		Main.changePage(Main.currentpage);
		Main.startNews(Main.currentnews);
		Main.resizeListener();

		//Main.setupPages();
		//Main.touchScroll();
		//Main.movesectionsTo(0, 0);
	};

	Main.resizeListener = function()
	{
		$(window).resize(function() {

			if(Main.currentheight  != $(window).height() ){
				//log('on window resize [' + $(window).width() + 'x' + $(window).height() +  ']');
				trackevent('site', 'window', 'resized', 'browser', $(window).height(), true);
				View.movesectionsTo(Main.currentpage, 500);
			}
		});
	};

	Main.setupPages = function ()
    {
        var pages = Main.pages;
        var count = 0;

        $.each(pages, function(page, item) {

        	var ispage = ( typeof item == "string") ? true : false;

        	if(ispage)
        	{
        		//log('page[' + page + '] type[' + typeof item + ']');
        		//View.addPage();
        		count++;
        	}else{
        		$.each(item, function(p, i) {
        			//log('page[' + p + '] type[' + typeof i + ']');
        			//View.addPage();
        			count++;
        		});
        	}
        });
        //Main.totalpages = count;
        log('total pages[' + count + ']');
    };

	Main.click = function(){
        var type = $(this).data('btn-type') || $(this).attr('data-btn-type') || null;
        var id = $(this).data('btn-id') || $(this).attr('data-btn-id') || null;
        if(type) {
        	$('#wrapper').trigger('BtnEvent', { type : type, id : id});
        	trackevent(Main.pagenames[Main.currentpage], type, 'clicked', 'buttons');
        	trackpage(type + "/" + id, Main.pagenames[id]);
        }
    };

    Main.out = function(){
    	var type = $(this).data('btn-type') || $(this).attr('data-btn-type') || null;
    	//var id = $(this).data('btn-id') || $(this).attr('data-btn-id') || null;
        $('#wrapper').trigger('BtnEvent', { type : 'tooltip', id : null });
        trackevent(Main.pagenames[Main.currentpage], type, 'roll out', 'buttons');
        //if(type == 'nav') $('#wrapper').trigger('BtnEvent', { type : 'nav-out', id : id});
    };

    Main.over = function(){
    	var type = $(this).data('btn-type') || $(this).attr('data-btn-type') || null;
    	var id = $(this).data('btn-id') || $(this).attr('data-btn-id') || null;
        var tooltip = $(this).data('btn-tooltip') || $(this).attr('data-btn-tooltip') || null;
        if(tooltip) $('#wrapper').trigger('BtnEvent', { type : 'tooltip', id : tooltip });
        trackevent(Main.pagenames[Main.currentpage], type, 'roll over', 'buttons');
        if(type == 'nav') $('#wrapper').trigger('BtnEvent', { type : 'nav-over', id : id});
    };

	Main.addListeners = function()
    {
    	$("#wrapper").bind('BtnEvent SiteEvent', function(evt, data){
            var f,p;
            switch(data.type)
            {
                case 'nav':
                    f = Main.changePage
                    p = data.id;
                break;

                case 'nav-over':
                    f = Main.openNav
                    p = data.id;
                break;

                case 'nav-out':

                    f = Main.closeNav
                    p = data.id;
                break;

                case 'email':
                    f = Main.doMailTo
                    p = data.id;
                break;

                case 'tooltip':
                	f = Main.changeTooltip 
                    p = data.id;
                break;

                case 'url':
                	f = Main.openUrl 
                    p = data.id;
                break;

                case 'content-arrow':
                	f = Main.changeContent
                    p = (data.id == 'left') ? Main.currentcontent - 1 : Main.currentcontent + 1;
                    if(p < 0) p = Main.totalcontents[Main.currentpage]-1;//0;
                    if(p > Main.totalcontents[Main.currentpage]-1) p = 0;//Main.totalcontents[Main.currentpage]-1;
                break;

                case 'page-arrow':
                	f = Main.changePage
                    p = (data.id == 'up') ? Main.currentpage - 1 : Main.currentpage + 1;
                    if(p < 0) p = Main.totalpages-1;//0;
                    if(p > Main.totalpages-1) p = 0;//Main.totalpages-1;
                break;

                case 'page-changed':
                    f = Main.onPageChanged
                    p = data.id;
                break;

                case 'content-changed':
                    f = Main.onContentChanged
                    p = data.id;
                break;
            }
           	if (f) f(p);
        });
    };

    Main.doMailTo = function(_host)
    {
        var handle, host, email, subject, subjects;
        trackevent('site', 'doMailTo', 'opened', 'events', 0, true);
        handle = "oddsockgames";
        host = "gmail" + "." + "com";
        email = handle + "@" + host;
        subjects = ["All the things", "Spoons", "Jam", "I eat spam", "There\'s always money in the banana stand", "All your base are belong to us", "Splunge"];
        subject = subjects[Math.floor(Math.random()*subjects.length)];
        
        //window.location.href = "mailto:test@test.com";
        //var a = $('<a href="mailto:test@test.com" target="_top">click</a>');
        //$('#wrapper').append(a);
        //a.click().remove();
        window.open( "mail" + "to:" + email + "?subject=" + subject , "_blank");
       	//window.location.href = "mail" + "to:" + email;
    };

    Main.openUrl = function(_url)
    {
    	var reg = /^(?:(ftp|http|https):\/\/)/;
    	if( !reg.test(_url) )  _url = "http://" + _url;
    	trackevent('site', 'openUrl', 'called', 'functions', 0, true);
    	window.open(_url, "_blank")
    }

    Main.isTouchDevice = function (){
		try{
			document.createEvent("TouchEvent");
			return true;
		}catch(e){
			return false;
		}
	};

	Main.keySupport = function()
	{
		$(document).keyup(function (event) {
				switch(event.keyCode)
				{
					case 37: //left
						$('#wrapper').trigger('BtnEvent', { type : 'content-arrow', id : 'left' });
						trackevent('site', 'keySupport', 'called', 'functions', event.keyCode, true);
					break;
					case 38: //up
						$('#wrapper').trigger('BtnEvent', { type : 'page-arrow', id : 'up' });
						trackevent('site', 'keySupport', 'called', 'ffunctions', event.keyCode, true);
					break;
					case 39: //right
						$('#wrapper').trigger('BtnEvent', { type : 'content-arrow', id : 'right' });
						trackevent('site', 'keySupport', 'called', 'ffunctions', event.keyCode, true);
					break;
					case 40: //down
						$('#wrapper').trigger('BtnEvent', { type : 'page-arrow', id : 'down' });
						trackevent('site', 'keySupport', 'called', 'functions', event.keyCode, true);
					break;
				}
		});
	};

	Main.touchScroll = function()
	{
		if( Main.isTouchDevice() ){ 
			var id = 'wrapper';
			var el = document.getElementById(id);
			var scrollStartPos=0;
			document.getElementById(id).addEventListener("touchstart", function(evt) {
				evt.preventDefault();
				scrollStartPos = this.scrollTop + event.touches[0].pageY;
			},false);
			document.getElementById(id).addEventListener("touchmove", function(evt) {
				evt.preventDefault();
				//Main.movesectionsBy(scrollStartPos-event.touches[0].pageY);
				Main.movesectionsBy(120);
				//this.scrollTop = scrollStartPos-event.touches[0].pageY;
			},false);
		}
	};

	Main.changeTooltip = function(_id)
	{
		View.updateToolTip(_id);
	} 

	Main.changePage = function(_id)
	{
		if(Main.busy) return;
		trackevent('site', 'changePage', 'called', 'functions', _id, true);
		trackpage(Main.pagenames[_id] + "/opened", Main.pagenames[_id]);
		//if(Main.currentpage == _id) return;
		Main.busy = true;
		
		if(Main.totalcontents[Main.currentpage] != 1) View.movecontentTo(Main.currentpage, 0);//reset

		Main.currentpage = _id;

		View.showLoading();
		View.hideArrows();

		var time = 3000;
		View.movesectionsTo(_id, time);
		View.updateNav(_id);

		var delay = setTimeout(function(){
			View.updateNavBg(_id);
            View.updateFooter(_id);
			View.updateCopy(_id);
        },time/2)

	};

	Main.openNav = function(_id)
	{
		if(Main.busy) return;
		log('show sub nav')
		View.showSubNav(_id);
	};

	Main.closeNav = function(_id)
	{
		//if(Main.busy) return;
		//View.hideSubNav();
	};

	Main.changeContent = function(_id)
	{
		if(Main.busy || Main.totalcontents[Main.currentpage] == 1) return;
		trackevent('site', 'changeContent', 'called', 'functions', _id, true);
		View.showLoading();
		View.hideArrows();
		Main.busy = true;
		View.movecontentTo(Main.currentpage, _id);
	};

	Main.onContentChanged = function(_id)
	{	
		trackevent('site', 'onContentChanged', 'called', 'functions', _id, true);
		Main.currentcontent = _id;
	   	Main.busy = false;
	   	View.hideLoading();
	   	View.showArrows(Main.currentpage, _id); 
	};

	Main.onPageChanged = function(_id)
	{	
		trackevent('site', 'onPageChanged', 'called', 'functions', _id, true);
		//Main.currentpage = _id;
		View.updateHash(Main.pagenames[_id])
	   	Main.busy = false;
		View.hideLoading();
		View.showArrows(_id, Main.currentcontent);    	
	};


	Main.startNews = function()
	{
		var interval, time, index;
		View.updateHeader(Main.currentnews);

		time = 6000;
		interval = setInterval(function(){
			index = Main.currentnews + 1;
			if(index > Main.news.length -1) index = 0;
			Main.currentnews = index;
            View.updateHeader(index);
        },time)
	};

////////////////////////[ END ]/////////////////////////////
})();