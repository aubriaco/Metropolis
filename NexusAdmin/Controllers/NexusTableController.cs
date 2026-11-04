/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Marketplace.Controllers;
using Marketplace.Models.Responses;
using MarketplaceData;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NexusAdmin.Models;
using NexusAdmin.Util;
using Ubriaco.Models;
using Ubriaco.Toolkit;

namespace NexusAdmin.Controllers
{
    [ApiController]
    [Route("api/nexus/table")]
    public class NexusTableController : BaseController
    {
        [HttpGet("list")]
        public IActionResult GetList()
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");
            if (!CurrentUser.IsAdmin)
                return BASE(1, "Not an admin.");

            using (var db = new Database())
            {
                return LIST(TableModel<BaseModel>.GetList());
            }
        }

        [HttpGet("data")]
        public IActionResult GetData([FromQuery] string name, [FromQuery] int? page, [FromQuery] string? search, [FromQuery] string? sortBy, [FromQuery] string? sortOrd)
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");
            if (!CurrentUser.IsAdmin)
                return BASE(1, "Not an admin.");

            using (var db = new Database())
            {
                var type = TableModel<BaseModel>.GetModelTypeByName(name);
                if (type == null)
                    return BASE(2, "Table not found.");

                var item = TableModel<BaseModel>.Get(db, type, 0, page ?? 1, sortBy, sortOrd == "DESC");

                if (item == null)
                    return BASE(3, "Table not found.");
                return Content(JsonConvert.SerializeObject(new ItemResponse(item), JsonSettings.Settings), "application/json");
            }
        }

        [HttpGet("item")]
        public IActionResult GetItem([FromQuery] string name, [FromQuery] long id)
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");
            if (!CurrentUser.IsAdmin)
                return BASE(1, "Not an admin.");

            using (var db = new Database())
            {
                var type = TableModel<BaseModel>.GetModelTypeByName(name);
                if (type == null)
                    return BASE(2, "Table not found.");

                var item = TableModel<BaseModel>.Get(db, type, id, 1, null, false, id == 0);

                if (item == null)
                    return BASE(3, "Table not found.");

                if (id == 0)
                    return Content(JsonConvert.SerializeObject(new ItemResponse(item), JsonSettings.Settings), "application/json");

                if (item.Data == null)
                    return BASE(3, "Data not found.");

                if (item.Data.Count == 0)
                    return BASE(3, "No data found.");

                return Content(JsonConvert.SerializeObject(new ItemResponse(item), JsonSettings.Settings), "application/json");
            }
        }

        [HttpPost("save")]
        public async Task<IActionResult> SaveItem([FromQuery] string name)
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");
            if (!CurrentUser.IsAdmin)
                return BASE(1, "Not an admin.");

            using (var db = new Database())
            {
                string body;
                using (var sr = new StreamReader(Request.Body))
                {
                    body = await sr.ReadToEndAsync();
                }

                JObject? o = (JObject?)JsonConvert.DeserializeObject(body);
                if (o == null)
                    return BASE(2, "Input data is invalid.");

                var type = TableModel<BaseModel>.GetModelTypeByName(name);

                if (type == null)
                    return BASE(2, "Table not found.");

                var item = (BaseModel?)Activator.CreateInstance(type);

                if (item == null)
                    return BASE(3, "No data found.");

                var update = new List<string>();

                foreach (var prop in type.GetProperties())
                {
                    try
                    {
                        if (!prop.CanWrite || TableModel<BaseModel>.IsSensitiveProperty(prop.Name))
                            continue;
                        var t = prop.PropertyType;

                        if (o[FormUtil.ToCamelCase(prop.Name)] == null)
                            prop.SetValue(item, null);
                        else
                        {
                            if (t == typeof(string)) prop.SetValue(item, (string)o[FormUtil.ToCamelCase(prop.Name)]);
                            if (t == typeof(int)) prop.SetValue(item, Convert.ToInt32(o[FormUtil.ToCamelCase(prop.Name)]));
                            if (t == typeof(long)) prop.SetValue(item, Convert.ToInt64(o[FormUtil.ToCamelCase(prop.Name)]));
                            if (t == typeof(bool)) prop.SetValue(item, Convert.ToBoolean(o[FormUtil.ToCamelCase(prop.Name)]));
                            if (t == typeof(double) || t == typeof(float)) prop.SetValue(item, Convert.ToDouble(o[FormUtil.ToCamelCase(prop.Name)]));
                            if (t == typeof(decimal)) prop.SetValue(item, Convert.ToDecimal(o[FormUtil.ToCamelCase(prop.Name)]));
                            if (t == typeof(DateTime)) prop.SetValue(item, DateTime.Parse((string)o[FormUtil.ToCamelCase(prop.Name)]));
                            update.Add(prop.Name);
                        }
                    }
                    catch { }
                }

                try
                {
                    item.ID = (long)o["id"];
                }
                catch { }

                if (item.ID == 0)
                    item.ID = item.Insert(db);
                else
                    item.Update(db, update);

                return BASE();
            }
        }

        [HttpPost("delete")]
        public IActionResult DeleteItem([FromQuery] string name, [FromQuery] long id)
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");
            if (!CurrentUser.IsAdmin)
                return BASE(1, "Not an admin.");

            using (var db = new Database())
            {
                var type = TableModel<BaseModel>.GetModelTypeByName(name);
                if (type == null)
                    return BASE(2, "Table not found.");
                var item = TableModel<BaseModel>.Get(db, type, id, 1, null, false, id == 0);

                if (item == null)
                    return BASE(3, "Table not found.");
                if (item.Data == null)
                    return BASE(3, "Data not found.");
                if (item.Data.Count == 0)
                    return BASE(3, "No data found.");

                item.Data[0].DeleteFromId(db);
                
                return BASE();
            }
        }
    }
}
