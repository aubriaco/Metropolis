/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Google.Cloud.Storage.V1;
using MarketplaceData;
using MarketplaceData.Models;
using SkiaSharp;

namespace Marketplace.Util
{
    public class StorageUtil
    {
        private static string? BucketName;
        public static void Init(string fileName = "google-cloud.json", string bucketName = "default")
        {
            Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", fileName);
            BucketName = bucketName;
        }

        public static StorageItem Put(Stream st, string ident, string mimeType = "application/unknown", string? originalName = null, bool squareThumb = false, long userID = 0)
        {
            try
            {
                using (var client = StorageClient.Create())
                {
                    using (var tms = new MemoryStream())
                    {
                        st.CopyTo(tms);
                        var obj = client.UploadObject(BucketName, ident, null, st);
                        using (var db = new Database())
                        {
                            var si = new StorageItem();
                            si.Ident = ident;
                            si.MimeType = mimeType;
                            si.OriginalFileName = originalName;
                            si.UserID = userID;
                            if (!string.IsNullOrWhiteSpace(originalName))
                                si.Ext = Path.GetExtension(originalName);
                            if (si.MimeType.StartsWith("image/"))
                            {
                                if(squareThumb)
                                    GenerateSquareThumb(client, si, tms);
                                else
                                    GenerateRelativeThumb(client, si, tms);
                            }
                            si.ID = si.Insert(db);
                            return si;
                        }
                    }
                }
            }
            catch (Exception e)
            {
                throw e;
                return null;
            }
        }

        public static async Task<StorageItem> PutFromURL(string url, string ident, bool squareThumb = false, long userID = 0)
        {
            try
            {
                using(var client = new HttpClient())
                {
                    var resp = await client.GetAsync(url);
                    if(resp.IsSuccessStatusCode)
                    {
                        using(var st = await resp.Content.ReadAsStreamAsync())
                        {
                            string? contentType = resp.Content.Headers.ContentType != null ? resp.Content.Headers.ContentType.MediaType : null;
                            if(string.IsNullOrWhiteSpace(contentType))
                                contentType = "application/unknown";
                            string? fileName = resp.Content.Headers.ContentDisposition != null ? resp.Content.Headers.ContentDisposition.FileName : null;
                            if(string.IsNullOrWhiteSpace(fileName))
                                fileName = "unknown.file";
                            return StorageUtil.Put(st, ident, contentType, fileName, squareThumb, userID);
                        }
                    }
                    else
                        throw new Exception("Could not download image from URL.");
                }
            }
            catch (Exception e)
            {
                throw e;
                return null;
            }
        }

        private static void GenerateRelativeThumb(StorageClient client, StorageItem si, MemoryStream tms)
        {
            try
            {
                using (var srcImage = SKImage.FromEncodedData(tms.ToArray()))
                {
                    if (srcImage != null)
                    {
                        using (var srcBmp = SKBitmap.FromImage(srcImage))
                        {
                            if (srcBmp != null)
                            {
                                int max = 500;
                                int width = srcBmp.Width;
                                int height = srcBmp.Height;

                                if (srcBmp.Width >= srcBmp.Height)
                                {
                                    if (srcBmp.Width > max)
                                    {
                                        double ratio = max / (double)srcBmp.Width;
                                        width = 500;
                                        height = (int)((double)srcBmp.Height * ratio);
                                    }
                                }
                                else
                                {
                                    if (srcBmp.Height > max)
                                    {
                                        double ratio = max / (double)srcBmp.Height;
                                        height = 500;
                                        width = (int)((double)srcBmp.Width * ratio);
                                    }
                                }


                                var scaledBmp = srcBmp.Resize(new SkiaSharp.SKImageInfo(width, height), SKFilterQuality.Medium);

                                using (var thumb = scaledBmp.Encode(SKEncodedImageFormat.Jpeg, 70))
                                {
                                    using (var ms = new MemoryStream())
                                    {
                                        thumb.SaveTo(ms);
                                        ms.Flush();
                                        var tobj = client.UploadObject(BucketName, si.ThumbIdent, null, ms);
                                        si.HasThumb = true;
                                    }
                                }
                            }
                            else
                                Console.WriteLine("Could not load bitmap from image.");
                        }
                    }
                    else
                        Console.WriteLine("Could not load image from stream.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("StorageUtil.Put Warning: " + ex.Message);
            }
        }

        private static void GenerateSquareThumb(StorageClient client, StorageItem si, MemoryStream tms)
        {
            try
            {
                using (var srcImage = SKImage.FromEncodedData(tms.ToArray()))
                {
                    if (srcImage != null)
                    {
                        using (var srcBmp = SKBitmap.FromImage(srcImage))
                        {
                            if (srcBmp != null)
                            {
                                int max = 500;
                                int width = srcBmp.Width;
                                int height = srcBmp.Height;

                                if (srcBmp.Width >= srcBmp.Height)
                                {
                                    if (srcBmp.Width > max)
                                    {
                                        double ratio = max / (double)srcBmp.Width;
                                        width = 800;
                                        height = (int)((double)srcBmp.Height * ratio);
                                    }
                                }
                                else
                                {
                                    if (srcBmp.Height > max)
                                    {
                                        double ratio = max / (double)srcBmp.Height;
                                        height = 800;
                                        width = (int)((double)srcBmp.Width * ratio);
                                    }
                                }


                                var scaledBmp = srcBmp.Resize(new SkiaSharp.SKImageInfo(width, height), SKFilterQuality.Medium);
                                if(width > height)
                                {
                                    int delta = (width - height)/2;
                                    var croppedBmp = new SKBitmap(height, height);
                                    scaledBmp.ExtractSubset(croppedBmp, new SKRectI(delta, 0, width-delta, height));
                                    scaledBmp = croppedBmp;
                                }
                                else if(height > width)
                                {
                                    int delta = (height - width)/2;
                                    var croppedBmp = new SKBitmap(width, width);
                                    scaledBmp.ExtractSubset(croppedBmp, new SKRectI(0, delta, width, height-delta));
                                    scaledBmp = croppedBmp;
                                }
                                using (var thumb = scaledBmp.Encode(SKEncodedImageFormat.Jpeg, 70))
                                {
                                    using (var ms = new MemoryStream())
                                    {
                                        thumb.SaveTo(ms);
                                        ms.Flush();
                                        var tobj = client.UploadObject(BucketName, si.ThumbIdent, null, ms);
                                        si.HasThumb = true;
                                    }
                                }
                            }
                            else
                                Console.WriteLine("Could not load bitmap from image.");
                        }
                    }
                    else
                        Console.WriteLine("Could not load image from stream.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("StorageUtil.Put Warning: " + ex.Message);
            }
        }

        public static bool Get(string ident, Stream st)
        {
            try
            {
                using (var client = StorageClient.Create())
                {
                    var obj = client.DownloadObject(BucketName, ident, st);
                    return true;
                }
            }
            catch
            {
                return false;
            }
        }

        public static bool Delete(string ident)
        {
            try
            {
                using (var client = StorageClient.Create())
                {
                    client.DeleteObject(BucketName, ident);
                    using (var db = new Database())
                    {
                        var si = StorageItem.GetFromIdent(db, ident);
                        if (si != null)
                        {
                            si.IsDeleted = true;
                            si.Update(db, "IsDeleted");
                        }
                    }
                    return true;
                }
            }
            catch
            {
                return false;
            }
        }

        public static string GetMimeTypeFromExt(string ext)
        {
            ext = ext.ToLower();
            if (ext == "jpg")
                return "image/jpeg";
            else if (ext == "png" || ext == "bmp" || ext == "tiff")
                return "image/" + ext;
            else if (ext == "pdf")
                return "application/" + ext;
            else if (ext == "csv")
                return "text/csv";
            else
                return "application/unknown";
        }
    }
}
