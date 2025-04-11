using Newtonsoft.Json;
using Ubriaco.Attributes;
using Ubriaco.Data;

namespace MarketplaceData.Models;

[Table("datasnapshot")]
public class DataSnapshot : MasterModel
{
    public string ModelName { get; set; } = string.Empty;
    public long RecordID { get; set; }
    [VariableInfo("TEXT")]
    public string Data { get; set; } = string.Empty;

    public override void CreateIndexes(BaseConnection db)
    {
        base.CreateIndexes(db);
        TryCreateIndex(db, "ModelName");
        TryCreateIndex(db, "ModelName,RecordID");
        TryCreateIndex(db, "RecordID");
    }

    public static async Task CaptureAsync(Database db, string modelName, long recordID, object data)
    {
        var snap = new DataSnapshot
        {
            ModelName = modelName,
            RecordID = recordID,
            Data = JsonConvert.SerializeObject(data)
        };
        await snap.SaveAsync(db);
    }

    public static async Task CaptureAsync(Database db, string modelName, long recordID, string data)
    {
        var snap = new DataSnapshot
        {
            ModelName = modelName,
            RecordID = recordID,
            Data = data
        };
        await snap.SaveAsync(db);
    }
}