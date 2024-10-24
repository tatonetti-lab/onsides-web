# ONSIDES website

This website was originally created by [dhvanim](https://github.com/dhvanim) in 2022.

In 2024, it was brought back online by [zietzm](https://github.com/zietzm).

For questions about architecture and deployment, please contact [zietzm](https://github.com/zietzm).


## Overview

This is a Flask app (`backend/`) with a React frontend (`frontend/`).
It is deployed on Hetzner, using an nginx reverse proxy and a gunicorn HTTP server.
We programmatically deploy using ansible.

For backend development, we use [`uv`](https://docs.astral.sh/uv/).
To get started, install uv and run `uv sync --locked` to create a virtual environment containing all the requirements in `pyproject.toml`.

The database backend for this is a single SQLite database file.
First, download and unpack a [release of ONSIDES](https://github.com/tatonetti-lab/onsides/releases).
For example:

```bash
mkdir data
cd data
wget https://github.com/tatonetti-lab/onsides/releases/download/v2.1.0-20240925/onsides_v2.1.0_20240925.tar.gz
tar -xzvf onsides_v2.1.0_20240925.tar.gz
```

To create this file, use the `backend/etl.py` file.
Specifically, pass the path to the unpacked data using the `--data` argument (i.e. `uv run backend/etl.py --data data/20240925`).
This will take a few minutes to run.
Once complete, the `database.db` file should be ~850 MB.

This server depends on a single environmental variable (`ONSIDESDB`), which points to the database file.
This must be set for the server to function properly.

To start a development server, run `ONSIDESDB=database.db uv run flask run`.
Optionally, you can put the server into explicit development mode (enables hot reloading files as changed) via the environmental variable `FLASK_DEBUG` (i.e. `FLASK_DEBUG=1 ONSIDESDB=database.db uv run flask run`).

In production, the backend runs using a gunicorn server through a systemd process.
The file `flask-app.service.j2` is a templated systemd service file for this.

During development, you may want to change the API URL at `frontend/src/api/onsides.js`:

```js
// Possibly change this line
axios.defaults.baseURL = "https://onsidesdb.org/api";
// To the following
axios.defaults.baseURL = "http://localhost:5000/api";
```

There are many tools you can use for frontend development here.
Personally, I use [bun](https://bun.sh/).
To get started, I run `bun install --frozen-lockfile`.

To build the frontend to static files, I run `bun run build`.
For a frontend-specific development server, I run `bun run start`.
Note that this will need a backend API available, either through the website at `https://onsidesdb.org/api` or on localhost via a Flask development server.

To see exactly what happens during deployment, consult the ansible playbook `deploy.yml`, which provides step-by-step instructions for deployment.

Additionally, this requires an ansible inventory file specifying the login information for the server.
This could basically look like this (in the file `/etc/ansible/hosts`).

```yaml
all:
  hosts:
    hetzner:
      ansible_host: 5.78.130.180
      ansible_user: root
      ansible_ssh_private_key_file: /Users/zietzm/.ssh/webgwas_id_ed25519
```

Change the last line to the path to your ssh private key.

If you are not me, you'll probably need to log in to Hetzner and set up a new SSH key.


## TL;DR

- Make some changes to the repository and want to deploy?

```bash
uvx --from ansible-core ansible-playbook deploy.yml
```

- Want to update the data?

Get the latest release online.

```bash
# Change this to the latest release
wget https://github.com/tatonetti-lab/onsides/releases/download/v2.1.0-20240925/onsides_v2.1.0_20240925.tar.gz
tar -xzvf onsides_v2.1.0_20240925.tar.gz
uv run backend/etl.py --data 20240925
# This produces database.db
```

# Random other facts

- This machine also hosts WebGWAS.
- `onsidesdb.org` was acquired through AWS, so any DNS changes will need to be made there.
- We use Cloudflare nameservers (through [zietzm](https://github.com/zietzm)'s account; contact me if this needs to be changed).
- `*.j2` files are Jinja2 templates that ansible fills in for us during deployment. On the server, they will be just plain files (e.g. `flask-app.service`, `nginx.conf`).
- SSL certificates are through Let's Encrypt. These should be updated automatically by certbot, but, if not, just run through the ansible playbook or SSH in and run certbot manually.
