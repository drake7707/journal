using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Net;
using System.Runtime.InteropServices;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using HtmlAgilityPack;
using Journal.Domain;
using Journal.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Journal.Controllers
{
    [Route("api")]
    [ApiController]
    public class ApiController : ControllerBase
    {
        private readonly DALManager dalManager;
        private readonly WebSocketManager webSocketManager;

        public ApiController(DALManager dalManager, WebSocketManager webSocketManager)
        {
            this.dalManager = dalManager;
            this.webSocketManager = webSocketManager;
        }

        [HttpGet("day")]
        public IActionResult GetDay(string day)
        {
            DayData entry = GetDayEntry(day);

            return new JsonResult(new
            {
                success = true,
                data = entry
            });
        }

        private DayData GetDayEntry(string day)
        {
            var entry = dalManager.GetEntry(day);
            if (entry == null)
            {
                return new DayData()
                {
                    Content = "",
                    Date = day,
                    Mood = MoodEnum.Neutral,
                    Tags = new string[0]
                };
            }
            else
            {
                return new DayData()
                {
                    Content = dalManager.GetEntryContents(entry),
                    Date = entry.Day,
                    Mood = entry.Mood,
                    Version = entry.Version,
                    Tags = (entry.Tags + "").Split(','),

                };
            }
        }

        [HttpDelete("day")]
        public IActionResult DeleteDay([FromBody] string day)
        {
            var result = dalManager.DeleteEntry(day);
            return Ok(new
            {
                success = result
            });
        }

        [HttpPost("day")]
        public IActionResult PostDay([FromBody] DayData data)
        {
            var entry = dalManager.GetEntry(data.Date);
            if (entry == null)
            {
                entry = new DayEntry()
                {
                    Day = data.Date,
                    Tags = ""
                };
            }
            else
            {
                if (entry.Version >= data.Version)
                {
                    return Ok(new
                    {
                        success = false,
                        message = "Entry is out of date"
                    });
                }
            }


            entry.Mood = data.Mood;
            entry.Version = data.Version;
            entry.Tags = string.Join(",", data.Tags.Where(t => !string.IsNullOrWhiteSpace(t)));


            // prepare clean text to insert in FTS5 virtual table
            HtmlDocument mainDoc = new HtmlDocument();
            string preparedText = data.Content.Replace("<p>", "\n").Replace("</p>", "");
            mainDoc.LoadHtml(HtmlEntity.DeEntitize(preparedText));
            string cleanText = mainDoc.DocumentNode.InnerText;


            int imageCount = Regex.Matches(data.Content, @"<\s*img(.*?)\s*(?:>|/>)").Count;
            int wordCount = !string.IsNullOrEmpty(cleanText) ? Regex.Matches(cleanText, @"\b(\w+)\b").Count : 0;

            entry.ImageCount = imageCount;
            entry.WordCount = wordCount;

            dalManager.SetEntry(entry, data.Content, cleanText);

            return Ok(new
            {
                success = true
            });

        }

        public class PhotoRequest
        {
            public string Photo { get; set; }
        }

        [HttpPost("photo")]
        public IActionResult PostPhoto([FromBody] PhotoRequest req)
        {
            if (webSocketManager.OpenConnections == 0)
            {
                return Ok(new
                {
                    success = false,
                    message = "There are no open journal pages listening, open a journal in a separate tab or device first"
                });
            }

            webSocketManager.Send(JsonSerializer.Serialize(req));

            return Ok(new
            {
                success = true
            });
        }

        [HttpGet("search")]
        public IActionResult GetSearch(string keywords, string prefix, string postfix)
        {
            var result = dalManager.SearchEntries(keywords, prefix, postfix);

            return Ok(new
            {
                success = true,
                data = result
            });
        }


        [HttpGet("year")]
        public IActionResult GetYear(int year)
        {
            var entries = dalManager.GetEntries().Where(e => e.Day.StartsWith(year.ToString("0000"))).OrderBy(e => e.Day);

            //var entriesPerMonth = entries.GroupBy(e => int.Parse(e.Day.Split('-')[1])).ToDictionary(g => g.Key, g => g.ToList());

            return Ok(new
            {
                success = true,
                data = entries.Select(e => new { id = e.Id, imageCount = e.ImageCount, wordCount = e.WordCount, day = e.Day, mood = e.Mood, tags = e.Tags.Split(',') }).ToList()
            });
        }


        [HttpGet("image")]
        public IActionResult GetImage(string day, int index)
        {
            var entry = dalManager.GetEntry(day);
            if (entry.ImageCount > 0)
            {
                var content = dalManager.GetEntryContents(entry);
                var doc = new HtmlAgilityPack.HtmlDocument();
                doc.LoadHtml(content);
                var imageNodes = doc.DocumentNode.SelectNodes("//img");

                if (index >= 0 && index < imageNodes.Count)
                {
                    var imgSettings = new ImageSettings() { CreateThumb = false };
                    var galleryImage = GetGalleryImage(day, index, imgSettings, imageNodes[index]);

                    return Ok(new
                    {
                        success = true,
                        data = galleryImage
                    });
                }
                else
                {
                    return Ok(new
                    {
                        success = false,
                        message = "Index out of range"
                    });
                }
            }
            else
            {
                return Ok(new
                {
                    success = false,
                    message = "No images on given day"
                });
            }

        }

        class GalleryImage
        {
            public bool IsThumb { get; set; }

            public string Day { get; set; }
            public bool IsEmbedded { get; set; }
            public string Data { get; set; }
            public string ExternalSource { get; set; }

            public int Index { get; set; }
            public string Caption { get; internal set; }
        }

        [HttpGet("imageThumbs")]
        public IActionResult GetImageThumbs(string day, int width, int height, bool contain)
        {
            var entry = dalManager.GetEntry(day);
            if (entry.ImageCount > 0)
            {
                var content = dalManager.GetEntryContents(entry);
                var doc = new HtmlAgilityPack.HtmlDocument();
                doc.LoadHtml(content);
                var imageNodes = doc.DocumentNode.SelectNodes("//img");

                List<GalleryImage> thumbs = new List<GalleryImage>();
                int idx = 0;

                var imgSettings = new ImageSettings() { CreateThumb = true, ThumbWidth = width, ThumbHeight = height, ThumbContain = contain };
                foreach (var img in imageNodes)
                {
                    var galleryImage = GetGalleryImage(day, idx, imgSettings, img);
                    if (galleryImage != null)
                        thumbs.Add(galleryImage);
                    idx++;
                }
                return Ok(new
                {
                    success = true,
                    data = thumbs
                });
            }
            else
            {
                return Ok(new
                {
                    success = true,
                    data = new object[0]
                });
            }
        }


        class ImageSettings
        {
            public bool CreateThumb { get; set; }
            public int ThumbWidth { get; set; }
            public int ThumbHeight { get; set; }
            public bool ThumbContain { get; set; }

        }

        private static GalleryImage GetGalleryImage(string day, int idx, ImageSettings settings, HtmlNode img)
        {
            var src = img.GetAttributeValue("src", "");

            var caption = img.ParentNode?.SelectSingleNode("figcaption")?.InnerText;

            if (src.StartsWith("http"))
            {
                // download image
                if (settings.CreateThumb)
                {
                    try
                    {

                        var webclient = new WebClient();
                        var bytes = webclient.DownloadData(src);
                        using (MemoryStream ms = new MemoryStream(bytes))
                        {
                            using (MemoryStream thumbStream = new MemoryStream())
                            {
                                ThumbCreator.GenerateThumbs(ms, thumbStream, settings.ThumbWidth, settings.ThumbHeight, !settings.ThumbContain);
                                string thumbBase64 = Convert.ToBase64String(thumbStream.ToArray());
                                return new GalleryImage()
                                {
                                    Data = "data:image/png;base64," + thumbBase64,
                                    Day = day,
                                    IsEmbedded = false,
                                    ExternalSource = src,
                                    Index = idx,
                                    Caption = caption,
                                    IsThumb = true
                                };
                            }
                        }

                    }
                    catch (Exception ex)
                    {
                        Console.Error.WriteLine("Warning: could not generate thumbnail for " + src + " : " + ex.GetType().FullName + " - " + ex.Message);
                        return new GalleryImage()
                        {
                            Data = "",
                            Day = day,
                            IsEmbedded = false,
                            ExternalSource = src,
                            Index = idx,
                            IsThumb = true,
                            Caption = caption
                        };
                    }
                }
                else
                {
                    return new GalleryImage()
                    {
                        IsThumb = false,
                        Data = "",
                        Day = day,
                        IsEmbedded = false,
                        ExternalSource = src,
                        Index = idx,
                        Caption = caption
                    };
                }

            }
            else if (src.StartsWith("data:"))
            {
                if (settings.CreateThumb)
                {
                    try
                    {
                        using (MemoryStream ms = new MemoryStream(Convert.FromBase64String(src.Substring(src.IndexOf(",") + 1))))
                        {
                            using (MemoryStream thumbStream = new MemoryStream())
                            {
                                ThumbCreator.GenerateThumbs(ms, thumbStream, settings.ThumbWidth, settings.ThumbHeight, !settings.ThumbContain);
                                string thumbBase64 = Convert.ToBase64String(thumbStream.ToArray());
                                return new GalleryImage()
                                {
                                    IsThumb = true,
                                    Data = "data:image/png;base64," + thumbBase64,
                                    Day = day,
                                    IsEmbedded = true,
                                    ExternalSource = null,
                                    Index = idx,
                                    Caption = caption
                                };
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.Error.WriteLine("Warning: could not generate thumbnail for embedded image: " + ex.GetType().FullName + " - " + ex.Message);
                        return new GalleryImage()
                        {
                            IsThumb = true,
                            Data = "",
                            Day = day,
                            IsEmbedded = false,
                            ExternalSource = src,
                            Index = idx,
                            Caption = caption
                        };
                    }
                }
                else
                {
                    return new GalleryImage()
                    {
                        Data = src,
                        Day = day,
                        IsEmbedded = true,
                        ExternalSource = null,
                        Index = idx,
                        IsThumb = false,
                        Caption = caption
                    };
                }
            }

            return null;
        }
    }
}