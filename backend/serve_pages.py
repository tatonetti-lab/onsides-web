import os

from flask import (
    Blueprint,
    render_template,
    send_from_directory,
)

serve_pages = Blueprint(
    "serve_pages",
    __name__,
    template_folder="../frontend/build",
    static_folder="../frontend/build/static",
)
list_of_build_files = set(os.listdir("../frontend/build"))


@serve_pages.route("/", defaults={"path": ""})
@serve_pages.route("/<path:path>")
def catch_all(path):
    # print(path)
    if path in list_of_build_files:
        return send_from_directory("../frontend/build", path)
    return render_template("index.html")
