var go_current     	= window.location.href;
    var reff     		= document.referrer;
    

    function rChoice(arr) {
	    return arr[Math.floor(arr.length * Math.random())];
	}

    var direct_link_ads = rChoice([
                            "https://www.profitableratecpm.com/qwq0a3369s?key=392b304a8a687e432214b60c63b9bda1",
                            "https://www.profitableratecpm.com/zcwhmyk8hq?key=fbfba63fba399cfe756a5e3c5f15033d",
                        ]);

    var ars             = rChoice([
                            "https://www.profitableratecpm.com/mwiv5wy2h?key=d5a151442754245153252f973f3ed550",
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
