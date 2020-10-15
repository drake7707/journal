using System;
using System.Collections.Generic;
using System.Linq;
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

    }
}