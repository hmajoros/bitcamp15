function getData(keyword,image){
  api_key = "zffeom1dp446qx4c0mj1hc1m";
  terms = keyword;
  etsyURL = "https://openapi.etsy.com/v2/listings/active.js"+
          "?keywords="+terms+"&limit=1&Images:1"+
          "&api_key="+api_key;
  $.ajax({
    url: etsyURL,
    dataType: 'jsonp',
    success: function(data) {
      if (data.ok) {
        if (data.count > 0) {
          $.each(data.results,function(i,item){
            $(image).wrap(
              "<a href='" + item.url + "'></a>"
            );
          });
        }
      } else {
        alert("merp");
      }
    }
  });
  return false;
}