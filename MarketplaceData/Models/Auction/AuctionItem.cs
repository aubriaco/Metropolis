/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using MarketplaceData.Attributes;
using Npgsql;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Ubriaco.Attributes;
using Ubriaco.Data;

namespace MarketplaceData.Models.Auction
{
    public partial class AuctionItem : MasterModel
    {
        [PublicProp]
        public long AuctionWrapID { get; set; }

        public bool Errored { get; set; } = false;

        [VariableInfo("TEXT")]
        public string? LastError { get; set; }

        [ModelLocal]
        [PublicProp]
        public string TimeLeft
        {
            get
            {
                if (!Started)
                    return "N/A";
                if (Ended || EndDate <= DateTime.UtcNow)
                    return "Ended";
                var ts = EndDate.Subtract(DateTime.UtcNow);
                string d = ((int)ts.TotalDays).ToString();
                string h = ts.Hours.ToString().PadLeft(2, '0');
                string m = ts.Minutes.ToString().PadLeft(2, '0');
                string s = ts.Seconds.ToString().PadLeft(2, '0');
                return ((int)ts.TotalDays > 0 ? d + "d " : "") + h + ":" + m + ":" + s;
            }
        }

        [ModelLocal]
        [PublicProp]
        public bool EndingSoon
        {
            get
            {
                var ts = EndDate.Subtract(DateTime.UtcNow);
                if ((int)ts.TotalHours < 1)
                    return true;
                return false;
            }
        }

        public bool Paused { get; set; } = false;
        public DateTime PausedDate { get; set; }

        public bool Rejected { get; set; } = false;
        public DateTime RejectedDate { get; set; }

        [PublicProp]
        public decimal CurrentBid { get; set; }
        [PublicProp]
        public int BidCount { get; set; } = 0;
        public long CurrentBidUserID { get; set; } = 0;
        public long CurrentBidPaymentID { get; set; } = 0;
        [ModelLocal]
        [PublicProp]
        public string? CurrentBidUserName { get; set; }

        [ModelLocal]
        [PublicProp]
        public string CurrentBidFormatted
        {
            get
            {
                if (CurrentBid <= 0)
                    return "None";
                return CurrentBid.ToString("C");
            }
        }

        public long CreatedByUserID { get; set; }


        [ColEditable]
        public bool SelectedStart { get; set; } = false;

        [ColEditable]
        public DateTime SelectedStartDate { get; set; }

        [PublicProp]
        public bool Started { get; set; } = false;
        [PublicProp]
        public DateTime StartDate { get; set; }

        [ModelLocal]
        [PublicProp]
        public bool AwaitingStartDate
        {
            get
            {
                try
                {
                    if (StartDate > DateTime.UtcNow)
                        return true;
                }
                catch { }
                return false;
            }
        }

        [PublicProp]
        public bool Ended { get; set; } = false;
        [PublicProp]
        public DateTime EndDate { get; set; }

        [ModelLocal]
        public string Status
        {
            get
            {
                if (Ended)
                {
                    if (Errored)
                        return "Ended - Errored";
                    return "Ended";
                }
                else if (Started)
                {
                    if (Paused)
                        return "Paused";
                    else if (StartDate > DateTime.UtcNow)
                        return "Starts on: " + SelectedStartDate.ToString("MM/dd/yyyy");
                    return "Started - Active";
                }
                else
                    return "Pending";
            }
        }

        public long DisplayPhotoStorageItemID { get; set; } = 0;

        [ModelLocal]
        [PublicProp]
        public StorageItem DisplayPhoto { get; set; } = new StorageItem();

        [ColEditable]
        [ModelLocal]
        [PublicProp]
        public List<StorageItem> Photos { get; set; } = new List<StorageItem>();



        [ModelLocal]
        [PublicProp]
        public string? CreatedByUserName { get; set; }

        [ColEditable]
        [ModelLocal]
        public string _SelectedStart
        {
            get
            {
                return SelectedStart ? "True" : "False";
            }
            set
            {
                SelectedStart = Convert.ToBoolean(value);
            }
        }

        [ColEditable]
        [ModelLocal]
        public string _ReservePriceEnabled
        {
            get
            {
                return ReservePriceEnabled ? "True" : "False";
            }
            set
            {
                ReservePriceEnabled = Convert.ToBoolean(value);
            }
        }

        [ColEditable]
        [ModelLocal]
        public string _StartingBidEnabled
        {
            get
            {
                return StartingBidEnabled ? "True" : "False";
            }
            set
            {
                StartingBidEnabled = Convert.ToBoolean(value);
            }
        }

        [PublicProp]
        [ColEditable]
        public string PostalCode { get; set; }

        [ColEditable]
        [PublicProp]
        public bool ReservePriceEnabled { get; set; }
        [PublicProp]
        [ColEditable]
        public decimal ReservePrice { get; set; }

        [ColEditable]
        [PublicProp]
        public bool StartingBidEnabled { get; set; }
        [PublicProp]
        [ColEditable]
        public decimal StartingBid { get; set; }

        [ColEditable]
        public long RunTimeHours { get; set; } = 168;

        [ColEditable]
        public string FullName { get; set; }
        [ColEditable]
        public string ContactPhone { get; set; }

        public string? PurchaseCode { get; set; } = Guid.NewGuid().ToString();

        [PublicProp]
        public long MapImageID { get; set; }

        [PublicProp]
        [ModelLocal]
        public StorageItem MapImage { get; set; } = new StorageItem();

        [PublicProp]
        [ModelLocal]
        public long IsBuyNow { get; set; }

        public long VendorID { get; set; }

        public override void CreateIndexes(BaseConnection db)
        {
            base.CreateIndexes(db);
            TryExecuteCommand(db, "UPDATE " + GetDefaultTable() + " SET isbuynow=false WHERE isbuynow IS NULL");
            TryExecuteCommand(db, "UPDATE " + GetDefaultTable() + " SET vendorid=0 WHERE vendorid IS NULL");
        }

        public virtual void PullChildren(Database db)
        {
            if (MapImageID != 0)
            {
                MapImage.ID = MapImageID;
                MapImage.Select(db, "ID");
            }
        }

        public void AddBid(Database db, decimal bidAmount, long userID, long paymentID)
        {
            using (var cmd = new NpgsqlCommand(@"UPDATE " + GetDefaultTable() + " AS vh SET currentbid=@currentbid, bidcount=(CASE WHEN vh.bidcount IS NULL THEN 1 ELSE vh.bidcount END)+1, currentbiduserid=@userid, currentbidpaymentid=@paymentid WHERE id=@id", db.C))
            {
                cmd.Parameters.AddWithValue("@id", ID);
                cmd.Parameters.AddWithValue("@currentbid", bidAmount);
                cmd.Parameters.AddWithValue("@userid", userID);
                cmd.Parameters.AddWithValue("@paymentid", paymentID);
                cmd.ExecuteNonQuery();
            }
        }
    }
}
