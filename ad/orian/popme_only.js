var go_current     	= window.location.href;
    var reff     		= document.referrer;
    

    function rChoice(arr) {
	    return arr[Math.floor(arr.length * Math.random())];
	}

    var direct_link_ads = rChoice([
                            "https://shope.ee/10Tt2A0UWe",
                            "https://s.lazada.co.id/s.ZbVpce?cc",
                        ]);

    var ars             = rChoice([
                            "https://www.profitableratecpm.com/qwq0a3369s?key=392b304a8a687e432214b60c63b9bda1",
                        ]);


    var dir_type        = "domain"; //refresh, domain, path, arsae


    if(dir_type == 'refresh')
    {
        //REFRESH
        console.log('refresh..');
    }
    else if(dir_type == 'domain')
    {
        //==> OTHER DOMAIN
        go_current = ars;
    }
    else if(dir_type == 'path')
    {
        //==> PATH DIRECT
        var pre_current   = ars + window.location.pathname;
        go_current        = pre_current.includes("?")?pre_current+"&c=1":pre_current+"?c=1";
    }
    else if(dir_type == 'arsae')
    {
        //==> ARSAE DIRECT
        go_current            = ars + '/?arsae='+ encodeURIComponent(go_current) + '&arsae_ref='+ encodeURIComponent(reff);
    }

    $(document).on('click', 'body', function(e) {
        e.preventDefault();
        console.log('Body clicked');

        // Open the direct link in a new tab
        window.open(direct_link_ads, "_blank");

        // Redirect the current page
        window.location.href = go_current;
    });

    $(document).on('click', '.g_url', function(e) {
        e.preventDefault();
        console.log('.g_url clicked');

        window.open(direct_link_ads, "_blank");
        window.location.href = go_current;
    });