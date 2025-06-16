using Microsoft.Data.SqlClient;
using System.Data;
using Dapper;

namespace MyProject.Services
{
    public static class DatabaseConnector
    {
        private const string ConnectionString = "Server=db;Database=web_app;User Id=sa;Password=YourStrong!Passw0rd;TrustServerCertificate=true;Encrypt=true";

        public static IDbConnection Connect()
        {
            try
            {
                var connection = new SqlConnection(ConnectionString);
                connection.Open();
                Console.WriteLine("Conectado a la base de datos SQL Server");
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
