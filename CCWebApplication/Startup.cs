using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(CCWebApplication.Startup))]
namespace CCWebApplication
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
