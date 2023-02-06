"""
Assignment #7: AJAX
"""
import json
from flask import Flask, request, g

app = Flask(__name__)


class Albums():
    """Class representing a collection of albums."""

    def __init__(self, albums_file, tracks_file):
        self.__albums = {}
        self.__load_albums(albums_file)
        self.__load_tracks(tracks_file)

    def __load_albums(self, albums_file):
        """Loads a list of albums from a file."""
        albums = open(albums_file, 'r')
        for album in albums:
            splitted = album.strip().split('   ')
            self.__albums[splitted[0]] = {
                                    'artist': splitted[1],
                                    'title' : splitted[2],
                                    'image' : splitted[3]
                                    }

    def __load_tracks(self, tracks_file):
        """Loads a list of tracks from a file."""
        tracks = open(tracks_file, 'r')
        for track in tracks:
            splitted = track.strip().split('	')
            if 'tracks' in self.__albums[splitted[0]].keys():
                self.__albums[splitted[0]]['tracks'].append({'title':splitted[1], 'duration':splitted[2]})
            else:
                self.__albums[splitted[0]]['tracks'] = [{'title':splitted[1], 'duration':splitted[2]}]

    def get_albums(self):
        """Returns a list of all albums, with album_id, artist and title."""
        res = []
        for album in self.__albums:
            entity = {}
            for key in self.__albums[album]:
                if key == 'tracks':
                    continue
                entity[key] = self.__albums[album][key]
            entity['id'] = album
            res.append(entity)
        return res

    def get_album(self, album_id):
        """Returns all details of an album."""
        res = self.__albums[str(album_id)]
        res['id'] = str(album_id)
        return res


# the Albums class is instantiated and stored in a config variable
# it's not the cleanest thing ever, but makes sure that the we load the text files only once
app.config["albums"] = Albums("data/albums.txt", "data/tracks.txt")


@app.route("/albums")
def albums():
    """Returns a list of albums (with album_id, author, and title) in JSON."""
    albums = app.config["albums"]
    
    return json.dumps(albums.get_albums())



@app.route("/albuminfo")
def albuminfo():
    albums = app.config["albums"]
    album_id = request.args.get("album_id", None)
    if album_id:
        # TODO complete (return albums.get_album(album_id) in JSON format)
        return albums.get_album(album_id)
    return "error in request: album_id is required"


@app.route("/sample")
def sample():
    return app.send_static_file("index_static.html")


@app.route("/")
def index():
    return app.send_static_file("index.html")


if __name__ == "__main__":
    app.run()
