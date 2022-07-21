from re import template
import MySQLdb
from flask import Flask, send_from_directory
from flask_restful import Api, Resource, reqparse
from flask_cors import CORS  # comment this on deployment
from flask import Flask, render_template, request
from flask_mysqldb import MySQL

import os
import json

app = Flask(__name__, static_url_path='/public', 
template_folder='./frontend/build', static_folder='./frontend/build/static')


CORS(app)  # comment this on deployment

app.config['MYSQL_HOST'] = os.environ.get("MYSQL_HOST")
app.config['MYSQL_PORT'] = int(os.environ.get("MYSQL_PORT"))
app.config['MYSQL_USER'] = os.environ.get("MYSQL_USER")
app.config['MYSQL_PASSWORD'] = os.environ.get("MYSQL_PASSWORD")
app.config['MYSQL_DB'] = os.environ.get("MYSQL_DB")

mysql = MySQL(app)


from serve_pages import serve_pages
from api import api

app.register_blueprint(api)
app.register_blueprint(serve_pages)

if __name__ == '__main__':
    app.run(  
        port=8888
	)
