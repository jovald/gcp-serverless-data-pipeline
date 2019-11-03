# Serverless data pipeline with Cloud Functions, Pub/Sub and BigQuery on GCP

This project aims to show how to implmenet a simple data pipeline on GCP using some of its serverless services: **Cloud Functions**, **Pub/Sub**, **Cloud Scheduler** and **BigQuery**.

## Introduction

The pipeline consist of a process that regularly gets data from an API and load it into BigQuery. Considering its popularity, the current weather data API by **OpenWeatherMap** was choosen to exemplify the data gathering stage.

### Reference architecture

The next image shows the reference architecture for this project.

![Architecture](https://raw.githubusercontent.com/jovald/gcp-serverless-data-pipeline/assets/gcp-serverless-data-pipeline.jpg)

### Talking about the pipeline

The process could be explained by the next steps:

1. Depending on the frequency, a job of Cloud Scheduler triggers a topic on Cloud Pub/Sub.
2. That action, executes a Cloud Function (*loadDataIntoBigQuery*) that gets data from OpenWeatherMap.
3. Then, this data is loaded into BigQuery.
4. Finally, the data could be analyzed directly BigQuery or Data Studio.

### System requirements

The following is needed in order to deploy the services:

1. A [GCP project](https://cloud.google.com/resource-manager/docs/creating-managing-projects) with a [linked billing account](https://cloud.google.com/billing/docs/how-to/modify-project)
2. Installed and initilized the [Google Cloud SDK](https://cloud.google.com/sdk/install)
3. Created an APP Engine app in yout project. [Why?](https://cloud.google.com/scheduler/docs/setup)
4. Enabled the Cloud Functions, Cloud Scheduler and APP Engine APIs
5. An API Key from [OpenWeatherMap](https://openweathermap.org)

### Costs

This pipeline uses billable components of Google Cloud Platform, including:

* Google Cloud Functions
* Google Cloud Pub/Sub
* Google Cloud Scheduler
* Google BigQuery

---

## Deployment

This sections shows you how to deploy all the services needed to run the pipeline.

### Setting up environment variables

Before continue, is prefereable to set up some environment variables that will help you executing the *gcloud* commands smoothly.

```sh
export PROJECT_ID=<Your_Project_Id>

# The topic name fo Pub/Sub.
export TOPIC_NAME=<Your_Pub_Sub_Topic>

# It must be unique in the project. Note that you cannot re-use a job name in a project even if you delete its associated job.
export JOB_NAME=<Your_Cron_Scheduler_Job_Name>

# The name of the function corresponds to the exported function name on index.js
export FUNCTION_NAME="loadDataIntoBigQuery"

# E.g., if you want a frequency of execution of 1 hour, the variable should be SCHEDULE_TIME="every 1 hour".
export SCHEDULE_TIME=<Your_Cron_Schedule>

# OpenWeatherMap API key
export OPEN_WEATHER_MAP_API_KEY=<Your_Open_Weather_Map_Api_Key>

# Consider that dataset names must be unique per project. Dataset IDs must be alphanumeric (plus underscores)
export BQ_DATASET=<Your_BQ_Dataset_Name>

#The table name must be unique per dataset.
export BQ_TABLE=<Your_BQ_Table_Name>
```

### 1. Activate the project

```sh
gcloud config set project $PROJECT_ID
```

### 2. Create the Cloud Scheduler job

```sh
gcloud scheduler jobs create pubsub $JOB_NAME --schedule=$SCHEDULE_TIME --topic=$TOPIC_NAME --message-body="execute"
```

If you want to change the frequency of the execution, the following command will help:

```sh
gcloud scheduler jobs update pubsub $JOB_NAME --schedule=$SCHEDULE_TIME
```

### 3. Create the Cloud Pub/Sub topic

```sh
gcloud pubsub topics create $TOPIC_NAME
```

### 4. Create a BigQuery dataset

```sh
bq mk $BQ_DATASET
```

### 5. Create a BigQuery table

```sh
bq mk --table $PROJECT_ID:$BQ_DATASET.$BQ_TABLE
```

### 6. Deploy the Cloud Function

```sh
gcloud functions deploy $FUNCTION_NAME --trigger-topic $TOPIC_NAME --runtime nodejs10 --set-env-vars OPEN_WEATHER_MAP_API_KEY=$OPEN_WEATHER_MAP_API_KEY,BQ_DATASET=$BQ_DATASET,BQ_TABLE=$BQ_TABLE
```

---

## What now

I want to write this section only as an opinion and give ideas of how to end this pipeline as real king or queen of data.

Also, you have to consider that this particular stage depends totally on the data or insights you want to obtain. [Felipe Hoffa](https://medium.com/@hoffa) illustrates different use cases and ideas using BigQuery, you should read him on Medium!

### Query your BigQuery table

Two options (clearly more).

First, remember the env variables? they are still util. if you run the next command, a BigQuery job will be excuted that consist of a query to count all the records on your table. If you complete the steps above correctly, you will see at least one record counted.

```sh
bq query --nouse_legacy_sql "SELECT COUNT(*) FROM $BQ_DATASET.$BQ_TABLE"
```

Second, BigQuery on the GCP Console is also an enjoyable manner to explore and analyze your data.

### Data Studio, the great finale

Day to day, the Google's technological ecosystem grows rapidly. This project is a small, but concise, proof of how complete could be an end to end data solution built into this ecosystem.

Just to try (you should do it), I built a report on Data Studio and was a great and fast experience. In my opinion, the analytical power of BigQuery combined with its report/dashboard tool is the perfect double for small and big data end prcosses. Look at this report, just 20-30 minutes of learn by doing, connected directly to BigQuery!

![Data Studio](https://raw.githubusercontent.com/jovald/gcp-serverless-data-pipeline/assets/data-studio-sample.png)

*This is not propaganda, Google didn't payme for this (unfortunately).*

---

## Authors

* **[Jose Valdebenito](https://github.com/jovald)**

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Further readings

* [Background Functions](https://cloud.google.com/functions/docs/writing/background)
* [Writing Cloud Functions](https://cloud.google.com/functions/docs/writing/)
* [Deploying from Your Local Machine](https://cloud.google.com/functions/docs/deploying/filesystem)
* [Using Pub/Sub to trigger a Cloud Function](https://cloud.google.com/scheduler/docs/tut-pub-sub)
* [Creating datasets](https://cloud.google.com/bigquery/docs/datasets)
