var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(80);
});

builder.Services.AddControllers(); // Añadir soporte para controladores al build

var app = builder.Build();

// Redirecciones personalizadas para rutas sin extensión y con parámetros
app.Use(async (context, next) =>
{
    var path = context.Request.Path.Value?.ToLower();

    // Rutas sin extensión que deben cargar un HTML específico
    var staticRoutes = new[] { "/admin", "/blog", "/index", "/login", "/profile", "/register" };
    if (staticRoutes.Contains(path))
    {
        context.Response.Redirect($"{path}.html");
        return;
    }

    // Rutas tipo /blog-details/2 deben redirigir a blog-details.html
    if (path != null && path.StartsWith("/blog/"))
    {
        context.Request.Path = "/blog-details.html";
    }

    await next();
});

// Configuración para servir archivos estáticos desde wwwroot
app.UseDefaultFiles(); // Busca index.html por defecto en "/"
app.UseStaticFiles();  // Sirve los archivos como login.html, etc.

app.MapControllers(); // Necesario para que los controladores funcionen(la API)

app.Run();
