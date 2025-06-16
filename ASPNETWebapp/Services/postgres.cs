using Npgsql;
using System.Data;
using Dapper;

namespace MyProject.Services
{
    public static class DatabaseConnector
    {
        private const string ConnectionString = "Host=db;Port=5432;Database=web_app;Username=admin;Password=admin";

        public static IDbConnection Connect()
        {
            try
            {
                var connection = new NpgsqlConnection(ConnectionString);
                connection.Open();
                Console.WriteLine("Conectado a la base de datos PostgreSQL");
                return connection;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error de conexión: " + ex.Message);
                return null;
            }
        }

        public static IEnumerable<dynamic> Query(string sql, object parameters = null)
        {
            using var connection = Connect();
            if (connection == null) return Enumerable.Empty<dynamic>();
            return connection.Query(sql, parameters);
        }

        public static int Execute(string sql, object parameters = null)
        {
            using var connection = Connect();
            if (connection == null) return 0;
            return connection.Execute(sql, parameters);
        }
    }
}
