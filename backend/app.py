from flask import Flask

# from flask_cors import CORS  # comment this on deployment
from api import api

app = Flask(
    __name__,
)

# CORS(app, resources=["/api/*"], origins=["*"])  # comment this on deployment


app.register_blueprint(api)
