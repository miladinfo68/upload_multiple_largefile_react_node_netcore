using Microsoft.AspNetCore.Server.Kestrel.Core;

const string CLIENT_URL = "http://localhost:4000";
var builder = WebApplication.CreateBuilder(args);

builder.WebHost.UseKestrel(options =>
{
    options.Limits.MaxRequestBodySize = null;

    //options.ListenAnyIP(4000);
    //options.ListenAnyIP(4001, listenOptions => listenOptions.UseHttps());
});

builder.Services.Configure<KestrelServerOptions>(options =>
{
    options.Limits.MaxRequestBodySize = null; // if don't set default value is: 30 MB
});

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(p => p.AddPolicy("corsapp", builder =>
{
    builder.WithOrigins("*").AllowAnyMethod().AllowAnyHeader();
}));

//builder.Services.AddCors(c =>
//{
//    c.AddPolicy("AllowOrigin", options => options.WithOrigins(CLIENT_URL));
//});


var app = builder.Build();


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("corsapp");
//app.UseCors(options => options.WithOrigins(CLIENT_URL));

app.UseAuthorization();

app.MapControllers();


app.Run();
