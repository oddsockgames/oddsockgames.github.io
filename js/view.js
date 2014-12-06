var View = {};

(function () {
    'strict mode';

    View = {
        easing : 'linear' //replaced!!
    };

	View.init = function (_callback) {
		log('Initialising View...');
		View.extendEasing();
        View.extendFxstep();

        //-TEST ENVIRONMENT
		this._eleRefs = {
             wrapper: $('#wrapper')
            ,sidebar: $('#sidebar')
            ,nav: $('#sidebar-nav')
            ,copy: $('#sidebar-copy')
            ,sections: $('#sections')
            ,pagearrows: $('.page-arrow')
            ,contentarrows: $('.content-arrow')
            ,header: $('#header')
            ,footer: $('#footer')
            ,tooltip: $('#tooltip')
            ,loading: $('#loading')
            ,buttons : $('.nav-item, .nav-subitem, .content-arrow, .txtbtn, .imgbtn, .network-icon, .page-arrow, .network-icon-small')
        };

        //-TEST ENVIRONMENT
        this._env = {
             isMac: $('html').hasClass('mac')
            ,isChrome: $('html').hasClass('chrome')
            ,isIPad: $('html').hasClass('ipad')
            ,isIPhone: $('html').hasClass('iphone')
            ,isIPod: $('html').hasClass('ipod')
            ,isWebkit: $('html').hasClass('webkit')
            ,isMobile: $('html').hasClass('mobile')
            ,visibleWidth: function () { return window.innerWidth || $(window).width() }
            ,visibleHeight: function () { return window.innerHeight || $(window).height() }
        };

        this._env.isIOS = this._env.isIPhone || this._env.isIPad || this._env.isIPod;
        
        this._evts = {};

        if (this._env.isMobile) {
            this._evts = {
                 click: 'touchstart'
                ,activate: 'touchstart'
                ,deactivate: 'touchend touchcancel'
            };
        } else {
            this._evts = {
                click: 'mousedown'
                ,activate: 'mousedown'
                ,deactivate: 'mouseup'
           };
        }

        //-ADJUST INITIAL SCALE ON TABLETS/DEVICES WIDTH EXTRA WIDTH
        if (this._env.isMobile && $(window).width() > 1000) {
            //log('Adjusting initial-scale for large screen mobile...' ,'view');
            var vp = $ ('[name="viewport"]');
            var val = vp.attr('content').replace(/initial\-scale=\d?\.?\d?/, 'initial-scale=1.0');
            vp.attr('content', val);
        }

        //-SETUP CONTENT
        this._eleRefs.buttons.click( Main.click );
        this._eleRefs.buttons.mouseover( Main.over );
        this._eleRefs.buttons.mouseout( Main.out );
        this._eleRefs.nav.mouseout( function(){
            View.hideSubNav() }
        );

        this._eleRefs.wrapper.bind('DOMMouseScroll mousewheel', function(e){
            var scroll;
            scroll = (e.type == 'DOMMouseScroll') ? e.originalEvent.detail : e.originalEvent.wheelDelta;
            //View.movesectionsBy(scroll);
            //if(Main.menuopened) Main.openmenu(false);
            return false;
        });

        View.moveToolTip();

        View.checkHash();
        //View.addMailTo();

        if(_callback) _callback();
	};

    View.checkHash = function(_callback)
    {
        var hash;
        //top.location = self.location;
        if ( window.self === window.top ) { log('checkHash: NOT in frame') } else { log('checkHash: in frame') }
        log('1. window.location [' + top.location.href + ']');
        log('2. window.parent.location [' + self.location.href + ']');
        //log('2. window.location.hash: ' + window.parent.location.href);
        // log('3. top.window.location.hash: ' + top.window.parent.location.href);
        //log('4. top.document.location.hash: ' + top.document.location.href);
        //log('5. top.location.hash: ' + top.parent.location.href);

        $.each(Main.pagenames, function(id, item) {
            if (window.location.hash.split('#')[1] == item)
            {
                hash = item;
                Main.currentpage = id;
                trackevent('site', 'checkHash', 'alt hash used', 'functions', id, true);
                return false;
            }
        });
        if(!hash) View.updateHash('home');
    };

    View.updateHash = function(_page)
    {
        document.location =  '#' + _page;
    };

    View.moveToolTip = function()
    {
        var my = this, e = this._eleRefs;
        e.wrapper.mousemove(function(evt) { 
           e.tooltip.css('left', evt.pageX + 22).css('top', evt.pageY);
        });
    };

    View.addPage = function ()
    {
        var my = this, e = this._eleRefs;

        var content =  $('<div/>', {
            'class': 'content',
            style: 'background-color:yellow;'
        })

        var page = $('<div/>', {
            'class': 'section',
            style: 'background-color:blue;'
        }).html(content);

        e.sections.append(page);

    };

    View.movecontentTo  = function(_page, _id, _time)
    {
        var my = this, e = this._eleRefs, time;

        time = (_time) ? _time : 500;
        to = '-' + (_id*400);
        //e.sections.find('.section:eq('+Main.currentpage+') .wrap').css('backgroundPosition', '-' + (_id*400) + 'px')

        e.sections.find('.section:eq('+_page+') .images').stop().animate( {left: to + 'px'}, time, View.easing);
        

        timeout = setTimeout(function(){
            e.wrapper.trigger('SiteEvent', { type : 'content-changed', id : _id });
        },time)
    };

    View.movesectionsTo  = function( _id, _time)
    {
        var my = this, e = this._eleRefs, to, from, time, timeout ;

        //-move to a certain section, on nav click
        Main.currentheight = $(window).height();
        time = (_time) ? _time : 3000;
        to =  -( ( parseInt( e.sections.css('height') ) / Main.maxpages ) * _id );
        //$('#section-wrap').css('top', to);
        e.sections.stop().animate( {top: to + 'px'}, time, View.easing);

        e.sections.find('.wrap').each(function(i){
            to = 50 -  (100 *  (i - _id) );
            //--*following three lines are used to avoid animating with percent
            from =  $(this).css('top');
            $(this).css('top',  to + '%' );
            to = $(this).css('top');
            $(this).css('top',  from );
            //--
            $(this).stop().animate( {top: to }, time,  View.easing);
        });


        timeout = setTimeout(function(){
            e.wrapper.trigger('SiteEvent', { type : 'page-changed', id : _id });
        },time)
    };

    View.movesectionsBy = function( _amount )
    {
        //-move sections by amount, on scroll
        var my = this, e = this._eleRefs, max,  min, before, after, height, top, aftermod, page;

        height = parseInt( e.sections.css('height') );
        before = parseInt( e.sections.css('top') );
        max = ( height / Main.maxpages) * (Main.maxpages-1);
        min = 0;
        after = before + _amount;
        if(after > min ) after = min;
        if(after < -max ) after = -max;

        e.sections.css('top', after);

        aftermod = Math.abs(after) - ( ( height / Main.maxpages) / 2 );

        if( aftermod < 0 ){
        if(Main.currentpage != 0) page = 0;
        }else if( aftermod  < (height / Main.maxpages) * 1){
        if(Main.currentpage != 1) page = 1;
        }else if( aftermod  < (height / Main.maxpages) * 2){
        if(Main.currentpage != 2) page = 2;
        }else if( aftermod  < (height / Main.maxpages) * 3){
        if(Main.currentpage != 3) page = 3;
        }else if( aftermod  < (height / Main.maxpages) * 4){ 
        if(Main.currentpage != 4) page = 4;
        }

        e.wrapper.trigger('SiteEvent', { name : 'page-changed', id : page });

        if(before != after){
           e.sections.find('.wrap').each(function(i){
            before = parseInt( $(this).css('top') );
            after = before-_amount;
            $(this).css('top',  after );
           });
        }
    };

    View.updateFooter = function(_index)
    {
        var my = this, e = this._eleRefs;
        pagename = Main.pagenames[_index];
        var time = 500;
        e.footer.find('p:eq(1)').stop().fadeOut(time).delay(50).fadeIn(time);
        e.footer.stop().animate( {width: 15 + (5 * _index) + '%'}, time, View.easing, function(){

            e.footer.find('p:eq(1)').html( pagename.toUpperCase() );
        });

        e.footer.removeClass('grey').removeClass('white');
        e.header.removeClass('grey').removeClass('white');
        e.pagearrows.removeClass('grey').removeClass('white');
        e.contentarrows.removeClass('grey').removeClass('white');

        if(_index == 6)
        {
            e.footer.addClass('white');
            e.header.addClass('white');
            e.pagearrows.addClass('white');
            e.contentarrows.addClass('white');
        }else{
            e.footer.addClass('grey');
            e.header.addClass('grey');
            e.pagearrows.addClass('grey');
            e.contentarrows.addClass('grey');
        }
    };

    View.hideArrows = function()
    {
        var e = this._eleRefs;
        e.pagearrows.hide();
        e.contentarrows.hide();
    };

    View.showArrows = function(_page, _content)
    {
        var e = this._eleRefs;
        e.pagearrows.fadeIn(500);
        
        if(_page == 0) e.pagearrows.first().stop().hide();
        if(_page == Main.totalpages-1) e.pagearrows.last().stop().hide();

        //needs to get current page?
        //log('showArrows: ' + _content)

        //e.contentarrows.fadeIn(500);
        e.sections.find('.section:eq(' + _page + ') .content-arrow').fadeIn()
        if(_content == 0) e.sections.find('.section:eq(' + _page + ') .content-arrow').first().stop().hide();
        if(Main.totalcontents[Main.currentpage] != 1 && _content == Main.totalcontents[Main.currentpage]-1) e.sections.find('.section:eq(' + _page + ') .content-arrow').last().stop().hide();
    };

    View.updateHeader = function(_index)
    {
        var my = this, e = this._eleRefs;
        news = Main.news[_index];
        e.header.find('p:eq(1)').html( news );
    };

    View.hideSubNav = function()
    {
        var my = this, e = this._eleRefs;
        e.nav.find('.nav-subitem').stop().fadeOut(0);
        var page = Main.currentpage;
        if(page == 1 || page == 2) e.nav.find('.nav-subitem:eq(0), .nav-subitem:eq(1)').stop().fadeIn(0);
        if(page == 4 || page == 5) e.nav.find('.nav-subitem:eq(2), .nav-subitem:eq(3)').stop().fadeIn(0);
    };

    View.showSubNav = function(_page)
    {
        var my = this, e = this._eleRefs;
        if(_page == 1 || _page == 2) e.nav.find('.nav-subitem:eq(0), .nav-subitem:eq(1)').stop().fadeIn(0);
        if(_page == 4 || _page == 5) e.nav.find('.nav-subitem:eq(2), .nav-subitem:eq(3)').stop().fadeIn(0);
    };

    View.updateNav = function(_page)
    {
        var my = this, e = this._eleRefs;

        e.nav.find('p').removeClass('blue bold');
        e.nav.find('.nav-highlight p:eq(' + _page + ')').addClass('blue bold');

        //e.nav.find('p').css('color', 'white');
        //e.nav.find('.nav-highlight p:eq(' + _page + ')').css('color', '#0268cd');

        e.nav.find('.nav-subitem').fadeOut(250);

        if(_page == 1 || _page == 2) e.nav.find('.nav-subitem:eq(0), .nav-subitem:eq(1)').stop().fadeIn(250);
        if(_page == 4 || _page == 5) e.nav.find('.nav-subitem:eq(2), .nav-subitem:eq(3)').stop().fadeIn(250);
    
    };

    View.updateNavBg = function(_page)
    {
        var my = this, e = this._eleRefs;

        e.sidebar.removeClass('sidebar-light').removeClass('sidebar-dark').removeClass('sidebar-white');

        if(_page  == 0 || _page  == 3) {

            e.sidebar.addClass('sidebar-dark');
        }else if(_page  == 6){
            e.sidebar.addClass('sidebar-white');
        }else{
            e.sidebar.addClass('sidebar-light');
        }
    };

    View.updateCopy = function(_page)
    {
        var my = this, e = this._eleRefs;
        //e.copy.find('p').html( Main.pagecopy[_page] );
        e.copy.find('.page-info:not(' + _page + ')').hide();
        e.copy.find('.page-info:eq(' + _page + ')').show();
    };

    View.updateToolTip = function(_id)
    {
        var my = this, e = this._eleRefs;

        if(!_id)
        {
           // e.tooltip.find('p').html('');
            e.tooltip.css('display', 'none');
        }else{
            e.tooltip.find('p').html( '<span>&#9642;</span> ' + _id);
            e.tooltip.css('display', 'block');
        }
    };

    View.hideLoading = function()
    {
        var my = this, e = this._eleRefs;
        e.loading.hide();
    };

    View.showLoading = function()
    {
        var my = this, e = this._eleRefs;
        e.loading.show();
    };

    //-------------------------------------------------------------------
 
    View.nopx = function (_i) {
        return _i.replace(/[^-\d\.]/g, '');
    };

    View.updateBgPos = function (_target, _x, _y){
        _target.each(function() {
            var newx,nexy,bgpos;
            if($(this).css('backgroundPosition'))
            {
                bgpos = $(this).css('backgroundPosition').split(" ");
                newx = ( _x ) ? _x + 'px' : bgpos[0];
                newy = ( _y ) ? _y + 'px' : bgpos[1];
            }else{
                newx = ( _x ) ? _x + 'px' : $(this).css('background-position-x');
                newy = ( _y ) ? _y + 'px' : $(this).css('background-position-y');
            }
            $(this).css('backgroundPosition', newx + ' ' + newy);
        });
    };

	View.extendEasing = function(){
		$.extend($.easing,{
            easeOutExpo: function (x, t, b, c, d) {
                return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
		    },
            easeInOutCirc: function (x, t, b, c, d) {
                if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
                return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
            },
            easeInExpo: function (x, t, b, c, d) {
                return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
            },
            easeInOutQuint: function (x, t, b, c, d) {
                if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
                return c/2*((t-=2)*t*t*t*t + 2) + b;
            },
		});

        View.easing = 'easeInOutQuint';
    
	};

    View.extendFxstep = function(){
        $.extend($.fx.step,{
            backgroundPosition: function(fx) {
                if (typeof fx.end == 'string') {
                    var start = $.css(fx.elem,'backgroundPosition');
                    start = toArray(start);
                    fx.start = [start[0],start[2]];
                    var end = toArray(fx.end);
                    fx.end = [end[0],end[2]];
                    fx.unit = [end[1],end[3]];
                }
                var nowPosX = [];
                nowPosX[0] = Math.round(((fx.end[0] - fx.start[0]) * fx.pos) + fx.start[0]) + fx.unit[0];
                nowPosX[1] = Math.round(((fx.end[1] - fx.start[1]) * fx.pos) + fx.start[1]) + fx.unit[1];
                fx.elem.style.backgroundPosition = nowPosX[0]+' '+nowPosX[1];

                function toArray(strg){
                    strg = strg.replace(/left|top/g,'0px');
                    strg = strg.replace(/right|bottom/g,'100%');
                    strg = strg.replace(/([0-9\.]+)(\s|\)|$)/g,"$1px$2");
                    var res = strg.match(/(-?[0-9\.]+)(px|\%|em|pt)\s(-?[0-9\.]+)(px|\%|em|pt)/);
                    return [parseFloat(res[1],10),res[2],parseFloat(res[3],10),res[4]];
                }
            }
        });
    };
////////////////////////[ END ]/////////////////////////////
})();