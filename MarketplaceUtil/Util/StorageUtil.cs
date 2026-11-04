/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Google.Cloud.Storage.V1;
using MarketplaceData;
using MarketplaceData.Models;
using SkiaSharp;
using System.Net;
using System.Net.Sockets;

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
                        tms.Position = 0;
                        client.UploadObject(BucketName, ident, "application/octet-stream", tms,
                            new UploadObjectOptions { IfGenerationMatch = 0 });
                        using (var db = new Database())
                        {
                            var si = new StorageItem();
                            si.Ident = ident;
                            si.MimeType = mimeType;
                            si.OriginalFileName = originalName;
                            si.UserID = userID;
                            if (!string.IsNullOrWhiteSpace(originalName))
                                si.Ext = Path.GetExtension(originalName);
                            if (si.MimeType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
                                GenerateThumbnail(client, si, tms, squareThumb);
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

        private static readonly HttpClient ImageClient = new(new SocketsHttpHandler
        {
            AllowAutoRedirect = false,
            UseProxy = false,
            ConnectCallback = async (context, cancellationToken) =>
            {
                var addresses = await Dns.GetHostAddressesAsync(context.DnsEndPoint.Host, cancellationToken);
                foreach (var address in addresses.Where(IsPublicIPv4))
                {
                    var socket = new Socket(address.AddressFamily, SocketType.Stream, ProtocolType.Tcp);
                    try
                    {
                        await socket.ConnectAsync(new IPEndPoint(address, context.DnsEndPoint.Port), cancellationToken);
                        return new NetworkStream(socket, ownsSocket: true);
                    }
                    catch (SocketException)
                    {
                        socket.Dispose();
                    }
                    catch
                    {
                        socket.Dispose();
                        throw;
                    }
                }

                throw new HttpRequestException("The image host has no reachable public IPv4 address.");
            }
        });

        private static bool IsPublicIPv4(IPAddress address)
        {
            if (address.AddressFamily != AddressFamily.InterNetwork)
                return false;

            var b = address.GetAddressBytes();
            return b[0] is not (0 or 10 or 127) && b[0] < 224 &&
                !(b[0] == 100 && b[1] is >= 64 and <= 127) &&
                !(b[0] == 169 && b[1] == 254) &&
                !(b[0] == 172 && b[1] is >= 16 and <= 31) &&
                !(b[0] == 192 && (b[1] is 0 or 168 || b[1] == 88 && b[2] == 99)) &&
                !(b[0] == 198 && (b[1] is 18 or 19 || b[1] == 51 && b[2] == 100)) &&
                !(b[0] == 203 && b[1] == 0 && b[2] == 113);
        }

        public static async Task<StorageItem> PutFromURL(string url, string ident, bool squareThumb = false, long userID = 0)
        {
            if (!Uri.TryCreate(url, UriKind.Absolute, out var uri) ||
                uri.Scheme != Uri.UriSchemeHttps || !uri.IsDefaultPort ||
                uri.UserInfo.Length != 0 ||
                Config.I.Storage?.ImageImportHosts?.Contains(uri.IdnHost, StringComparer.OrdinalIgnoreCase) != true)
                throw new InvalidOperationException("The image URL is outside the configured HTTPS hosts.");

            const int maxBytes = 10_000_000;
            using var timeout = new CancellationTokenSource(TimeSpan.FromSeconds(30));
            using var response = await ImageClient.GetAsync(uri, HttpCompletionOption.ResponseHeadersRead, timeout.Token);
            response.EnsureSuccessStatusCode();

            var mime = response.Content.Headers.ContentType?.MediaType;
            if (mime is not ("image/jpeg" or "image/png" or "image/gif" or "image/webp" or "image/bmp") ||
                response.Content.Headers.ContentLength > maxBytes)
                throw new InvalidOperationException("Unsupported image type or size.");

            using var source = await response.Content.ReadAsStreamAsync(timeout.Token);
            using var image = new MemoryStream();
            var buffer = new byte[81920];
            int read;
            while ((read = await source.ReadAsync(buffer.AsMemory(), timeout.Token)) != 0)
            {
                if (image.Length + read > maxBytes)
                    throw new InvalidOperationException("The image exceeds the import size limit.");
                image.Write(buffer, 0, read);
            }
            image.Position = 0;

            return Put(image, ident, mime, Path.GetFileName(uri.AbsolutePath), squareThumb, userID);
        }

        private static void GenerateThumbnail(StorageClient client, StorageItem item, MemoryStream content, bool square)
        {
            try
            {
                using var encoded = SKData.CreateCopy(content.ToArray());
                using var codec = SKCodec.Create(encoded);
                if (codec == null || (long)codec.Info.Width * codec.Info.Height > 25_000_000)
                    return;

                using var source = SKBitmap.Decode(codec);
                if (source == null)
                    return;

                var width = source.Width;
                var height = source.Height;
                var side = Math.Min(width, height);
                using var cropped = new SKBitmap();
                if (square && !source.ExtractSubset(cropped,
                    SKRectI.Create((width - side) / 2, (height - side) / 2, side, side)))
                    return;

                var input = square ? cropped : source;
                var scale = Math.Min(1d, 500d / Math.Max(input.Width, input.Height));
                var size = new SKImageInfo(Math.Max(1, (int)(input.Width * scale)),
                    Math.Max(1, (int)(input.Height * scale)));
                using var resized = input.Resize(size, SKFilterQuality.Medium);
                if (resized == null)
                    return;

                using var jpeg = resized.Encode(SKEncodedImageFormat.Jpeg, 70);
                using var stream = new MemoryStream();
                jpeg.SaveTo(stream);
                stream.Position = 0;
                client.UploadObject(BucketName, item.ThumbIdent, "image/jpeg", stream,
                    new UploadObjectOptions { IfGenerationMatch = 0 });
                item.HasThumb = true;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Storage thumbnail failed: " + ex.Message);
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
