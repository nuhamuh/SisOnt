import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    conn = psycopg2.connect(
        host="localhost",
        database="sisont",
        user="postgres",
        password="jujihoon"
    )
    return conn 