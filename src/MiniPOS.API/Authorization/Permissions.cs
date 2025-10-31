namespace MiniPOS.API.Authorization
{
    public static class Permissions
    {
        public static class Categories
        {
            public const string View = "Categories.View";
            public const string Create = "Categories.Create";
            public const string Update = "Categories.Update";
            public const string Delete = "Categories.Delete";
        }

        public static class Services
        {
            public const string View = "Services.View";
            public const string Create = "Services.Create";
            public const string Update = "Services.Update";
            public const string Delete = "Services.Delete";
        }

        public static class Users
        {
            public const string View = "Users.View";
            public const string Create = "Users.Create";
            public const string Update = "Users.Update";
            public const string Delete = "Users.Delete";
        }

        public static class Roles
        {
            public const string View = "Roles.View";
            public const string Create = "Roles.Create";
            public const string Update = "Roles.Update";
            public const string Delete = "Roles.Delete";
        }

        public static class Shops
        {
            public const string View = "Shops.View";
            // navbar admin
            public const string ViewPage = "Shops.ViewPage";
            public const string Create = "Shops.Create";
            public const string Update = "Shops.Update";
            public const string Delete = "Shops.Delete";
        }

        public static IEnumerable<string> GetAllPermissions()
        {
            return new[]
            {
                Categories.View,
                Categories.Create,
                Categories.Update,
                Categories.Delete,

                Services.View,
                Services.Create,
                Services.Update,
                Services.Delete,

                Users.View,
                Users.Create,
                Users.Update,
                Users.Delete,

                Roles.View,
                Roles.Create,
                Roles.Update,
                Roles.Delete,

                Shops.View,
                Shops.Create,
                Shops.Update,
                Shops.Delete,
                Shops.ViewPage
            };
        }
    }
}