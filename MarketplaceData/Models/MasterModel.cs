/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using MarketplaceData.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using Ubriaco.Attributes;
using Ubriaco.Data;
using Ubriaco.Models;

namespace MarketplaceData.Models
{
    public class MasterModel : BaseModel
    {
        public string MasterID { get; set; } = Guid.NewGuid().ToString();

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public bool ValidateBlanks()
        {
            var props = this.GetType().GetProperties();
            foreach(var prop in props)
            {                
                var att = prop.GetCustomAttribute<RequiredProp>();
                if (att == null)
                    continue;
                if(prop.PropertyType == typeof(string))
                {
                    if (string.IsNullOrWhiteSpace((string?)prop.GetValue(this)))
                        return false;
                }
                else
                {
                    if (prop.GetValue(this) == null)
                        return false;
                }
            }
            return true;
        }

        public override void EmptyNonEditable()
        {
            base.EmptyNonEditable();
            MasterID = Guid.NewGuid().ToString();
            CreatedDate = DateTime.UtcNow;
        }

        public static T? GetFromID<T>(Database db, long id) where T : MasterModel
        {
            var masterModel = Activator.CreateInstance<T>();
            masterModel.ID = id;
            if (masterModel.Select(db, "ID"))
                return masterModel;
            return null;
        }

        public static T? GetFromMasterID<T>(Database db, string masterId) where T : MasterModel
        {
            var masterModel = Activator.CreateInstance<T>();
            masterModel.MasterID = masterId;
            if(masterModel.Select(db, "MasterID"))
                return masterModel;
            return null;
        }

        public T GetView<T>()
        {
            var viewModel = Activator.CreateInstance<T>();
            if (viewModel == null)
                throw new Exception("View model is null.");
            var props = viewModel.GetType().GetProperties();
            foreach(var prop in props)
            {
                if(prop.CanWrite)
                    prop.SetValue(viewModel, prop.GetValue(this));
            }
            return viewModel;
        }

        public T GetPublic<T>() where T : MasterModel
        {
            var viewModel = Activator.CreateInstance<T>();
            if (viewModel == null)
                throw new Exception("View model is null.");
            var props = viewModel.GetType().GetProperties();
            foreach (var prop in props)
            {
                if (prop.CanWrite && prop.CanRead && (prop.GetCustomAttribute<PublicProp>() != null) || prop.Name == "ID")
                    prop.SetValue(viewModel, prop.GetValue(this));
            }
            return viewModel;
        }

        public static List<T> GetPublicList<T>(List<T> inputList) where T : MasterModel
        {
            var list = new List<T>();
            foreach(var i in inputList)
            {
                list.Add(i.GetPublic<T>());
            }
            return list;
        }

        public List<string> GetEditableProperties()
        {
            var list = new List<string>();
            var props = GetType().GetProperties();
            foreach (var prop in props)
            {
                if (prop.Name != "ID" && prop.GetCustomAttribute<ColEditable>() != null)
                    list.Add(prop.Name);
            }
            return list;
        }

        public virtual long Save(Database db)
        {
            if (ID == 0)
                ID = Insert(db);
            else
                Update(db, GetEditableProperties());
            return ID;
        }
        public virtual async Task<long> SaveAsync(Database db)
        {
            if (ID == 0)
                ID = await InsertAsync(db);
            else
                await UpdateAsync(db, string.Join(',',GetEditableProperties()));
            return ID;
        }

        public static async Task<T?> GetFromIDAsync<T>(Database db, long id) where T : MasterModel
        {
            var masterModel = Activator.CreateInstance<T>();
            masterModel.ID = id;
            if (await masterModel.SelectAsync(db, "ID"))
                return masterModel;
            return null;
        }

        public static async Task<T?> GetFromMasterIDAsync<T>(Database db, string masterId) where T : MasterModel
        {
            var masterModel = Activator.CreateInstance<T>();
            masterModel.MasterID = masterId;
            if(await masterModel.SelectAsync(db, "MasterID"))
                return masterModel;
            return null;
        }

        public long InsertIfNotPresent(BaseConnection db, string checkVars)
        {
            if (string.IsNullOrEmpty(checkVars))
                throw new Exception("InsertIfNotPresent: checkVars is null.");
            var p = checkVars.Split(',');
            var item = (MasterModel?)Activator.CreateInstance(GetType());
            if (item == null)
                throw new Exception("InsertIfNotPresent: Failed to create object instance.");
            if (!item.SelectID(db, checkVars))
                return Insert(db);
            return 0;
        }

        public override void CreateIndexes(BaseConnection db)
        {
            base.CreateIndexes(db);
            TryCreateIndex(db, "masterid", true);
            TryExecuteCommand(db, "ALTER TABLE " + GetDefaultTable() + " ALTER COLUMN createddate TYPE TIMESTAMP" + (SQLV >=6 ? " WITH TIME ZONE" : ""));
            InitialValues(db);
        }


        public virtual void InitialValues(BaseConnection db)
        {

        }

        public virtual async Task<long> TryInsertAsync(BaseConnection db)
        {
            try
            {
                return await InsertAsync(db);
            }
            catch(Exception ex)
            {
                Console.WriteLine("TryInsertAsync: " + ex.Message);
                return 0;
            }
        }
    }
}
