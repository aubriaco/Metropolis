/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using MarketplaceData;
using MarketplaceData.Models;
using MarketplaceData.Util;
using Marketplace.Util;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using Ubriaco.Attributes;
using Ubriaco.Models;

namespace Marketplace
{
    public class Updater
    {
        public static void Perform()
        {
            using (var db = new Database())
            {
                double nextVersion = 0;
                new Global().CreateTable(db);
                double version = Convert.ToDouble(db.GetGlobal("Version") ?? "0.000");

                SyncAllModels(db);

                nextVersion = 0.001;
                if (version < nextVersion)
                {                                       
                    db.TryExec(@"ALTER TABLE _user ADD createddate TIMESTAMP");
                    db.TryExec(@"ALTER TABLE _user ADD isadmin BOOLEAN NOT NULL DEFAULT false");
                    db.TryExec(@"ALTER TABLE _user ADD lastseendate TIMESTAMP");
                    db.TryExec(@"ALTER TABLE _user ALTER COLUMN addressid TYPE BIGINT");

                    db.TryExec(@"CREATE UNIQUE INDEX _user_username_idx ON _user (username)");
                    db.TryExec(@"CREATE UNIQUE INDEX _user_email_idx ON _user (email)");
                    db.TryExec(@"CREATE UNIQUE INDEX _user_masterid_idx ON _user (masterid)");
                    db.TryExec(@"CREATE INDEX _user_lname_idx ON _user ((lower(firstname || ' ' || lastname)))");

                    var user = new User()
                    {
                        Username = "aubriaco@solusek.com",
                        Email = "aubriaco@solusek.com",
                        Password = CryptUtil.HashPassword(Guid.NewGuid().ToString()),
                        FirstName = "Alessandro",
                        LastName = "Ubriaco",
                        Phone = "6176517938",
                        Address = new Address()
                        {
                            Line1 = "Urb. Beverly Hills Cam. Palma 33",
                            City = "Guaynabo",
                            State = "PR",
                            Country = "Puerto Rico",
                            PostalCode = "00926",
                        },
                        IsAdmin = true
                    };
                    if (!user.Select(db, "Email"))
                    {
                        user.ID = user.Insert(db);
                        if(Config.I != null && Config.I.BaseUrl != null)
                            MailUtil.SendPasswordReset(user, Config.I.BaseUrl);
                    }

                    user = new User() { Username = "aubriaco@coqui.market" };
                    if (user.Select(db, "Username"))
                        user.DeleteFromId(db);


                    //vendor
                    db.TryExec(@"ALTER TABLE vendor ADD createddate TIMESTAMP");
                    //db.TryExec(@"CREATE UNIQUE INDEX vendor_name_idx ON vendor (name)");
                    db.TryExec(@"CREATE UNIQUE INDEX vendor_masterid_idx ON vendor (masterid)");
                    db.TryExec(@"ALTER TABLE vendor ADD isactive BOOLEAN NOT NULL DEFAULT false");
                    db.TryExec(@"ALTER TABLE vendor ADD imageident VARCHAR(64)");
                    db.TryExec(@"ALTER TABLE vendor ALTER COLUMN addressid TYPE BIGINT");
                    db.TryExec(@"ALTER TABLE vendor ADD createdbyuserid BIGINT NOT NULL DEFAULT 0");
                    db.TryExec(@"ALTER TABLE vendor ADD createddate TIMESTAMP");
                    db.TryExec(@"ALTER TABLE vendor ADD isagreeterms BOOLEAN NOT NULL DEFAULT false");
                    db.TryExec(@"ALTER TABLE vendor ADD ident VARCHAR(128)");
                    db.TryExec(@"ALTER TABLE vendor ADD taxid VARCHAR(64)");
                    db.TryExec(@"ALTER TABLE vendor ADD taxtype VARCHAR(64)");
                    db.TryExec(@"CREATE UNIQUE INDEX vendor_ident_idx ON vendor (ident)");

                    // address
                    db.TryExec(@"ALTER TABLE address ADD createddate TIMESTAMP");
                    db.TryExec(@"CREATE UNIQUE INDEX address_masterid_idx ON address (masterid)");
                    
                    //storageitem
                    db.TryExec(@"ALTER TABLE storageitem ADD originalfilename VARCHAR(255)");
                    db.TryExec(@"ALTER TABLE storageitem ADD createddate TIMESTAMP");
                    db.TryExec(@"ALTER TABLE storageitem ADD isdeleted BOOLEAN NOT NULL DEFAULT false");
                    db.TryExec(@"CREATE UNIQUE INDEX storageitem_ident_idx ON storageitem (ident)");

                    //product
                    db.TryExec(@"ALTER TABLE product ADD createddate TIMESTAMP");
                    db.TryExec(@"ALTER TABLE product ADD vendorid BIGINT NOT NULL DEFAULT 0");
                    db.TryExec(@"ALTER TABLE product ADD weight DECIMAL");
                    db.TryExec(@"ALTER TABLE product ADD weightunit VARCHAR(16)");
                    db.TryExec(@"ALTER TABLE product ADD categoryid BIGINT NOT NULL DEFAULT 0");
                    db.TryExec(@"ALTER TABLE product ADD reviewcount BIGINT NOT NULL DEFAULT 0");
                    db.TryExec(@"ALTER TABLE product ADD rating DECIMAL(10,2)");
                    db.TryExec(@"ALTER TABLE product ADD shortdescription VARCHAR(255)");
                    db.TryExec(@"ALTER TABLE product ADD ident VARCHAR(128)");
                    db.TryExec(@"CREATE INDEX product_lname ON product ((lower(name)))");
                    db.TryExec(@"CREATE UNIQUE INDEX product_masterid_idx ON product (masterid)");
                    db.TryExec(@"CREATE UNIQUE INDEX product_ident_idx ON product (ident)");

                    //productimage
                    db.TryExec(@"ALTER TABLE productimage ADD orderindex INT NOT NULL DEFAULT 0");

                    //vendordocument
                    db.TryExec(@"ALTER TABLE vendordocument ADD createddate TIMESTAMP");
                    db.TryExec(@"CREATE UNIQUE INDEX vendordocument_masterid_idx ON vendordocument (masterid)");

                    //review
                    db.TryExec(@"ALTER TABLE review ALTER COLUMN userid TYPE BIGINT");
                    db.TryExec(@"ALTER TABLE review ALTER COLUMN productid TYPE BIGINT");

                    //address
                    db.TryExec(@"ALTER TABLE address ADD countryid BIGINT NOT NULL DEFAULT 0");

                    //newslettersub
                    db.TryExec(@"ALTER TABLE newslettersub ADD masterid VARCHAR(128)");
                    db.TryExec(@"CREATE UNIQUE INDEX newslettersub_masterid_idx ON newslettersub (masterid)");

                    var country = new Country()
                    {
                        Name = "Puerto Rico",
                        TaxPercent = 10.5M
                    };
                    if(!country.Select(db, "Name"))
                        country.Insert(db);

                    //db.SetGlobal("Version", nextVersion.ToString());
                }
            }
        }

        public static void SyncAllModels(Database db)
        {
            var ms = new ModelSync();

            if (!ms.TableExists(db))
                ms.CreateTable(db);

            var msl = ms.List<ModelSync>(db);



            var assemblies = AppDomain.CurrentDomain.GetAssemblies();

            foreach (var assembly in assemblies)
            {
                var types = assembly.GetTypes().Where(t => t.IsDefined(typeof(Table), true));
                foreach (var t in types)
                {
                    var model = (BaseModel?)Activator.CreateInstance(t);
                    if (model != null)
                    {
                        ms = GetModelSyncByName(msl, t.Name);
                        //if (ms == null || string.IsNullOrEmpty(ms.Sig) || ms.Sig != model.GetHashCode().ToString())
                        {
                            if (ms == null)
                            {
                                ms = new ModelSync();
                                ms.Name = t.Name;
                                ms.ID = ms.Insert(db);
                            }

                            Console.WriteLine("Sync: " + t.Name);
                            model.SyncStructure(db);
                            ms.Sig = model.GetStructureSig();
                            ms.Update(db);

                        }
                    }
                }
            }
        }

        public static ModelSync? GetModelSyncByName(List<ModelSync> list, string name)
        {
            foreach (var i in list)
            {
                if (i.Name == name)
                    return i;
            }
            return null;
        }

    }
}
