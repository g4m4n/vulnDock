import pyodbc

def connect_db():
    try:
        connection = pyodbc.connect(
            'DRIVER={ODBC Driver 17 for SQL Server};'
            'SERVER=db;DATABASE=web_app;UID=sa;PWD=YourStrong!Passw0rd'
        )
        print('Conectado a la base de datos (SQL Server)')
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
        cursor = connection.cursor()
        try:
            cursor.execute(query, params or ())
            if query.strip().lower().startswith("select"):
                columns = [column[0] for column in cursor.description]
                result = [dict(zip(columns, row)) for row in cursor.fetchall()]
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
        VALUES (?, ?, ?, ?, ?, ?)
    """
    params = (username, firstname, lastname, email, password, avatar)
    return query_db(query, params)

def get_user_by_username(username):
    query = "SELECT * FROM users WHERE username = ?"
    return query_db(query, (username,))
