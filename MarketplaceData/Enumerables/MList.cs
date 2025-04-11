/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Ubriaco.Models;

namespace MarketplaceData.Enumerables
{
    public class MList<L> : List<L>
    {

        public List<T> GetView<T>() 
        {
            var list = (List<T>?)Activator.CreateInstance(typeof(List<T>));
            if (list == null)
                throw new Exception("Could not create view list.");
            foreach(var i in this)
            {
                var viewModel = Activator.CreateInstance<T>();
                if (viewModel != null)
                {
                    var props = viewModel.GetType().GetProperties();
                
                    foreach (var prop in props)
                    {
                        if(prop.CanWrite)
                            prop.SetValue(viewModel, prop.GetValue(i));
                    }
                    list.Add(viewModel);
                }
            }
            return list;
        }

    }
}
