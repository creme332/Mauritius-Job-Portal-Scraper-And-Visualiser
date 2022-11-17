#!venv/bin/python3
"""This module is responsible for managing the Firestore database which
contains all scraped jobs' data.
"""
import firebase_admin
from firebase_admin import firestore
from firebase_admin import credentials
import pandas as pd

cred = credentials.Certificate('src/serviceAccount.json')
app = firebase_admin.initialize_app(cred)
db = firestore.client()
job_collection = db.collection(u'jobs')


def uploadJob(jobDictionary):
    """Takes as argument a single python dictionary and uploads
    it to my Firestore database.

    Args:
        jobDictionary (dictionary): A dictionary with the following keys :
        `job_title`, `date_posted`, `closing_date`, `url`, `location`,
        `employment_type`, `company`, `salary`, `job_details`
    """
    update_time, job_ref = job_collection.add(jobDictionary)
    # print(f'Added document with id {job_ref.id} at: {update_time}')


def getAsDataframe():
    """Returns my Firestore database as a panda dataframe

    Returns:
        dataframe: A 2D panda dataframe
    """

    # data_source_filename = 'data/RawScrapedData.csv'  # raw data
    # df = pd.read_csv(data_source_filename, header=0)
    # print(len(df))

    jobs = job_collection.stream()
    jobs_dict = list(map(lambda x: x.to_dict(), jobs))
    df = pd.DataFrame(jobs_dict)

    if (len(df) > 0):
        # drop duplicates if any
        df.drop_duplicates(subset=None, keep='first', inplace=False)

        # parse dates and sort df
        df['date_posted'] = pd.to_datetime(
            df['date_posted'], format="%d/%m/%Y")
        df['closing_date'] = pd.to_datetime(
            df['closing_date'], format="%d/%m/%Y")
        df.sort_values('date_posted', ascending=False, inplace=True)

    return df
