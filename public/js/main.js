(function() {

    $(document).ready(function() {
        renderLoginScreen();

        $(window).on('resize', renderResize);

        $('.btn-login').on('click', renderMainScreen);
        $('.nav-btn').on('click', openMenu);
        $('.close-btn').on('click', closeMenu);
    });

    function renderResize() {
        var h = $(window).height(),
            w = $(window).width();

        $('.sidebar').css({ height: h });
    }

    function renderLoginScreen() {
        var h = $(window).height(),
            w = $(window).width(),
            cnt = $('.login > .row > div'),
            cntHeight = cnt.height();

        $('.splash').css({ height: h, width: w });
        cnt.css({ marginTop: (h - cntHeight) / 2 });
        
        renderResize();
    }

    function renderMainScreen() {
        $('.content').css({ opacity: 0 });

        $('.logo').animate({
            height: 96,
            width: 96
        }, 250, function() {
            $('.content').removeClass('hide').delay(200).animate({ opacity : 1 }, 500);
        });

        $('.login').addClass('hide');
        // $('.content').removeClass('hide');
        $('.logo').removeClass('splash');
    }

    function openMenu() {
        var w = $(window).width();

        $('body').css({ overflow: 'hidden' });
        $('body').animate({ marginLeft: 200 }, 250);
        $('.logo').animate({ left: (w / 2) + 150 });
    }

    function closeMenu() {
        var w = $(window).width();

        $('body').css({ overflow: 'auto' });
        $('body').animate({ marginLeft: 0 }, 250);
        $('.logo').animate({ left: '50%' });
    }

})();