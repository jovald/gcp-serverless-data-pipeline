const utils = require("./utils");

const axios = require("axios");
const moment = require("moment");
const path = require("path");
const os = require("os");
const fs = require("fs").promises;
const { BigQuery } = require("@google-cloud/bigquery");

// Instantiate BigQuery client.
const bigquery = new BigQuery();

/**
 * Background Cloud Function to be triggered by Pub/Sub.
 * This function is exported by index.js, and executed when
 * the trigger topic receives a message.
 *
 * @param {object} pubSubEvent The event payload.
 * @param {object} context The event metadata.
 */
exports.loadDataIntoBigQuery = async () => {
  /*
   * Define a temporal file to load the data into BigQuery.
   * Consider that a "more correct" form consist of loading the JSON file from GCS.
   */
  const tempLocalFile = path.join(os.tmpdir(), "tmpData.json");

  // Env variables.
  const openWeatherMapApiKey = process.env.OPEN_WEATHER_MAP_API_KEY;
  const bigQueryDatasetId = process.env.BQ_DATASET;
  const bigQueryTableId = process.env.BQ_TABLE;
  const bigQueryJobMetadata = {
    writeDisposition: "WRITE_APPEND",
    autodetect: true
  };

  try {

    // Get current weather data from OpenWeatherMap. The data is for Santiago, Chile
    const { data } = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=Santiago,cl&APPID=${openWeatherMapApiKey}`
    );

    // It's not necessary this key value pair.
    delete data.weather;

    // Flatten the json and add a timestamp to know the process time.
    const cleanedData = JSON.stringify(
      utils.flatten({ ...data, timestamp: moment().format("YYYY-MM-DD HH:mm:ss") })
    );

    // Just a temp writing to load the data
    await fs.writeFile(tempLocalFile, cleanedData);

    // Load data into BigQuery
    const [job] = await bigquery
      .dataset(bigQueryDatasetId)
      .table(bigQueryTableId)
      .load(tempLocalFile, bigQueryJobMetadata);

    // Check the job's status for errors.
    const errors = job.status.errors;
    if (errors && errors.length > 0) {
      throw errors;
    } else {
      console.log(`Job ${job.id} completed successfully.`);
    }
  } catch (error) {
    // More sophisticated pipelines should consider error handling on insert failures.
    console.log("ERROR: ", error);
  } finally {
    // Exists or not an error, it's mandatory to delete the temporary file.
    await fs.unlink(tempLocalFile);
    console.log("Temporary file deleted");
  }
};
