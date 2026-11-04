/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Marketplace.Models.Responses;
using Marketplace.Util;
using MarketplaceData;
using MarketplaceData.Models;
using MarketplaceData.Util;
using MarketplaceUtil.Util;
using Microsoft.AspNetCore.Mvc;

namespace Marketplace.Controllers
{
    [ApiController]
    [Route("api/cart")]
    public class CartController : BaseController
    {
        [HttpGet("get")]
        public async Task<IActionResult> Get()
        {
            var cart = CartUtil.GetData(HttpContext, CurrentUser);
            cart.Products = new List<ProductView>();
            using (var db = await Database.CreateAsync())
            {
                foreach (var i in cart.List)
                {
                    var item = db.GetProductWithImage(i.ProductID);
                    if (item != null)
                    {
                        if (CurrentUser != null && CurrentUser.Address != null)
                            TaxUtil.CalculateTaxes(db, i, CurrentUser.Address);
                        item.Cart = i;
                        item.CalculateCart();
                        cart.Products.Add(item);
                    }
                }
            }

            return ITEM(cart);
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetList()
        {
            var cartList = CartUtil.GetList(HttpContext, CurrentUser);
            var list = new List<ProductView>();
            using (var db = await Database.CreateAsync())
            {
                foreach (var i in cartList)
                {
                    var item = db.GetProductWithImage(i.ProductID);
                    if (item != null)
                    {
                        if (CurrentUser != null && CurrentUser.Address != null)
                            TaxUtil.CalculateTaxes(db, i, CurrentUser.Address);
                        item.Cart = i;
                        item.CalculateCart();
                        list.Add(item);
                    }
                }
            }

            return Ok(new ListResponse(list));
        }

        [HttpGet("step")]
        public async Task<IActionResult> GetStep()
        {
            var cart = CartUtil.GetData(HttpContext, CurrentUser);
            return ITEM(cart.Step);
        }

        [HttpGet("order")]
        public async Task<IActionResult> GetOrder()
        {
            var cart = CartUtil.GetData(HttpContext, CurrentUser);
            if (cart.Order == null)
                return BASE(2, "No order.");
            return ITEM(cart.Order);
        }

        [HttpPost("step/1")]
        public async Task<IActionResult> PostStep1()
        {
            CartUtil.SetStep(HttpContext, 2, CurrentUser);
            return BASE();
        }

        [HttpPost("step/2")]
        public async Task<IActionResult> PostStep2([FromBody] Order req)
        {
            string[] errors;
            if (!req.ShippingAddress.Validate(out errors))
                return BASE(2, "Shipping Address: " + string.Join(", ", errors));
            if (!req.BillingAddress.Same && !req.BillingAddress.Validate(out errors))
                return BASE(2, "Billing Address: " + string.Join(", ", errors));

            var cart = CartUtil.GetData(HttpContext, CurrentUser);

            if (cart.Order == null)
                cart.Order = new Order();

            cart.Order.Ident ??= Guid.NewGuid().ToString();
            cart.Order.ShippingAddress = req.ShippingAddress;
            cart.Order.BillingAddress = req.BillingAddress;

            CartUtil.SetStep(HttpContext, 3, CurrentUser, cart.Order);
            return BASE();
        }

        [HttpPost("step/3")]
        public async Task<IActionResult> PostStep3([FromBody] Order req)
        {
            var cart = CartUtil.GetData(HttpContext, CurrentUser);
            if (cart.Order == null)
                return BASE(2, "Order is null.");

            if (string.IsNullOrEmpty(req.ShippingType))
                return BASE(3, "Shipping Type is null.");

            DeliveryUtil dutil;
            try
            {
                dutil = DeliveryUtil.GetUtil(req.ShippingType);
            }
            catch
            {
                return BASE(4, "Invalid shipping type.");
            }
            cart.Order.ClientDate = req.ClientDate;
            using (var db = await Database.CreateAsync())
            {
                cart.Order.ShippingAmount = await ShippingUtil.CalculateCart(db, cart);
            }
            if (cart.Order.ShippingAmount < 0)
                return BASE(3, "Delivery address is not in service area.");

            CartUtil.SetStep(HttpContext, 4, CurrentUser, cart.Order, cart.List);
            return BASE();
        }

        [HttpPost("add")]
        public async Task<IActionResult> PostAdd([FromBody] CartProduct req)
        {
            if (req.ProductID <= 0 || req.Quantity <= 0)
                return BASE(2, "Product and positive quantity are required.");

            CartUtil.Add(HttpContext, req, CurrentUser);
            return Ok(new BaseResponse());
        }

        [HttpPost("remove")]
        public async Task<IActionResult> PostRemove([FromBody] CartProduct req)
        {
            CartUtil.Remove(HttpContext, req, CurrentUser);
            return Ok(new BaseResponse());
        }

        [HttpPost("update")]
        public async Task<IActionResult> PostUpdate([FromBody] CartProduct req)
        {
            if (req.ProductID <= 0 || req.Quantity <= 0)
                return BASE(2, "Product and positive quantity are required.");

            CartUtil.Update(HttpContext, req, CurrentUser);
            return Ok(new BaseResponse());
        }

        [HttpGet("vendors")]
        public async Task<IActionResult> GetVendors()
        {
            var cart = CartUtil.GetData(HttpContext, CurrentUser);
            using (var db = await Database.CreateAsync())
            {
                var list = cart.GetVendors(db);                
                return LIST(list);
            }
        }
    }
}
