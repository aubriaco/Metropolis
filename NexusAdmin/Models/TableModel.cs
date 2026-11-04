/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using MarketplaceData;
using Newtonsoft.Json;
using Npgsql;
using System.Collections.Generic;
using System.Globalization;
using System.Reflection;
using Ubriaco.Attributes;
using Ubriaco.Models;
using Ubriaco.Toolkit;

namespace NexusAdmin.Models
{
    public class TableModel<T> where T : BaseModel
    {
        public const int Limit = 30;

        public string? Name { get; set; }

        public List<ModelVarInfo>? Columns { get; set; }

        public List<T>? Data { get; set; }

        public static bool IsValidSort(Type type, string sortBy)
        {
            sortBy = sortBy.ToLower();
            foreach(var prop in type.GetProperties())
            {
                if (prop.Name.ToLower() == sortBy)
                    return true;
            }
            return false;
        }

        public static Type? GetModelTypeByName(string name)
        {
            foreach (var assembly in AppDomain.CurrentDomain.GetAssemblies())
            {
                var types = assembly.GetTypes().Where(t => t.IsDefined(typeof(Table), true));
                foreach (var t in types)
                {
                    var att = t.GetCustomAttribute<Table>();
                    if (att == null)
                        continue;
                    if (t.Name == name)
                    {
                        return t;
                    }
                }
            }
            return null;
        }

        public static TableModel<T>? Get(Database db, Type t, long id = 0, int page = 1, string? sortBy = null, bool sortDesc = false, bool newItem = false)
        {
            var att = t.GetCustomAttribute<Table>();
            if (att == null)
                return null;
            var item = new TableModel<T>() { Name = t.Name };
            var model = (BaseModel?)Activator.CreateInstance(t);
            if (model == null)
                throw new Exception("Failed to instance model.");
            var cols = model.GetModelInfo().Variables;
            if (cols == null)
                throw new Exception("Failed to find columns.");
            item.Columns = new List<ModelVarInfo>();
            var idCol = cols.First(i => i.Name == "ID");
            item.Columns.Add(new ModelVarInfo() { Name = "id", Title = "ID" });
            
            foreach (var i in cols)
            {
                if (i.Name == null || IsSensitiveProperty(i.Name) || i.Name == "ID" || i.Name == "MasterID")
                    continue;
                var ml = t.GetProperty(i.Name).GetCustomAttribute<ModelLocal>();
                if (ml != null) // temp for objects
                    continue;
                i.Name = FormUtil.ToCamelCase(i.Name);
                item.Columns.Add(i);
            }
            if (!newItem)
            {
                if (sortBy == null || IsValidSort(t, sortBy))
                    item.Data = GetData(db, t, att.Name, id, page, sortBy, sortDesc);
            }
            return item;
                    
        }

        public static List<T> GetData(Database db, Type type, string table, long id = 0, int page = 1, string? sortBy = null, bool sortDesc = false)
        {
            var list = new List<T>();
            using (var cmd = new NpgsqlCommand(@"SELECT * FROM " + table + " " + (id == 0 ? "" : " WHERE id=" + id + " ") + " " + (sortBy == null ? "" : " ORDER BY " + sortBy + (sortDesc ? " DESC " : " ASC  ")) + (id == 0 ? " LIMIT " + Limit + " OFFSET " + ((page - 1) * Limit) : " LIMIT 1"), db.C))
            {
                using(var r = cmd.ExecuteReader())
                {
                    while(r.Read())
                    {
                        var item = (T?)Activator.CreateInstance(type);
                        if (item == null)
                            throw new Exception("Failed to instance model.");
                        item.Populate(r);
                        SetSensitivePropertiesToNull(item);
                        list.Add(item);
                    }
                }
            }
            return list;
        }

        public static bool IsSensitiveProperty(string propName)
        {
            if (propName.ToLower().Contains("password"))
                return true;
            return false;
        }

        public static void SetSensitivePropertiesToNull(T item)
        {
            foreach(var prop in item.GetType().GetProperties())
            {
                if(prop.CanRead && prop.CanWrite)
                {
                    if (IsSensitiveProperty(prop.Name))
                        prop.SetValue(item, null);
                }
            }
        }

        public static List<TableModel<T>> GetList()
        {
            var list = new List<TableModel<T>>();
            var assemblies = AppDomain.CurrentDomain.GetAssemblies();

            foreach (var assembly in assemblies)
            {
                var types = assembly.GetTypes().Where(t => t.IsDefined(typeof(Table), true));
                foreach (var t in types)
                {
                    var att = t.GetCustomAttribute<Table>();
                    if(att == null)
                        continue;
                    var item = new TableModel<T>() { Name = t.Name };
                    list.Add(item);
                }
            }

            return list;
        }
    }
}
