/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Marketplace;
using Marketplace.Controllers;
using MarketplaceData;
using MarketplaceData.Models;
using MarketplaceData.Models.WaiterNet;
using Microsoft.AspNetCore.Mvc;
using QRCoder;

namespace WaiterNet.Controllers
{
    [ApiController]
    [Route("api/waiter/qr")]
    public class WaiterQRController : BaseController
    {
        [HttpGet("list")]
        public IActionResult GetList()
        {
            if(CurrentUser == null)
                return BASE(1, "Not logged in.");

            using(var db = new Database())
            {
                var se = SessionExtra.Get(db, CurrentUser);
                if(se == null)
                   return BASE(3, "Session extra not present.");
                
                var vendor = Vendor.GetFromID<Vendor>(db, se.ActiveVendorID);
                if(vendor == null)
                    return BASE(2, "Vendor not found.");

                if(!vendor.CanEdit(db, CurrentUser))
                    return BASE(2, "No access to vendor.");

                var list = new MenuQR() { VendorID = vendor.ID }.List<MenuQR>(db, "VendorID");

                var mainqr = new MenuQR() { VendorID = vendor.ID, TableID = 0 };
                if(!mainqr.Select(db, "VendorID,TableID"))
                {
                    mainqr.Name = "Main";
                    mainqr.VendorID = vendor.ID;
                    mainqr.TableID = 0;
                    mainqr.ID = mainqr.Insert(db);
                    list.Insert(0, mainqr);
                }

                var check = list.First<MenuQR>(i => i.TableID == 0);
                if(check != null)
                {
                    if(list.IndexOf(check) > 0)
                    {
                        list.Remove(check);
                        list.Insert(0, check);
                    }
                }


                return LIST(list);
            }
        }

        [HttpGet("get")]
        public IActionResult Get([FromQuery] string ident)
        {
            using (var db = new Database())
            {
                var item = new MenuQR() { Ident = ident };
                if (!item.Select(db, "Ident"))
                    return BASE(3, "QR not found.");



                return ITEM(item);
            }
        }

        [HttpGet("print/{id}")]
        public IActionResult GetPrint([FromRoute] long id)
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");

            using (var db = new Database())
            {
                var se = SessionExtra.Get(db, CurrentUser);
                if (se == null)
                    return BASE(3, "Session extra not present.");

                var vendor = Vendor.GetFromID<Vendor>(db, se.ActiveVendorID);
                if (vendor == null)
                    return BASE(2, "Vendor not found.");

                if (!vendor.CanEdit(db, CurrentUser))
                    return BASE(2, "No access to vendor.");

                var item = MenuQR.GetFromID<MenuQR>(db, id);
                if (item == null)
                    return BASE(3, "QR not found.");

                if (item.VendorID != vendor.ID)
                    return BASE(3, "Not your QR code.");

                var body = System.IO.File.ReadAllText("const/qr.html");

                body = body.Replace("{QR.URL}", "/api/waiter/qr/render/" + item.ID)
                    .Replace("{Vendor.Name}", vendor.Name)
                    .Replace("{Table.Name}", item.TableID != 0 ? item.Name : "");

                return Content(body, "text/html");
            }
        }

        [HttpGet("render/{id}")]
        public IActionResult GetRender([FromRoute] long id)
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");

            using (var db = new Database())
            {
                var se = SessionExtra.Get(db, CurrentUser);
                if (se == null)
                    return BASE(3, "Session extra not present.");

                var vendor = Vendor.GetFromID<Vendor>(db, se.ActiveVendorID);
                if (vendor == null)
                    return BASE(2, "Vendor not found.");

                if (!vendor.CanEdit(db, CurrentUser))
                    return BASE(2, "No access to vendor.");

                var item = MenuQR.GetFromID<MenuQR>(db, id);
                if (item == null)
                    return BASE(3, "QR not found.");

                if (item.VendorID != vendor.ID)
                    return BASE(3, "Not your QR code.");

                var gen = new QRCodeGenerator();
                var info = gen.CreateQrCode(Config.I.AppUrl + "/qr/" + item.Ident, QRCodeGenerator.ECCLevel.Q);
                var qr = new QRCoder.PngByteQRCode(info);
                var png = qr.GetGraphic(20);


                return File(png, "image/png");

            }

        }
    }
}