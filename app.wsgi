#! /usr/bin/python

import logging
import sys

#logging.basicConfig(level=logging.DEBUG, filename='var/www/onsides.tatonettilab.org/logs/app.logs', format='%(asctime)s %(message)s')
sys.path.insert(0, '/var/www/onsides.tatonettilab.org')
#sys.path.insert(0, '/var/www/onsides.tatonattilab.org/venv/lib/python3.8/site-packages')

from app import app as application
application.secret_key = 'anything you wish'
