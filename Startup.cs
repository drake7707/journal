using System;
using System.Linq;
using Journal.Domain;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Journal
{
    public class Startup
    {

        private WebSocketManager webSocketManager = new WebSocketManager();

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            string databasePath = GetEnvOrDefault("DATABASE_PATH", "data.db");
            string storagePath = GetEnvOrDefault("STORAGE_PATH", "entries");

            DALManager dalManager = new DALManager(databasePath, storagePath);
            services.AddSingleton(dalManager);

            services.AddSingleton(webSocketManager);

            services.AddControllersWithViews();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
            }
            app.UseStaticFiles();

            app.UseRouting();

            app.UseAuthorization();

            app.UseWebSockets();
            webSocketManager.SetupWebsockets(app);

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller=Home}/{action=Index}/{id?}");
            });
        }
        public T GetEnvOrDefault<T>(string key, T defaultValue)
        {
            string val = Environment.GetEnvironmentVariable(key);
            if (val == null)
                return defaultValue;
            else
                return (T)Convert.ChangeType(val, typeof(T));
        }
    }
}
