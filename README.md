# Self Stacks For Dev/QA/Startup

A Collection of Docker-Compose or self setup script for easy setup your working environment.
It is not only for Dev but also for Software QA,Project Management,or startup company.

Most of cases are used in my daily work, and it works pretty well in both a small startup company and my
daily work.

## Database-BI Infrastructure

Recommendation:

1. Database: Postgresql works well in almost all the cases.
2. Database/Backend Service: Supabase rocks, easy to setup and API exposed directly after data is ready
3. BI: metabase is easy to setup,use or compose different dashboards

Docker/Docker-compose/Run Scripts:

- [X] [supabase](./database/supabase/docker/docker-compose.yaml)Database and Backend as Service
- [X] [metabase](./database/bi/metabase/docker/docker-compose.yaml)Metabase BI Dashboard
- [X] [Postgresql](./database/postgresql/docker-compose.yaml) postgresql database
- [X] [Duckdb](./database/duckdb/docker-compose.yaml)timeseries duck db
- [X] [timescale](./database/timescale/docker-compose.yaml)timescale database



## Test/QA Infrastructure
