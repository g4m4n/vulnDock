import mysql.connector 
from mysql.connector import Error

# Configuración de la base de datos
def connect_db():
    try:
        connection = mysql.connector.connect(
            host='db',
            user='app_user',
            password='app_password',
            database='web_app'
        )
        if connection.is_connected():
            print('Conectado a la base de datos')
            return connection
    except Error as e:
        print(f'Error de conexión: {e}')
        return None

def close_connection(connection):
    if connection.is_connected():
        connection.close()
        print('Conexión cerrada')

def query_db(query, params=None):
    connection = connect_db()
    if connection:
        cursor = connection.cursor(dictionary=True)
        try:
            cursor.execute(query, params)
            result = cursor.fetchall()
            connection.commit()
            return result
        except Error as e:
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
