# Contact Importer
[![Tests](https://github.com/gabbanaesteban/importer/actions/workflows/tests.yml/badge.svg)](https://github.com/gabbanaesteban/importer/actions/workflows/tests.yml)
[![codecov](https://codecov.io/gh/gabbanaesteban/importer/branch/main/graph/badge.svg?token=Lwe9CQfCsr)](https://codecov.io/gh/gabbanaesteban/importer)

Simple project to import contacts from a CSV file.

## Requirements

- Node 18
- Docker (PostgreSQL and Redis)
  
## Run the project

In order to run the project, you need to run the following commands:

#### Build
```bash
mv .env.example .env
npm ci
npm test
npm run build # This is required to RUN the compiled code
```
#### Prepare Database
```bash
npm run db:up # Remove the -d flag in order to avoid running in background
npm run db:migrate  
npm run db:seed # This command adds the test user to the database
```
#### Run #####
The project is composed for two processes: the server and the worker.
```bash
npm run start # This command runs the server
npm run start-consumer # This command runs the worker
```

## Basic Usage

 There are 4 sample files:

| Files | Result |
| -------- | -------- |
| [failed.csv](samples/failed.csv) | Failed |
| [mixed.csv](samples/mixed.csv) | Finished |
| [success.csv](samples/success.csv) | Finished |
| [different_mapping.csv](samples/different_mapping.csv) | Finished |

All but `different_mapping.csv` use the same mapping and it is hardcoded in the **Import** form for the sake of simplicity. In order to use a different mapping, just fill out the form with the correct headers.

### Notes
The queue has a delay of **3 seconds** in order to simulate a long running process. This is done in order to test the queue and the worker. Also, we can update the **Imports** page and see how each import is updated.

## Improvements

#### **Dockerize project**
There is an issue with `Bull` when running on Docker. Didn't have the time to look into it.

#### **Add more tests**
The most critical parts of the project are well tested, but all tests are unit tests.

#### **Performance**
We could save the **contacts** and **logs** in batches so we don't have to make a lot of queries to the database.

#### **UX**
It would be nice to get the first row of the CSV file in the frontend and use it to fill out the form. So instead of writing the headers manually, we could just click on the correct field.
