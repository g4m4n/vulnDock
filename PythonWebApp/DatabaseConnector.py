import psycopg2
from psycopg2.extras import RealDictCursor

def connect_db():
    try:
        connection = psycopg2.connect(
            host='db',
            user='admin',
            password='admin',
            dbname='web_app'
        )
        print('Conectado a la base de datos (PostgreSQL)')
        return connection
    except Exception as e:
        print(f'Error de conexión: {e}')
        return None

def close_connection(connection):
    connection.close()
    print('Conexión cerrada')

def query_db(query, params=None):
    connection = connect_db()
    if connection:
        cursor = connection.cursor(cursor_factory=RealDictCursor)
        try:
            cursor.execute(query, params)
            if query.strip().lower().startswith("select"):
                result = cursor.fetchall()
            else:
                result = {'affected_rows': cursor.rowcount}
            connection.commit()
            return result
        except Exception as e:
            print(f'Error en la consulta: {e}')
            return None
        finally:
            cursor.close()
            close_connection(connection)

def insert_user(username, firstname, lastname, email, password, avatar):
    query = """
        INSERT INTO users (username, firstname, lastname, email, password, avatar)
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    params = (username, firstname, lastname, email, password, avatar)
    return query_db(query, params)

def get_user_by_username(username):
    query = "SELECT * FROM users WHERE username = %s"
    return query_db(query, (username,))
