/**
 * Assignment 7
 */

/** Load the list of albums */
function listAlbums() {
    // TODO make an AJAX request to /albums
    // then populate the "albums_list" list with the results

    $.ajax({
        url : 'http://127.0.0.1:5000/albums',
        type : 'GET',
        dataType : 'json',
        async: true,
        success : function (response) {
        var html_album_list = "";
        for (var element in response){
            var item = response[element];
            var title = item["title"];
            var artist = item["artist"];
            var id = item["id"];
            var onclicked_function = "showAlbum("+id+")";
            html_album_list += "<li><a href=\"javascript:" + onclicked_function +"\">" + artist + " - " + title + "</a></li>";            
        }
        document.getElementById("albums_list").innerHTML = html_album_list;
    }
    });
}



/** Show details of a given album */
function showAlbum(album_id) {
    $.ajax({
        url : 'http://127.0.0.1:5000/albuminfo?album_id='+album_id,
        type : 'GET',
        dataType : 'json',
        async: true,
        success : function (response) {
        var image = response["image"];
        var album_cover = "<img src=\"/static/images/" + image + "\" />";
        document.getElementById("album_cover").innerHTML = album_cover;
        
        
        var html_album_songs = "<table> <tr> <th>No.</th> <th>Title</th> <th>Length</th> </tr>";

        var song_no = 1;
        for (var i in response["tracks"]){
            var track = response["tracks"][i];
            html_album_songs += "<tr>";
            var song_length = track["duration"];
            var song_title = track["title"];

            html_album_songs += "<td class=\"song_no\">" + song_no + ".</td>";
            html_album_songs += "<td class=\"song_title\">" + song_title + "</td>";
            html_album_songs += "<td class=\"song_length\">" + song_length + "</td>";
            

            html_album_songs += "</tr>";
            song_no+=1;
        }
        html_album_songs += "</table>";
        document.getElementById("album_songs").innerHTML = html_album_songs;
    }
    });
}
