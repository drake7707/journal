using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;

using Dapper;
using System.Reflection;
using Microsoft.Data.Sqlite;

namespace Journal.Domain
{
    public static class Extensions
    {
        public static void CreateIndex<T>(this SqliteConnection c, Expression<Func<T, object>> prop)
        {
            c.Execute(string.Format(@"CREATE INDEX [IX_{1}_{0}] ON [{1}] ([{0}])",
                prop.ToProperty().Name,
                typeof(T).Name));
        }

        public static void AddColumn<T>(this SqliteConnection c, Expression<Func<T, object>> prop)
        {
            var colName = prop.ToProperty().Name;
            // check if the column wasn't already added by CreateTable in a previous migration
            var tableData = c.Query($"PRAGMA table_info({typeof(T).Name})");
            if (!tableData.Any(col => col.name == colName))
            {
                c.Execute(string.Format(@"ALTER TABLE {0} ADD {1} {2} DEFAULT {3}",
                    typeof(T).Name,
                    colName,
                    GetDBType(prop.ToProperty()),
                    GetDefault(prop.ToProperty().PropertyType)));
            }

        }



        public static void CreateTable<T>(this SqliteConnection c)
        {
            string query = @"CREATE TABLE " + typeof(T).Name + " (" +

                        string.Join(",", typeof(T).GetProperties().Where(p => p.CanRead && p.CanWrite).Select(p =>
                        {
                            string part = "[" + p.Name + "] ";

                            if (p.GetCustomAttributes(typeof(KeyAttribute), true).Count() > 0)
                                part += "INTEGER PRIMARY KEY AUTOINCREMENT";
                            else
                            {
                                part += GetDBType(p) + " DEFAULT " + GetDefault(p.PropertyType);
                            }

                            return part;
                        }))

                    + ")";
            c.Execute(query);
        }

        private static object GetDefault(Type type)
        {
            if (Nullable.GetUnderlyingType(type) != null)
                type = Nullable.GetUnderlyingType(type);

            if (type == typeof(string))
                return "''";
            else if (type == typeof(int) || type.GetTypeInfo().IsEnum)
                return "0";
            else if (type == typeof(DateTime))
                return "'0001-01-01'";
            else if (type == typeof(Guid))
                return "''";
            else if (type == typeof(double))
                return "0";
            else if (type == typeof(float))
                return "0";
            else if (type == typeof(bool))
                return "0";
            else if (type.IsArray && type.GetElementType() == typeof(byte))
                return "NULL";
            else
                return "''";
        }

        private static string GetDBType(PropertyInfo prop)
        {
            var type = prop.PropertyType;

            if (Nullable.GetUnderlyingType(type) != null)
                type = Nullable.GetUnderlyingType(type);

            if (type == typeof(string))
            {
                if (type.GetCustomAttributes<Domain.LongTextAttribute>().Count() > 0)
                    return "text";
                else
                    return "varchar(255)";
            }
            else if (type == typeof(int) || type.GetTypeInfo().IsEnum)
                return "int";
            else if (type == typeof(DateTime))
                return "datetime";
            else if (type == typeof(Guid))
                return "char(36)";
            else if (type == typeof(double))
                return "double";
            else if (type == typeof(float))
                return "float";
            else if (type == typeof(bool))
                return "bool";
            else if (type == typeof(decimal))
                return "money";
            else if (type.IsArray && type.GetElementType() == typeof(byte))
                return "blob";
            else
                return "varchar(255)";
        }
    }

    public static class PropertyHelper
    {
        public static PropertyInfo GetProperty<T>(Expression<Func<T, object>> sel)
        {
            return GetProperty<T, object>(sel);
        }

        public static PropertyInfo ToProperty<T, TResult>(this Expression<Func<T, TResult>> sel)
        {
            return GetProperty<T, TResult>(sel);
        }


        internal static PropertyInfo[] GetProperties<T>(this Type t, Expression<Func<T, object>>[] selectors)
        {
            return (from sel in selectors
                    select GetProperty<T, object>(sel)).ToArray();
        }

        private static PropertyInfo GetProperty<T, TValue>(Expression<Func<T, TValue>> selector)
        {
            return PropertyHelper<T>.GetProperty(selector);
        }
    }

    internal static class PropertyHelper<T>
    {

        public static PropertyInfo GetProperty<TValue>(
            Expression<Func<T, TValue>> selector)
        {
            Expression body = selector;
            if (body is LambdaExpression)
            {
                body = ((LambdaExpression)body).Body;
            }

            if (body is UnaryExpression)
            {
                body = ((UnaryExpression)body).Operand;
            }
            switch (body.NodeType)
            {
                case ExpressionType.MemberAccess:
                    return (PropertyInfo)((MemberExpression)body).Member;


                default:
                    throw new InvalidOperationException();
            }
        }

    }

}