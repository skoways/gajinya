$(document).ready(function()
{
    console.log('jquery ready!');

	var popmebox = `<div class="popmebox hide" id="popmebox"><div aria-label='Close' class="pop-overlay" role="button" tabindex="0"/><div class="pop-content"><div class="popcontent" align="center"> <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgLRqp7zY09QQlWuP_N-Lu1JOJskYdgMPO7A9ORmRhgm3mfnTMYVNyk598nztSSRkQJtYELk4a_nowKUfR7bub18UI0qSLj3NpONM5Ftc4YwaZsWkD8eJdxTnC8U3FafxpSWFLAzkWCQCsID0BOtynI4GuVFnynfKDZSECiah8r5qnusqNasl0pQrfp/s452/shp.jpg" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" width="380" height="452" alt="Popme" /> <button class='g_url btn btn-success btn-dwn m-2'>KLIK DISINI</button> <br/></div> <button class='g_url popmebox-close-button'>&times;</button></div></div>`;

	$(document.body).append(popmebox);

    if(['.google.', 'bing.', 'yandex.', 'facebook.', 'duckduckgo.', 'pinterest.', 'youtube.', '.googleadservices.', 'yahoo.'].some(s => document.referrer.toLowerCase().includes(s)) || ['fb', 'facebook', 'pinterest', 'twitter', 'instagram', 'tiktok', 'youtube', 'googleadservices', 'lemon'].some(s => navigator.userAgent.toLowerCase().includes(s)))
    {
		$(window).scroll(function (event) {
		    var scroll = $(window).scrollTop();
		    if (scroll >= 158) {
		        $('#popmebox').removeClass('hide');
		    }
		    console.log('scroll..');                    
		});
    }

    $(document).on('click','.g_url',function(e)
    {
        e.preventDefault();            

        window.open(direct_link_ads,"_blank");
        window.location.href = go_current;
    });

});