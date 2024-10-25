from flask import Flask

from api import api
from serve_pages import serve_pages

app = Flask(
    __name__,
    static_url_path="/public",
    template_folder="../frontend/build",
    static_folder="../frontend/build/static",
)


app.register_blueprint(api)
app.register_blueprint(serve_pages)

if __name__ == "__main__":
    app.run(port=8888)
