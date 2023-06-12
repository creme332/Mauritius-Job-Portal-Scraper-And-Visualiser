import unittest
from src.analyser.database import db_check, db_count
from src.utils.dictionary import (get_true_keys, filter_dict)


class TestDatabaseCheck(unittest.TestCase):

    def test_uppercase(self):
        string = 'IBM DB2'
        self.assertEqual(get_true_keys(db_check(string)), ['IBM DB2'])

    def test_substrings(self):
        string = 'sql'
        self.assertCountEqual(get_true_keys(db_check(string)),
                              [])

    def test_postgres(self):
        string = 'postGReSQL'
        self.assertCountEqual(get_true_keys(db_check(string)),
                              ['PostgreSQL'])
        string = ('Sait utiliser les principales bases de'
                  ' données relationnelles (MySQL, Postgres)')
        self.assertCountEqual(get_true_keys(db_check(string)),
                              ['PostgreSQL', 'MySQL'])

    def test_all_databases(self):
        string = ('MySQL,PostgreSQL,SQLite,MongoDB,Microsoft SQL Server,'
                  'Redis,MariaDB,Firebase,Elasticsearch,Oracle,'
                  'DynamoDB,Cassandra,IBM DB2,Couchbase,NoSQL')
        expected = ['MySQL', 'PostgreSQL', 'SQLite', 'MongoDB',
                    'Microsoft SQL Server', 'Redis', 'MariaDB',
                    'Firebase', 'Elasticsearch', 'Oracle',
                    'DynamoDB', 'Cassandra', 'IBM DB2',
                    'Couchbase', 'NoSQL']
        self.assertCountEqual(get_true_keys(db_check(string)), expected)

    def test_oracle_corner_case(self):
        string = ('oracle cloud is good')
        expected = []
        print(get_true_keys(db_check(string)))
        self.assertCountEqual(get_true_keys(db_check(string)), expected)

        string = ('oracle cloud')
        expected = []
        self.assertCountEqual(get_true_keys(db_check(string)), expected)

        string = ('oracle')
        expected = []
        self.assertCountEqual(get_true_keys(db_check(string)), ['Oracle'])

    def test_real_job_details(self):
        string = 'expertise mysql/mariadb (database tuning, sql optimisation)'
        self.assertCountEqual(get_true_keys(
            db_check(string)), ['MySQL', 'MariaDB'])

    def test_db_count(self):
        List = ['mariadb', 'helpe das sql Mariadb', 'mysql']
        x = filter_dict(db_count(List))
        # print(x)
        self.assertCountEqual(x, {'MySQL': 1, 'MariaDB': 2})
