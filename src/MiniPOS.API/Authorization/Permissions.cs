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

        public static class Stores
        {
            public const string View = "Stores.View";
            public const string Create = "Stores.Create";
            public const string Update = "Stores.Update";
            public const string Delete = "Stores.Delete";
        }

        public static class Users
        {
            public const string View = "Users.View";
            public const string Create = "Users.Create";
            public const string Update = "Users.Update";
            public const string Delete = "Users.Delete";
        }

        public static IEnumerable<string> GetAllPermissions()
        {
            return new[]
            {
                Categories.View,
                Categories.Create,
                Categories.Update,
                Categories.Delete,
                
                Stores.View,
                Stores.Create,
                Stores.Update,
                Stores.Delete,
                
                Users.View,
                Users.Create,
                Users.Update,
                Users.Delete
            };
        }
    }
}