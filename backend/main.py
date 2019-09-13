#!/usr/bin/env python3
import json

from bson import json_util
import pandas as pd
from flask import Flask
from flask import jsonify
from flask import request

from flask_restplus import Resource, Api
from flask_restplus import fields
from flask_restplus import inputs
from flask_restplus import reqparse
from datetime import datetime


app = Flask(__name__)
api = Api(app,
          default="Divvy Dataset",  # Default namespace
          title="Divvy",  # Documentation Title
          description="This is just a simple example to show how publish data as a service.")  # Documentation Description

rate_per_min = 0.10


@api.route('/group/<int:from_station>')
@api.param('from_station', 'The from station id')
class Stations(Resource):
    @api.response(404, 'Station not found')
    @api.response(200, 'Successful')
    def get(self, from_station):
        # If key not found, return 404
        try:
            # groupby 'from_station_id
            grouped = df.groupby('from_station_id')
            # derivations from the previous group to find the answers to tasks
            from_station_id = grouped.get_group(from_station)
            comm_dest = from_station_id['to_station_name'].value_counts()
            comm_age = from_station_id['age_group'].value_counts()
            # plot data points
            td_vs_st_time = from_station_id[['start_time', 'tripduration']]
            total_revenue = from_station_id['tripduration'].astype(
                float).sum() / 60.0
            data = []
            # append the data points
            for _, rows in td_vs_st_time.iterrows():
                data.append({
                    "start_time": rows.start_time,
                    "tripduration": rows.tripduration
                })
            # Form the json to be sent
            data_sent = {
                "common_destination": comm_dest.idxmax(),
                "prev_age_group": comm_age.idxmax(),
                "total_revenue": round(total_revenue, 2),
                "data_points": data
            }
            return json.loads(json_util.dumps(data_sent)), 200
        except KeyError:
            return "Invalid station id supplied", 404


@api.route('/top_three')
class TopRevenueStations(Resource):
    @api.response(200, 'Successful')
    def get(self):
        grouped = df.groupby('from_station_id')
        # derivation from the from_station_id to form the aggregates and sorting the values
        ssed = grouped['tripduration'].sum().reset_index(
            name='Total Amount').sort_values(['Total Amount'], ascending=False)
        # Initialize the data
        data_sent = {"data": []}
        data = []
        # Formulate the data
        for _, row in ssed.head(3).iterrows():
            data.append({
                # To find the revenue, the tripduration will be converted to minutes
                # and the multiplied by the rate per minute of usage
                'total_amount': round(row['Total Amount'] * rate_per_min / 60.0, 2),
                'from_station_name': df_unique[df_unique['from_station_id'] == row['from_station_id']]['from_station_name'].values[0]}
            )
        data_sent["data"] = data
        # Send the data
        return json.loads(json_util.dumps(data_sent)), 200


@api.route('/bike_repairs')
class BikeRepairs(Resource):
    @api.response(200, 'Successful')
    def get(self):
        # Group by bikeid
        grouped = df.groupby('bikeid')
        # Sum the values produced from the grouping
        ssed = grouped['tripduration'].sum().reset_index(name='total')
        # Per minute
        ssed['total'] = ssed['total'] / 60.0
        # Check if greater than 1000
        ssed = ssed[ssed['total'] > 1000]
        bike_repairs = {"bike_repairs_needed": list(ssed['bikeid'])}
        return json.loads(json_util.dumps(bike_repairs)), 200


if __name__ == '__main__':
    # Reading the csv file and placing it into a Pandas dataframe
    csv_file = "dataset.csv"

    # Read the csv file
    df = pd.read_csv("./" + csv_file)

    # Create a new dataframe with unique columns for station names and station ids
    df_unique = df.drop_duplicates(
        subset=['from_station_id', 'from_station_name'])
    df_unique = df_unique[['from_station_id', 'from_station_name']]
    df_unique = df_unique.reset_index(drop=True)

    # Create a json file if needed
    # with open('./frontend/file.json', 'w') as f:
    #     json.dump(df_unique.to_json(r'./frontend/file.json',
    #                                 orient="records"), f)

    # Dropping rows with empty values
    df.dropna(inplace=True)

    # Convert the tripduration column into float type
    df['tripduration'] = df['tripduration'].replace(
        {',': ''}, regex=True).astype(float)

    # Get the current year
    now = datetime.now()

    # Add a new column, age to the dataframe
    df['age'] = now.year - df['birthyear']

    # Separate the ages into groups
    df['age_group'] = pd.cut(df['age'], [0, 15, 30, 45, 200], labels=[
        '0-15', '16-30', '31-45', '46+'])
    app.run(debug=True)
