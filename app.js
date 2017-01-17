$(document).ready(function() {
  spCtx = SP.ClientContext.get_current();
  spWeb = spCtx.get_web();
  spUser = spWeb.get_currentUser();
  strList = 'Photo Gallery';

  spCtx = SP.ClientContext.get_current();
  spCtx.load(spUser);
  spCtx.executeQueryAsync(function() {
    console.log(spUser);
    getPictures();
  }, function() {
    alert("Connection Failed. Refresh the page and try again. :(");
  });
});

function getListItems(listTitle, queryText, success, error) {
  var list = spWeb.get_lists().getByTitle(listTitle);
  var spQuery = new SP.CamlQuery();
  spQuery.set_viewXml(queryText);
  var items = list.getItems(spQuery);
  spCtx.load(items);
  spCtx.executeQueryAsync(
    function() {
      success(items);
    },
    error
  );
}

function getPictures() {
  var camlQueryText = '<View><Query><OrderBy><FieldRef Name="Modified" Ascending="FALSE"/></OrderBy></Query></View>';
  getListItems(this.strList, camlQueryText,
    function(items) {
      var pictureEntries = [];
      for (var i = 0; i < items.get_count(); i++) {
        var item = items.getItemAtIndex(i);
        var entry = {
          'Url': item.get_item('FileRef'),
          'Name': item.get_item('Title')
        };
        pictureEntries.push(entry);
        $("#slideshow-images").append(
          $("<div/>", {
            "class": "item",
          }).html('<img src="' + entry.Url + '" alt="..."><div class="carousel-caption"><h3>' + (entry.Name != null?entry.Name:"") + '</h3></div>')
        );

        $("#slideshow-indicators").html($("#slideshow-indicators").html() + '<li data-target="#main-carousel" data-slide-to="' + i + '"></li>');
      }

      $("#slideshow-images").children().eq(0).addClass("active");
      $("#slideshow-indicators").children().eq(0).addClass("active");
    },
    Function.createDelegate(this, onQueryFailed));
}

function onQueryFailed(sender, args) {
  console.log('Request failed.' + args.get_message() +
    '\n' + args.get_stackTrace());
}
