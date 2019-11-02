# End to end serverless data pipeline with Cloud Functions, Pub/Sub and BigQuery on GCP

## Introduction

WORK IN PROGRESS

This projects aims to accelerate data pipeline deployments for small data.

### System requirements

The following is needed in order to deploy the services:

1. A [GCP project](https://cloud.google.com/resource-manager/docs/creating-managing-projects) with a [linked billing account](https://cloud.google.com/billing/docs/how-to/modify-project)
2. Install and initilize the [Google Cloud SDK](https://cloud.google.com/sdk/install)
3. Create an APP Engine app in yout project. [Why?](https://cloud.google.com/scheduler/docs/setup)
4. Enable the Cloud Functions API, the Cloud Scheduler API and the APP Engine API
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

Before continue, is prefereable to set up some environment variables that will help you executing the **gcloud** commands smoothly.

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

### 4. Deploy the Cloud Function

```sh
gcloud functions deploy $FUNCTION_NAME --trigger-topic $TOPIC_NAME --runtime nodejs10 --set-env-vars OPEN_WEATHER_MAP_API_KEY=$OPEN_WEATHER_MAP_API_KEY,BQ_DATASET=$BQ_DATASET,BQ_TABLE=$BQ_TABLE
```

### 5. Create a BigQuery dataset

```sh
bq mk $BQ_DATASET
```

### 6. Create a BigQuery table

```sh
bq mk --table $PROJECT_ID:$BQ_DATASET.$BQ_TABLE
```

---

## Further readings

* [Background Functions](https://cloud.google.com/functions/docs/writing/background)
* [Writing Cloud Functions](https://cloud.google.com/functions/docs/writing/)
* [Deploying from Your Local Machine](https://cloud.google.com/functions/docs/deploying/filesystem)
* [Using Pub/Sub to trigger a Cloud Function](https://cloud.google.com/scheduler/docs/tut-pub-sub)
* [Creating datasets](https://cloud.google.com/bigquery/docs/datasets)

## Contributors

**[Jose Valdebenito](https://github.com/jovald)**
