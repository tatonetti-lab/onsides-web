from email.policy import default
import os
from flask import Blueprint, render_template, make_response, send_from_directory, redirect


serve_pages = Blueprint('serve_pages', __name__,
                        template_folder='frontend/build',
                        static_folder='frontend/build/static')
                        #name of the blueprint is what you will use in the html
#print(os.getcwd())
list_of_build_files = set(os.listdir('/var/www/onsides.tatonettilab.org/frontend/build'))
#list_of_build_files = set(os.listdir('frontend/build'))


@serve_pages.route('/', defaults={'path':''})
@serve_pages.route('/<path:path>')
def catch_all(path):
    #print(path)
    if path in list_of_build_files:
        return send_from_directory('frontend/build', path)
    return render_template("index.html")
