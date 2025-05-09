# Migration from v2 to v3

## History

- V1 of the website used Flask for a JSON API, a statically-exported `create-react-app` frontend, and a MySQL database ([dhvanim](https://github.com/dhvanim) in 2022).
- V2 of the website used a faster, simplified Flask backend, a statically-exported `create-next-app` frontend, and a SQLite database ([zietzm](https://github.com/zietzm) in 2024).
- V3 is in progress. My (@zietzm) goal was to move to a full-stack NextJS app (from pages router to app router), but I wasn't able to finish this before leaving (May 2025).

## Remaining Todos

- Build a derived table to serve the individual ingredient page.
- Update the individual ingredient page component.
- Fix the frontpage stats query (this was another derived table that needs to be built).
- (If you stick with full-stack JS) remove the Flask backend, greatly simplify the deployment playbook, consider using [Caddy](https://caddyserver.com/) instead of NGINX for even greater simplicity (auto SSL certs, much simpler config).

## Why full-stack JS?

Compared to v2, OnSIDES v3 has WAY more data and uses a new database schema.
Previously, the backend would give full lists (e.g. all ingredients, all adverse effects, etc.).
This stopped being feasible with v3 data, so I started trying to implement paging.
But, the new database format made the queries too slow, and I needed deterministic ordering.
So I started working on SQL queries to build derived tables to speed up queries (see [frontend/derived-tables.sql](frontend/derived-tables.sql)).
This seems to have worked well for the pages that have already been updated.
Unfortunately, I wasn't able to finish this work for the most complex pages, like the individual ingredient pages.

## Apologies

I've only ever built web apps with JSON APIs and React frontends or full HTML templates with SSR.
This whole SSR React thing seemed like a good choice for this project, and may still be, but it certainly complicated this refactor.
I was using [Bun](https://bun.sh/) for this project, and inadvertently made it dependent on Bun by using the [Bun SQLite driver](https://bun.sh/docs/api/sqlite).
This should be an easy fix if you want to swap it.

If you're refactoring this project, I'm not sure I'd suggest sticking with the Bun+NextJS combo.
A lot of other lab projects use Remix, which seems nice.
The hardest part of refactoring this should be developing the last SQL queries.
